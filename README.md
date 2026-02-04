# Tennis Attribution Trainer

A web application for training machine learning models to attribute tennis actions and movements to specific players.

## Features

- 🎾 **File Upload**: Upload tennis videos, images, and training datasets
- 🎤 **Audio Transcription**: AI-powered audio transcription using OpenAI Whisper API
  - Automatic compression for files >25MB
  - Automatic splitting for very large files
  - Supports MP3, WAV, M4A, Opus, and more
- 📊 **Training Management**: Start and monitor attribution model training
- 🔒 **Security**: Built with security best practices using Helmet.js
- 📁 **Static Files**: Serve frontend assets efficiently
- 🌐 **CORS Support**: Configurable cross-origin request handling
- 📝 **Logging**: Request logging with Morgan
- ⚡ **Fast Development**: Hot reload with nodemon

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration, including OpenAI API key
   ```

3. **Configure OpenAI API Key**:
   ```bash
   # Add your OpenAI API key to .env file
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

4. **Install ffmpeg (Optional but recommended for large files)**:
   ```bash
   # Windows (using Chocolatey)
   choco install ffmpeg
   
   # macOS (using Homebrew)
   brew install ffmpeg
   
   # Linux (Ubuntu/Debian)
   sudo apt-get install ffmpeg
   
   # Verify installation
   ffmpeg -version
   ```
   Note: ffmpeg is required for automatic compression and splitting of large audio files (>25MB). Without it, files must be manually compressed.

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Visit the application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
tennis-attribution-trainer/
├── public/                 # Frontend static files
│   ├── index.html         # Main HTML page
│   └── app.js             # Frontend JavaScript
├── server/                # Backend services
│   ├── services/          # Business logic services
│   │   ├── attributionService.js
│   │   └── transcription.js    # Audio transcription service
│   └── data/              # Data storage
│       ├── uploads/       # Uploaded files
│       ├── models/        # Trained models
│       └── processed/     # Processed data
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
└── README.md              # This file
```

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Audio Transcription
- `POST /api/transcribe` - Transcribe audio files using OpenAI Whisper
  - Supports files up to 500MB (auto-compresses/splits if >25MB)
  - Requires ffmpeg for large file handling (optional but recommended)

### File Upload
- `POST /api/upload` - Upload single file
- `POST /api/upload-multiple` - Upload multiple files

### Training
- `GET /api/training-data` - Get training data information
- `POST /api/train` - Start model training

## Audio Transcription

The application now supports AI-powered audio transcription using OpenAI's Whisper API.

### Supported Audio Formats
- **MP3** - MPEG Audio Layer III
- **WAV** - Waveform Audio File Format
- **M4A** - MPEG-4 Audio
- **MP4** - MPEG-4 Video (audio track)
- **MPEG** - MPEG Audio
- **MPGA** - MPEG Audio
- **WebM** - WebM Audio

### Transcription Features
- **Automatic language detection** or manual language selection
- **Timestamps** for segments and individual words
- **Context prompts** to improve accuracy
- **Temperature control** for creativity vs. accuracy
- **Verbose JSON format** with detailed metadata
- **File size limit**: 50MB per audio file

### Usage Example

```bash
# Upload an audio file for transcription
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@interview.mp3" \
  -F "language=en" \
  -F "prompt=Tennis interview with technical terminology"
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key_here
MAX_FILE_SIZE=52428800
UPLOAD_DIR=server/data/uploads
```

### Required for Transcription
- `OPENAI_API_KEY` - Your OpenAI API key for Whisper access

## File Upload

Supported file types:
- **Images**: JPEG, PNG, GIF
- **Videos**: MP4, MOV, AVI  
- **Data**: CSV, JSON, TXT
- **Audio**: MP3, WAV, M4A, MP4, MPEG, MPGA, WebM

Maximum file size: 50MB

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run tests (placeholder)

### Security Features

- Helmet.js for security headers
- CORS configuration
- File type validation
- File size limits
- Input sanitization
- Automatic file cleanup after transcription

### Dependencies

**Core:**
- Express.js - Web framework
- Multer - File upload handling
- OpenAI - AI API integration
- fs-extra - Enhanced file system operations

**Security:**
- Helmet - Security headers
- CORS - Cross-origin resource sharing

**Development:**
- Nodemon - Development auto-reload
- Morgan - Request logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details 