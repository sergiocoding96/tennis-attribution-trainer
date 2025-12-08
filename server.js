const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs-extra');
require('dotenv').config();

// Import services
const transcriptionService = require('./server/services/transcription');
const attributionService = require('./server/services/attribution');
const emotionFramework = require('./server/services/emotionFramework');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:"],
        },
    },
}));

// CORS middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'server/data/uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept images, videos, and specific data formats
        const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|csv|json|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, videos, and data files are allowed.'));
        }
    }
});

// Configure multer specifically for audio transcription
const audioStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'server/data/uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const audioUpload = multer({
    storage: audioStorage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit for audio files
    },
    fileFilter: function (req, file, cb) {
        // Accept audio formats supported by Whisper
        const allowedAudioTypes = /mp3|wav|m4a|mp4|mpeg|mpga|webm/;
        const extname = allowedAudioTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedAudioTypes.test(file.mimetype) || file.mimetype.startsWith('audio/');

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid audio file type. Supported formats: MP3, WAV, M4A, MP4, MPEG, MPGA, WebM'));
        }
    }
});

// Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Tennis Attribution Trainer',
        version: '1.0.0'
    });
});

// Audio transcription endpoint
app.post('/api/transcribe', audioUpload.single('audio'), async (req, res) => {
    let uploadedFilePath = null;

    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No audio file uploaded. Please provide an audio file.'
            });
        }

        // Check if OpenAI API key is configured
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables.'
            });
        }

        uploadedFilePath = req.file.path;
        const { originalname, size } = req.file;

        console.log(`Processing audio file: ${originalname} (${Math.round(size / (1024 * 1024))}MB)`);

        // Extract transcription options from request body
        const transcriptionOptions = {
            language: req.body.language || null,
            prompt: null, // Simplified: no custom prompts
            response_format: 'verbose_json',
            temperature: 0 // Simplified: fixed temperature
        };

        // Process the audio file
        const result = await transcriptionService.processAudioFile(
            uploadedFilePath,
            originalname,
            size,
            transcriptionOptions
        );

        // Format the response for display
        const formattedResult = transcriptionService.formatTranscriptionForDisplay(result);

        // Respond with transcription results
        res.json({
            success: true,
            message: 'Audio transcribed successfully',
            data: formattedResult,
            metadata: result.metadata,
            file_info: result.file_info
        });

    } catch (error) {
        console.error('Transcription endpoint error:', error);

        // Return appropriate error response
        res.status(500).json({
            success: false,
            error: error.message || 'Transcription failed',
            timestamp: new Date().toISOString()
        });

    } finally {
        // Clean up uploaded file
        if (uploadedFilePath) {
            try {
                await transcriptionService.cleanupFile(uploadedFilePath);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        }
    }
});

// Attribution analysis endpoint
app.post('/api/analyze', async (req, res) => {
    try {
        // Check if transcription was provided
        if (!req.body.transcription) {
            return res.status(400).json({
                success: false,
                error: 'No transcription provided for analysis.'
            });
        }

        // Check if Claude API key is configured
        if (!process.env.CLAUDE_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'Claude API key not configured. Please set CLAUDE_API_KEY in environment variables.'
            });
        }

        console.log(`Processing transcription for attribution analysis (${req.body.transcription.length} characters)`);

        // Process the transcription for attribution analysis
        const result = await attributionService.processTranscription(req.body.transcription);

        // Respond with attribution analysis results
        res.json({
            success: true,
            message: 'Attribution analysis completed successfully',
            data: result.data,
            metadata: result.metadata
        });

    } catch (error) {
        console.error('Attribution analysis endpoint error:', error);

        // Return appropriate error response
        res.status(500).json({
            success: false,
            error: error.message || 'Attribution analysis failed',
            timestamp: new Date().toISOString()
        });
    }
});

// Score reframe endpoint for comment improvement
app.post('/api/score-reframe', async (req, res) => {
    try {
        const { original_quote, player_reframe, context } = req.body;

        if (!original_quote || !player_reframe) {
            return res.status(400).json({
                success: false,
                error: 'Original quote and player reframe are required.'
            });
        }

        // Check if Claude API key is configured
        if (!process.env.CLAUDE_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'Claude API key not configured.'
            });
        }

        console.log(`Scoring reframe: "${original_quote}" -> "${player_reframe}"`);

        // Score the reframe using attribution service
        const result = await attributionService.scoreReframe(original_quote, player_reframe, context);

        res.json({
            success: true,
            score: result.score,
            feedback: result.feedback,
            improvements: result.improvements || []
        });

    } catch (error) {
        console.error('Score reframe endpoint error:', error);

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to score reframe',
            timestamp: new Date().toISOString()
        });
    }
});

// Emotion framework configuration endpoint
app.get('/api/emotions', (req, res) => {
    try {
        const config = emotionFramework.getFrameworkConfig();
        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        console.error('Emotion framework endpoint error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get emotion framework'
        });
    }
});

// Emotion detection endpoint
app.post('/api/detect-emotions', (req, res) => {
    try {
        const { text, language } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'No text provided for emotion detection.'
            });
        }

        const result = emotionFramework.detectEmotions(text, language || 'es');

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Emotion detection endpoint error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to detect emotions'
        });
    }
});

// Emotional trajectory analysis endpoint
app.post('/api/analyze-emotional-trajectory', (req, res) => {
    try {
        const { statements, language } = req.body;

        if (!statements || !Array.isArray(statements)) {
            return res.status(400).json({
                success: false,
                error: 'No statements array provided for trajectory analysis.'
            });
        }

        const result = emotionFramework.analyzeEmotionalTrajectory(statements, language || 'es');

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Emotional trajectory endpoint error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to analyze emotional trajectory'
        });
    }
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);

    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Too many files' });
        }
    }

    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🎾 Tennis Attribution Trainer server is running on port ${PORT}`);
    console.log(`📁 Static files served from: ${path.join(__dirname, 'public')}`);
    console.log(`📤 File uploads saved to: ${path.join(__dirname, 'server/data/uploads')}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🎤 Audio transcription available at: /api/transcribe`);
    console.log(`🧠 Attribution analysis available at: /api/analyze`);

    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
        console.warn('⚠️  Warning: OPENAI_API_KEY not set. Transcription service will not work.');
    } else {
        console.log('✅ OpenAI API key configured');
    }

    // Check Claude API key
    if (!process.env.CLAUDE_API_KEY) {
        console.warn('⚠️  Warning: CLAUDE_API_KEY not set. Attribution analysis will not work.');
    } else {
        console.log('✅ Claude API key configured');
    }
});

module.exports = app; 