const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');

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
        this.maxFileSize = 50 * 1024 * 1024; // 50MB in bytes
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
     * Validate if the audio file is supported
     */
    validateAudioFile(filePath, originalName, fileSize) {
        // Check file size
        if (fileSize > this.maxFileSize) {
            throw new Error(`File size exceeds 50MB limit. Current size: ${Math.round(fileSize / (1024 * 1024))}MB`);
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

        // Create a readable stream from the file
        const audioFile = fs.createReadStream(filePath);

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
                throw new Error('Audio file too large for OpenAI API');
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
        let tempFileToCleanup = null;
        
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
                        tempFileToCleanup = actualFilePath;
                    }
                } else {
                    throw new Error(`File format ${fileExtension} is not supported by Whisper API. Supported formats: ${this.whisperSupportedFormats.join(', ')}`);
                }
            }

            // Transcribe the audio
            const result = await this.transcribeAudio(actualFilePath, options);

            // Clean up temporary file if created
            if (tempFileToCleanup && fs.existsSync(tempFileToCleanup)) {
                await this.cleanupFile(tempFileToCleanup);
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
            // Clean up temporary file on error
            if (tempFileToCleanup && fs.existsSync(tempFileToCleanup)) {
                try {
                    await this.cleanupFile(tempFileToCleanup);
                } catch (cleanupError) {
                    console.error('Error cleaning up temporary file:', cleanupError);
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