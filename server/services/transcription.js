const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

class TranscriptionService {
    constructor() {
        // Configure timeout (default 300s for large files, configurable via env)
        const timeout = parseInt(process.env.OPENAI_API_TIMEOUT) || 300000; // 5 minutes default
        
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            timeout: timeout,
        });

        // Formats supported by Whisper API
        this.whisperSupportedFormats = ['.flac', '.m4a', '.mp3', '.mp4', '.mpeg', '.mpga', '.oga', '.ogg', '.wav', '.webm'];
        // Formats we accept (including .opus which we'll convert)
        this.supportedFormats = ['.mp3', '.wav', '.m4a', '.mp4', '.mpeg', '.mpga', '.webm', '.opus', '.ogg', '.oga', '.flac'];
        // OpenAI Whisper API has a 25MB limit (26,214,400 bytes)
        this.maxFileSize = 25 * 1024 * 1024; // 25MB in bytes (OpenAI's actual limit)
        this.chunkSize = 15 * 1024 * 1024; // 15MB chunks for slicing (smaller to account for WAV being larger)
        this.maxRetries = parseInt(process.env.OPENAI_MAX_RETRIES) || 3;
        this.retryDelay = 1000; // Initial delay in ms
    }

    /**
     * Check if format is directly supported by Whisper API
     */
    isWhisperSupported(fileExtension) {
        return this.whisperSupportedFormats.includes(fileExtension.toLowerCase());
    }

    /**
     * Get MIME type for audio file
     */
    getMimeType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.m4a': 'audio/mp4',
            '.mp4': 'audio/mp4',
            '.mpeg': 'audio/mpeg',
            '.mpga': 'audio/mpeg',
            '.webm': 'audio/webm',
            '.ogg': 'audio/ogg',
            '.oga': 'audio/ogg',
            '.flac': 'audio/flac'
        };
        return mimeTypes[ext] || 'audio/mpeg';
    }

    /**
     * Convert .opus file to .ogg format (since Whisper API supports .ogg but not .opus)
     */
    async convertOpusToOgg(opusPath) {
        const ext = path.extname(opusPath).toLowerCase();
        
        if (ext === '.opus') {
            // Create temporary .ogg file (since .opus files are often Ogg Opus)
            const oggPath = opusPath.replace(/\.opus$/i, '.ogg');
            try {
                await fs.copy(opusPath, oggPath);
                console.log(`Converted .opus to .ogg: ${path.basename(oggPath)}`);
                return { filePath: oggPath, isTemporary: true };
            } catch (error) {
                console.error('Failed to convert .opus file:', error);
                throw new Error('Could not convert .opus file. Please convert to MP3 or WAV format.');
            }
        }
        
        return { filePath: opusPath, isTemporary: false };
    }

    /**
     * Check if ffmpeg is available (for audio splitting)
     * Returns the ffmpeg command/path if available, or null
     */
    async checkFfmpegAvailable() {
        // Try with 'ffmpeg' command first (uses PATH)
        try {
            await execPromise('ffmpeg -version', { timeout: 5000 });
            return 'ffmpeg'; // Return command name if found in PATH
        } catch (error) {
            // If that fails, try common Windows installation paths
            if (process.platform === 'win32') {
                const commonPaths = [
                    path.join(process.env.LOCALAPPDATA || '', 'Microsoft\\WinGet\\Links\\ffmpeg.exe'),
                    'C:\\ffmpeg\\bin\\ffmpeg.exe',
                    'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
                    'C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe',
                ];
                
                for (const ffmpegPath of commonPaths) {
                    try {
                        if (fs.existsSync(ffmpegPath)) {
                            await execPromise(`"${ffmpegPath}" -version`, { timeout: 5000 });
                            console.log(`Found ffmpeg at: ${ffmpegPath}`);
                            return `"${ffmpegPath}"`; // Return full path with quotes
                        }
                    } catch (e) {
                        // Continue to next path
                    }
                }
            }
            return null;
        }
    }

    /**
     * Get audio duration using ffmpeg
     */
    async getAudioDuration(filePath) {
        try {
            // Try to find ffprobe (usually in same location as ffmpeg)
            let ffprobeCmd = 'ffprobe';
            const ffmpegCmd = await this.checkFfmpegAvailable();
            if (ffmpegCmd && ffmpegCmd !== 'ffmpeg' && ffmpegCmd.includes('ffmpeg.exe')) {
                // Replace ffmpeg.exe with ffprobe.exe in the path
                ffprobeCmd = ffmpegCmd.replace('ffmpeg.exe', 'ffprobe.exe');
            }
            
            const { stdout } = await execPromise(`${ffprobeCmd} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`);
            return parseFloat(stdout.trim()) || 0;
        } catch (error) {
            // Fallback: estimate based on file size (rough approximation)
            const stats = fs.statSync(filePath);
            // Rough estimate: 1MB ≈ 1 minute for compressed audio
            return (stats.size / (1024 * 1024)) * 60;
        }
    }

    /**
     * Split audio file into chunks using ffmpeg
     */
    async splitAudioFile(filePath, chunkSizeMB = 20) {
        const ffmpegCmd = await this.checkFfmpegAvailable();
        if (!ffmpegCmd) {
            throw new Error('ffmpeg is required for splitting large audio files. Please install ffmpeg (see INSTALL_FFMPEG.md)');
        }

        const fileStats = fs.statSync(filePath);
        const fileSizeMB = fileStats.size / (1024 * 1024);
        
        // Get audio duration first
        const duration = await this.getAudioDuration(filePath);
        
        // Calculate chunk duration based on target output size
        // WAV files are uncompressed: ~1.92MB per minute at 16kHz mono 16-bit
        // Formula: bytes = sample_rate * bytes_per_sample * channels * duration
        // For 16kHz, 16-bit (2 bytes), mono: 32,000 bytes/second = ~1.92MB/minute
        // For 25MB limit, we can have ~13 minutes per chunk, but use 70% for safety margin
        const sampleRate = 16000;
        const bytesPerSample = 2; // 16-bit = 2 bytes
        const channels = 1; // mono
        const wavBytesPerSecond = sampleRate * bytesPerSample * channels; // 32,000 bytes/second
        const maxChunkSizeBytes = this.maxFileSize * 0.7; // 70% of 25MB = 17.5MB for safety margin
        const maxChunkDurationSeconds = maxChunkSizeBytes / wavBytesPerSecond; // ~573 seconds = ~9.5 minutes
        const numChunks = Math.max(1, Math.ceil(duration / maxChunkDurationSeconds));
        const chunkDurationSeconds = duration / numChunks;
        
        console.log(`Splitting ${fileSizeMB.toFixed(2)}MB file (${duration.toFixed(1)}s) into ${numChunks} chunk(s) of ~${(chunkDurationSeconds / 60).toFixed(1)} minutes each...`);

        const chunkDir = path.join(path.dirname(filePath), 'chunks_' + Date.now());
        await fs.ensureDir(chunkDir);

        const chunkFiles = [];

        try {
            // Split audio into chunks
            for (let i = 0; i < numChunks; i++) {
                const startTime = i * chunkDurationSeconds;
                const chunkPath = path.join(chunkDir, `chunk_${String(i + 1).padStart(3, '0')}.mp3`);
                
                // Use ffmpeg to extract chunk (ffmpegCmd was already obtained above)
                // Use WAV format for maximum compatibility with OpenAI Whisper API
                const chunkPathWav = chunkPath.replace('.mp3', '.wav');
                const command = `${ffmpegCmd} -i "${filePath}" -ss ${startTime} -t ${chunkDurationSeconds} -acodec pcm_s16le -ar 16000 -ac 1 -f wav -y "${chunkPathWav}"`;
                
                try {
                    await execPromise(command);
                    const chunkStats = fs.statSync(chunkPathWav);
                    const chunkSizeMB = chunkStats.size / (1024 * 1024);
                    console.log(`Chunk ${i + 1}/${numChunks} created: ${chunkSizeMB.toFixed(2)}MB`);
                    
                    // Verify chunk is under 25MB limit
                    if (chunkStats.size > this.maxFileSize) {
                        console.warn(`Warning: Chunk ${i + 1} is ${chunkSizeMB.toFixed(2)}MB, which exceeds the limit. Trying to compress...`);
                        // If chunk is too large, try to compress it further or reduce duration
                        // For now, we'll throw an error and suggest manual compression
                        throw new Error(`Chunk ${i + 1} is too large (${chunkSizeMB.toFixed(2)}MB). The audio file may be too long or have high sample rate. Please compress the original file before uploading.`);
                    }
                    
                    chunkFiles.push(chunkPathWav);
                } catch (error) {
                    console.error(`Error creating chunk ${i + 1}:`, error.message);
                    throw new Error(`Failed to create audio chunk ${i + 1}: ${error.message}`);
                }
            }

            return { chunkFiles, chunkDir, isTemporary: true };
        } catch (error) {
            // Clean up on error
            try {
                await fs.remove(chunkDir);
            } catch (cleanupError) {
                console.error('Error cleaning up chunks directory:', cleanupError);
            }
            throw error;
        }
    }

    /**
     * Merge transcription results from multiple chunks
     */
    mergeChunkTranscriptions(chunkResults) {
        if (chunkResults.length === 0) {
            throw new Error('No transcription results to merge');
        }

        if (chunkResults.length === 1) {
            return chunkResults[0].transcription;
        }

        // Calculate time offsets for each chunk
        let timeOffset = 0;
        const mergedSegments = [];
        const mergedWords = [];
        let mergedText = '';
        let detectedLanguage = null;
        let totalDuration = 0;

        chunkResults.forEach((chunkResult, index) => {
            // chunkResult.transcription is the full result object from transcribeAudio
            // which has structure: { success: true, transcription: {...}, metadata: {...} }
            const result = chunkResult.transcription || {};
            const transcription = result.transcription || {};
            
            // Use language from first chunk
            if (index === 0) {
                detectedLanguage = transcription.language;
            }

            // Merge text
            if (transcription.text) {
                mergedText += (mergedText ? ' ' : '') + transcription.text;
            }

            // Merge segments with adjusted timestamps
            if (transcription.segments && Array.isArray(transcription.segments)) {
                transcription.segments.forEach(segment => {
                    mergedSegments.push({
                        ...segment,
                        id: mergedSegments.length,
                        start: segment.start + timeOffset,
                        end: segment.end + timeOffset
                    });
                });
            }

            // Merge words with adjusted timestamps
            if (transcription.words && Array.isArray(transcription.words)) {
                transcription.words.forEach(word => {
                    mergedWords.push({
                        ...word,
                        start: word.start + timeOffset,
                        end: word.end + timeOffset
                    });
                });
            }

            // Update time offset for next chunk
            if (transcription.duration) {
                timeOffset += transcription.duration;
                totalDuration += transcription.duration;
            } else if (transcription.segments && transcription.segments.length > 0) {
                // Estimate duration from last segment
                const lastSegment = transcription.segments[transcription.segments.length - 1];
                timeOffset += lastSegment.end;
                totalDuration += lastSegment.end;
            }
        });

        return {
            success: true,
            transcription: {
                text: mergedText,
                language: detectedLanguage,
                duration: totalDuration,
                segments: mergedSegments,
                words: mergedWords
            },
            metadata: {
                model: 'whisper-1',
                response_format: 'verbose_json',
                processing_time: new Date().toISOString(),
                chunks_processed: chunkResults.length,
                merged: true
            }
        };
    }

    /**
     * Validate if the audio file is supported
     */
    validateAudioFile(filePath, originalName, fileSize) {
        // Allow larger files - we'll slice them into chunks
        // But set a reasonable upper limit (e.g., 500MB)
        const absoluteMaxSize = 500 * 1024 * 1024; // 500MB
        if (fileSize > absoluteMaxSize) {
            const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
            throw new Error(`File size too large: ${fileSizeMB}MB. Maximum allowed: 500MB. Please split the file manually.`);
        }

        // Check file extension
        const fileExtension = path.extname(originalName).toLowerCase();
        if (!this.supportedFormats.includes(fileExtension)) {
            throw new Error(`Unsupported audio format: ${fileExtension}. Supported formats: ${this.supportedFormats.join(', ')}`);
        }

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new Error('Audio file not found');
        }

        return true;
    }

    /**
     * Sleep utility for retry delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Retry wrapper with exponential backoff
     */
    async retryWithBackoff(fn, retries = this.maxRetries) {
        let lastError;
        
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                
                // Don't retry on certain errors
                if (error.status === 401 || error.status === 400 || error.status === 413) {
                    throw error;
                }
                
                // If it's the last attempt, throw the error
                if (attempt === retries) {
                    break;
                }
                
                // Calculate exponential backoff delay
                const delay = this.retryDelay * Math.pow(2, attempt - 1);
                console.log(`Transcription attempt ${attempt} failed. Retrying in ${delay}ms... (Error: ${error.message})`);
                
                await this.sleep(delay);
            }
        }
        
        throw lastError;
    }

    /**
     * Transcribe audio file using OpenAI Whisper API with retry logic
     */
    async transcribeAudio(filePath, options = {}) {
        const {
            language = null,
            prompt = null,
            response_format = 'verbose_json',
            temperature = 0
        } = options;

        // Get file size for logging and error messages
        let fileSizeMB = 'unknown';
        try {
            const fileStats = fs.statSync(filePath);
            fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);
        } catch (statError) {
            console.warn('Could not get file stats:', statError);
        }
        console.log(`Starting transcription for file: ${filePath} (${fileSizeMB}MB)`);

        // Create a File-like object for OpenAI API
        // The OpenAI SDK needs proper file metadata to detect format
        const fileBuffer = await fs.readFile(filePath);
        const fileName = path.basename(filePath);
        
        // Create a File object (available in Node.js 18+)
        // If File is not available, use a stream with metadata
        let audioFile;
        if (typeof File !== 'undefined') {
            audioFile = new File([fileBuffer], fileName, { type: this.getMimeType(filePath) });
        } else {
            // Fallback: use stream but ensure filename is in the path
            // The OpenAI SDK should detect format from extension
            audioFile = fs.createReadStream(filePath);
            // Add filename property if SDK supports it
            if (audioFile.path) {
                audioFile.name = fileName;
            }
        }

        // Prepare API parameters, excluding null values
        const apiParams = {
            file: audioFile,
            model: 'whisper-1',
            response_format: response_format,
            temperature: temperature,
        };

        // Only include language if specified
        if (language) {
            apiParams.language = language;
        }

        // Only include prompt if specified (not null/empty)
        if (prompt && prompt.trim()) {
            apiParams.prompt = prompt;
        }

        try {
            // Call OpenAI Whisper API with retry logic
            const transcription = await this.retryWithBackoff(async () => {
                console.log('Calling OpenAI Whisper API...');
                const startTime = Date.now();
                const result = await this.openai.audio.transcriptions.create(apiParams);
                const duration = ((Date.now() - startTime) / 1000).toFixed(2);
                console.log(`OpenAI API call completed in ${duration}s`);
                return result;
            });

            console.log('Transcription completed successfully');

            // Process the response based on format
            if (response_format === 'verbose_json') {
                return {
                    success: true,
                    transcription: {
                        text: transcription.text,
                        language: transcription.language,
                        duration: transcription.duration,
                        segments: transcription.segments || [],
                        words: transcription.words || []
                    },
                    metadata: {
                        model: 'whisper-1',
                        response_format: response_format,
                        processing_time: new Date().toISOString()
                    }
                };
            } else {
                return {
                    success: true,
                    transcription: {
                        text: transcription,
                        language: null,
                        duration: null,
                        segments: [],
                        words: []
                    },
                    metadata: {
                        model: 'whisper-1',
                        response_format: response_format,
                        processing_time: new Date().toISOString()
                    }
                };
            }

        } catch (error) {
            console.error('Transcription error:', error);

            // Handle specific OpenAI API errors
            if (error.status === 401) {
                throw new Error('Invalid OpenAI API key');
            } else if (error.status === 413) {
                const limitMB = (26214400 / (1024 * 1024)).toFixed(0);
                throw new Error(`Audio file exceeds OpenAI's ${limitMB}MB size limit even after compression. The file may be too large to process. Please try splitting it into smaller segments manually. Maximum allowed size: ${limitMB}MB (26,214,400 bytes).`);
            } else if (error.status === 400) {
                // Check if it's a format error
                if (error.message && (error.message.includes('Invalid file format') || error.message.includes('file format'))) {
                    throw new Error('Audio file format not supported by Whisper API. Please convert to MP3, WAV, or another supported format.');
                }
                throw new Error(`Bad request: ${error.message || 'Invalid file format or parameters'}`);
            } else if (error.status === 429) {
                throw new Error('OpenAI API rate limit exceeded. Please try again later.');
            } else if (error.status === 500) {
                throw new Error('OpenAI API server error. Please try again later.');
            } else if (error.message && (error.message.includes('timeout') || error.message.includes('ETIMEDOUT'))) {
                throw new Error(`Request timeout. The audio file (${fileSizeMB}MB) may be too large or the connection is slow. Try a smaller file or check your internet connection.`);
            } else if (error.message && (error.message.includes('ECONNRESET') || error.message.includes('ECONNREFUSED') || error.message.includes('Connection error'))) {
                throw new Error(`Connection error: Unable to reach OpenAI API. Please check your internet connection, firewall settings, or VPN.`);
            }

            // Re-throw the error for generic handling
            throw new Error(`Transcription failed: ${error.message}`);
        }
    }

    /**
     * Process uploaded audio file and return transcription
     */
    async processAudioFile(filePath, originalName, fileSize, options = {}) {
        let tempFileToCleanup = [];
        
        try {
            // Validate the audio file
            this.validateAudioFile(filePath, originalName, fileSize);

            // Check if we need to convert the file format
            const fileExtension = path.extname(originalName).toLowerCase();
            let actualFilePath = filePath;
            
            // If .opus file, convert to .ogg (Whisper API supports .ogg but not .opus)
            if (fileExtension === '.opus' || !this.isWhisperSupported(fileExtension)) {
                if (fileExtension === '.opus') {
                    const conversionResult = await this.convertOpusToOgg(filePath);
                    actualFilePath = conversionResult.filePath;
                    if (conversionResult.isTemporary) {
                        tempFileToCleanup.push(actualFilePath);
                    }
                } else {
                    throw new Error(`File format ${fileExtension} is not supported by Whisper API. Supported formats: ${this.whisperSupportedFormats.join(', ')}`);
                }
            }

            // Check if file needs to be sliced into chunks
            const currentFileSize = fs.statSync(actualFilePath).size;
            let result;

            if (currentFileSize > this.maxFileSize) {
                console.log(`File size (${(currentFileSize / (1024 * 1024)).toFixed(2)}MB) exceeds limit. Slicing into chunks...`);
                
                // Split file into chunks
                const { chunkFiles, chunkDir, isTemporary } = await this.splitAudioFile(actualFilePath, 20);
                if (isTemporary) {
                    tempFileToCleanup.push(chunkDir);
                }

                // Transcribe each chunk
                const chunkResults = [];
                for (let i = 0; i < chunkFiles.length; i++) {
                    console.log(`Transcribing chunk ${i + 1}/${chunkFiles.length}...`);
                    try {
                        const chunkResult = await this.transcribeAudio(chunkFiles[i], options);
                        chunkResults.push({
                            chunkIndex: i,
                            transcription: chunkResult
                        });
                    } catch (chunkError) {
                        console.error(`Error transcribing chunk ${i + 1}:`, chunkError);
                        throw new Error(`Failed to transcribe chunk ${i + 1}: ${chunkError.message}`);
                    }
                }

                // Merge transcriptions
                console.log('Merging transcription results...');
                result = this.mergeChunkTranscriptions(chunkResults);
            } else {
                // File is within limit, transcribe normally
                result = await this.transcribeAudio(actualFilePath, options);
            }

            // Clean up temporary files if created
            for (const tempFile of tempFileToCleanup) {
                if (fs.existsSync(tempFile)) {
                    await this.cleanupFile(tempFile);
                }
            }

            return {
                ...result,
                file_info: {
                    original_name: originalName,
                    file_size: fileSize,
                    file_extension: path.extname(originalName).toLowerCase()
                }
            };

        } catch (error) {
            // Clean up temporary files on error
            for (const tempFile of tempFileToCleanup) {
                if (fs.existsSync(tempFile)) {
                    try {
                        await this.cleanupFile(tempFile);
                    } catch (cleanupError) {
                        console.error('Error cleaning up temporary file:', cleanupError);
                    }
                }
            }
            console.error('Audio processing error:', error);
            throw error;
        }
    }

    /**
     * Clean up temporary files
     */
    async cleanupFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                await fs.remove(filePath);
                console.log(`Cleaned up file: ${filePath}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`Error cleaning up file ${filePath}:`, error);
            return false;
        }
    }

    /**
     * Get transcription statistics
     */
    getTranscriptionStats(transcriptionResult) {
        if (!transcriptionResult.success || !transcriptionResult.transcription) {
            return null;
        }

        const { transcription } = transcriptionResult;

        return {
            word_count: transcription.text ? transcription.text.split(' ').length : 0,
            character_count: transcription.text ? transcription.text.length : 0,
            duration_seconds: transcription.duration || 0,
            language: transcription.language || 'unknown',
            segments_count: transcription.segments ? transcription.segments.length : 0,
            words_with_timestamps: transcription.words ? transcription.words.length : 0
        };
    }

    /**
     * Format transcription for display
     */
    formatTranscriptionForDisplay(transcriptionResult) {
        if (!transcriptionResult.success) {
            return null;
        }

        const { transcription } = transcriptionResult;
        const stats = this.getTranscriptionStats(transcriptionResult);

        return {
            text: transcription.text,
            language: transcription.language,
            duration: transcription.duration,
            statistics: stats,
            segments: transcription.segments?.map(segment => ({
                id: segment.id,
                start: segment.start,
                end: segment.end,
                text: segment.text
            })) || [],
            words: transcription.words?.map(word => ({
                word: word.word,
                start: word.start,
                end: word.end,
                confidence: word.confidence || null
            })) || []
        };
    }
}

module.exports = new TranscriptionService(); 