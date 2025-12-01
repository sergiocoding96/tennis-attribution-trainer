# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tennis Attribution Trainer is a web application that helps tennis players improve their mental game by analyzing commentary transcripts and identifying attribution patterns (growth vs. fixed mindset). The application uses AI services to transcribe audio and analyze psychological patterns in player language.

### Tech Stack
- **Backend**: Express.js with Node.js (>=16.0.0)
- **Frontend**: React 18 + Vite + Tailwind CSS
- **AI Services**:
  - OpenAI Whisper API for audio transcription
  - Anthropic Claude API for attribution analysis
- **Database**: Supabase (optional for session storage)
- **Authentication**: Supabase Auth with JWT

## Development Commands

### Server (Root Directory)
```bash
npm run dev          # Start development server with nodemon (hot reload)
npm start            # Start production server
npm install          # Install server dependencies
```

### Client (client/ directory)
```bash
cd client
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Build for production (outputs to client/dist)
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Running the Full Application
The server serves the built React app from `client/dist`, so in production:
1. Build the client: `cd client && npm run build`
2. Start the server: `npm start` (from root)

For development, run both servers:
- Backend: `npm run dev` (root, port 3000)
- Frontend: `cd client && npm run dev` (port 5173)

## Environment Variables

Required environment variables (copy from `.env.example`):

### Essential for Transcription:
- `OPENAI_API_KEY` - OpenAI API key for Whisper transcription

### Essential for Attribution Analysis:
- `CLAUDE_API_KEY` - Anthropic Claude API key for attribution analysis

### Essential for Session Storage:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_KEY` - Supabase service role key (server-side)
- `SUPABASE_ANON_KEY` - Supabase anon key (client-side)

### Optional:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `ALLOWED_ORIGINS` - CORS origins (comma-separated)
- `CLAUDE_MODEL` - Claude model to use (default: claude-sonnet-4-5-20250929)
- `CLAUDE_API_TIMEOUT` - API timeout in ms (default: 60000)
- `OPENAI_API_TIMEOUT` - API timeout in ms (default: 300000)

## Architecture

### Request Flow
1. **Audio Upload** → Transcription → Attribution Analysis → Display Results
2. **Manual Transcript** → Attribution Analysis → Display Results
3. **Session Storage** (if authenticated) → Save to Supabase

### Backend Architecture (server.js)

**Key Concepts:**
- Express app with middleware stack: Helmet (security) → CORS → Morgan (logging) → Body parsing
- Two separate multer configurations:
  - `upload`: General file uploads (images, videos, data)
  - `audioUpload`: Specific to audio transcription (MP3, WAV, M4A, etc.)
- Services are imported and used by route handlers
- Middleware (`requireAuth`, `optionalAuth`) protect authenticated routes

### Service Layer (server/services/)

**Why Services Exist:**
- Separates business logic from routing
- Services can be tested independently
- Services can be reused across multiple routes
- Clear separation of concerns

**transcription.js** - OpenAI Whisper Integration
- Validates audio files (format, size limit 50MB)
- Calls OpenAI Whisper API with retry logic
- Returns formatted transcription with timestamps
- Cleans up uploaded files after processing

**attribution.js** - Anthropic Claude Integration
- Processes transcriptions for attribution patterns
- Identifies growth mindset vs. fixed mindset language
- Uses domain-specific processors:
  - `tennisLanguageProcessor.js` - Tennis terminology analysis
  - `psychologyPatterns.js` - Psychological pattern detection
  - `authenticReframes.js` - Suggests growth-oriented reframes
- Chunks large transcripts to handle token limits
- Repairs truncated JSON responses from Claude

**supabase.js** - Database & Session Management
- Optional service (gracefully handles missing config)
- Saves player sessions with analysis results
- Tracks patterns over time
- Provides session history and trend analysis
- Uses service key (bypasses RLS) for server-side operations

**Key Pattern:** All services are class-based singletons exported as instances, not classes.

### Middleware (server/middleware/)

**auth.js** - Authentication Middleware
- `requireAuth` - Validates JWT token, attaches `req.user`
- `requireAdmin` - Requires admin role (use after `requireAuth`)
- `requireCoachOrAdmin` - Requires coach or admin role
- `optionalAuth` - Attaches user if present, doesn't fail if missing

**Why Middleware:** Prevents code duplication, ensures consistent security, composable, testable in isolation.

### Frontend Architecture (client/src/)

**React + Vite Structure:**
- **main.jsx** - Entry point, renders App with context providers
- **App.jsx** - Main application component
- **context/** - React context providers:
  - `AuthContext.jsx` - Supabase authentication state
  - `ThemeContext.jsx` - Light/dark mode toggle
- **components/** - Reusable UI components:
  - `TranscriptionUpload.jsx` - Audio upload & manual transcription
  - `AnalysisDisplay.jsx` - Shows attribution analysis results
  - `CommentCard.jsx` - Individual comment with reframe scoring
  - `SessionHistory.jsx` - Past session history
  - `Auth.jsx` - Login/signup forms

**State Management:** Context API for global state (auth, theme). Component state for local UI.

**Styling:** Tailwind CSS with custom theme configuration

## API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `POST /api/transcribe` - Upload audio for transcription (multipart/form-data, field: `audio`)
- `POST /api/analyze` - Analyze transcript for attribution patterns (body: `{transcription}`)
- `POST /api/score-reframe` - Score a reframed comment (body: `{original_quote, player_reframe, context?}`)
- `GET /api/sample-analysis` - Load sample analysis for testing

### Authenticated Endpoints (require Bearer token)
- `POST /api/sessions` - Save session (body: `{transcript, analysisData, sessionType?}`)
- `GET /api/sessions?limit=N` - Get user's session history
- `GET /api/trends?days=N` - Get pattern trends over time

## Key Files to Understand

### Critical Path for Audio → Analysis Flow:
1. **server.js:124-197** - `/api/transcribe` endpoint
2. **server/services/transcription.js** - Audio processing logic
3. **server.js:199-241** - `/api/analyze` endpoint
4. **server/services/attribution.js** - Attribution analysis logic

### Authentication Flow:
1. **client/src/context/AuthContext.jsx** - Client-side auth state
2. **server/middleware/auth.js** - Server-side auth verification
3. **server/services/supabase.js** - Token verification & user management

## Common Patterns

### Error Handling
- Services throw errors with descriptive messages
- Route handlers catch errors and return JSON with `{success: false, error: message}`
- Automatic file cleanup in finally blocks (transcription endpoint)

### File Uploads
- Multer handles uploads to `server/data/uploads/`
- Unique filenames: `{fieldname}-{timestamp}-{random}.{ext}`
- Files are deleted after processing to prevent disk bloat

### AI API Calls
- Both services use configurable timeouts
- Retry logic for transient failures (transcription)
- Chunking for large inputs (attribution)
- JSON repair for truncated responses (attribution)

### Authentication
- Client sends JWT in `Authorization: Bearer {token}` header
- Middleware verifies token via Supabase
- Authenticated user available as `req.user` in route handlers

## Testing Considerations

### Testing the Transcription Service:
- Ensure `OPENAI_API_KEY` is set
- Test with various audio formats (MP3, WAV, M4A)
- Test file size limits (50MB max)
- Test with audio files that exceed timeout

### Testing the Attribution Service:
- Ensure `CLAUDE_API_KEY` is set
- Test with short transcripts (< 1000 words)
- Test with long transcripts (> 5000 words) to verify chunking
- Test with truncated JSON responses to verify repair logic

### Testing Authentication:
- Test protected routes without token (expect 401)
- Test protected routes with expired token (expect 401)
- Test role-based access (admin, coach endpoints)

## Deployment Notes

### Production Checklist:
1. Build frontend: `cd client && npm run build`
2. Set all required environment variables
3. Ensure `NODE_ENV=production`
4. Configure `ALLOWED_ORIGINS` for CORS
5. Use process manager (PM2, systemd) to run server
6. Set up reverse proxy (nginx, Apache) if needed
7. Configure SSL/TLS for HTTPS
8. Monitor API usage (OpenAI, Anthropic) to avoid overages

### File Storage:
- Uploads directory: `server/data/uploads/` (ensure write permissions)
- Processed data: `server/data/processed/` (for sample files)
- Models: `server/data/models/` (future ML model storage)

## Important Notes

### API Token Limits:
- Claude API: Default 8000 max tokens per request (configurable via `maxTokensPerRequest`)
- Transcription service uses chunking for large files
- Attribution service uses chunking for long transcripts (4000 chars per chunk)

### Graceful Degradation:
- App works without Supabase (session storage disabled)
- App requires both API keys to function fully
- Missing API keys log warnings but don't crash server

### Security:
- Helmet.js provides security headers including CSP
- CORS configured for specific origins only
- File upload validation (type, size)
- JWT-based authentication with Supabase
- Environment variables for sensitive data (never commit .env)
