const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');

class TranscriptionService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        this.supportedFormats = ['.mp3', '.wav', '.m4a', '.mp4', '.mpeg', '.mpga', '.webm'];
        this.maxFileSize = 50 * 1024 * 1024; // 50MB in bytes
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
     * Transcribe audio file using OpenAI Whisper API
     */
    async transcribeAudio(filePath, options = {}) {
        try {
            const {
                language = null,
                prompt = null,
                response_format = 'verbose_json',
                temperature = 0
            } = options;

            console.log(`Starting transcription for file: ${filePath}`);

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

            // Call OpenAI Whisper API
            const transcription = await this.openai.audio.transcriptions.create(apiParams);

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
            } else if (error.status === 429) {
                throw new Error('OpenAI API rate limit exceeded');
            } else if (error.status === 500) {
                throw new Error('OpenAI API server error');
            }

            // Re-throw the error for generic handling
            throw new Error(`Transcription failed: ${error.message}`);
        }
    }

    /**
     * Process uploaded audio file and return transcription
     */
    async processAudioFile(filePath, originalName, fileSize, options = {}) {
        try {
            // Validate the audio file
            this.validateAudioFile(filePath, originalName, fileSize);

            // Transcribe the audio
            const result = await this.transcribeAudio(filePath, options);

            return {
                ...result,
                file_info: {
                    original_name: originalName,
                    file_size: fileSize,
                    file_extension: path.extname(originalName).toLowerCase()
                }
            };

        } catch (error) {
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