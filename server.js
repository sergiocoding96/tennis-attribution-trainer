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
const supabaseService = require('./server/services/supabase');

// Import middleware
const { requireAuth, requireAdmin, optionalAuth } = require('./server/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", "https://vvumpywhrlmktcdfuvma.supabase.co", "https://*.supabase.co"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
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

// Static file serving - serve React build
app.use(express.static(path.join(__dirname, 'client/dist')));

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
        // Accept audio formats supported by Whisper (including .opus which we'll convert)
        const allowedAudioTypes = /mp3|wav|m4a|mp4|mpeg|mpga|webm|opus|ogg|oga|flac/;
        const extname = allowedAudioTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedAudioTypes.test(file.mimetype) || file.mimetype.startsWith('audio/');

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid audio file type. Supported formats: MP3, WAV, M4A, MP4, MPEG, MPGA, WebM, Opus, OGG, OGA, FLAC'));
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

        // Save analysis results to JSON file in test files directory
        try {
            const testFilesDir = path.join(__dirname, 'audio_test_files');
            // Ensure directory exists
            await fs.ensureDir(testFilesDir);
            
            // Create filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `analysis_result_${timestamp}.json`;
            const filePath = path.join(testFilesDir, filename);
            
            // Save full result including transcription and metadata
            const resultToSave = {
                timestamp: new Date().toISOString(),
                transcription_length: req.body.transcription.length,
                transcription_preview: req.body.transcription.substring(0, 200) + (req.body.transcription.length > 200 ? '...' : ''),
                analysis: result.data,
                metadata: result.metadata
            };
            
            await fs.writeJson(filePath, resultToSave, { spaces: 2 });
            console.log(`✅ Analysis results saved to: ${filePath}`);
        } catch (saveError) {
            // Don't fail the request if saving fails, just log it
            console.error('⚠️  Failed to save analysis results to file:', saveError.message);
        }

        // Respond with attribution analysis results
        res.json({
            success: true,
            message: 'Attribution analysis completed successfully',
            data: result.data,
            metadata: result.metadata
        });

    } catch (error) {
        console.error('Attribution analysis endpoint error:', error);

        // Provide more specific error messages
        let errorMessage = error.message || 'Attribution analysis failed';
        
        // Check for common error types
        if (error.message && error.message.includes('CLAUDE_API_KEY')) {
            errorMessage = 'Claude API key not configured. Please set CLAUDE_API_KEY in environment variables.';
        } else if (error.message && error.message.includes('timeout')) {
            errorMessage = 'Analysis request timed out. The transcription may be too long. Try breaking it into smaller segments.';
        } else if (error.message && error.message.includes('rate limit')) {
            errorMessage = 'API rate limit exceeded. Please try again in a few moments.';
        }

        // Return appropriate error response
        res.status(500).json({
            success: false,
            error: errorMessage,
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

// Save session endpoint (requires authentication)
app.post('/api/sessions', requireAuth, async (req, res) => {
    try {
        const { transcript, analysisData, sessionType } = req.body;

        if (!analysisData) {
            return res.status(400).json({
                success: false,
                error: 'Analysis data is required'
            });
        }

        // req.user is set by requireAuth middleware
        const session = await supabaseService.saveSession(
            req.user.id,
            transcript,
            analysisData,
            sessionType || 'practice'
        );

        res.json({
            success: true,
            message: 'Session saved successfully',
            data: { sessionId: session?.id }
        });

    } catch (error) {
        console.error('Save session error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to save session'
        });
    }
});

// Get user's sessions
app.get('/api/sessions', requireAuth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const sessions = await supabaseService.getPlayerSessions(req.user.id, limit);

        res.json({
            success: true,
            data: sessions
        });

    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch sessions'
        });
    }
});

// Get pattern trends
app.get('/api/trends', requireAuth, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const trends = await supabaseService.getPatternTrends(req.user.id, days);

        res.json({
            success: true,
            data: trends
        });

    } catch (error) {
        console.error('Get trends error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch trends'
        });
    }
});

// Load sample analysis for testing
app.get('/api/sample-analysis', async (req, res) => {
    try {
        const samplePath = path.join(__dirname, 'server/data/processed/sample_analysis.json');
        
        if (!await fs.pathExists(samplePath)) {
            return res.status(404).json({
                success: false,
                error: 'Sample analysis file not found'
            });
        }

        const sampleData = await fs.readJson(samplePath);
        
        res.json({
            success: true,
            message: 'Sample analysis loaded successfully',
            data: sampleData,
            metadata: {
                source: 'sample_file',
                loaded_at: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error loading sample analysis:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to load sample analysis'
        });
    }
});

// Serve the main application (React app)
app.get('*', (req, res) => {
    // API routes should have been handled above
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
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

    // Check Supabase
    if (supabaseService.isConfigured()) {
        console.log('✅ Supabase configured - session storage enabled');
    } else {
        console.warn('⚠️  Warning: Supabase not configured. Session storage disabled.');
    }
});

module.exports = app; 