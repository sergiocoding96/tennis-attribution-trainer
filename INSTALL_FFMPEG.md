# Installing FFmpeg for Large File Support

FFmpeg is required for automatic compression and splitting of large audio files (>25MB).

## Windows Installation

### Option 1: Using Chocolatey (Recommended)
```powershell
# Install Chocolatey first if you don't have it:
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Then install ffmpeg:
choco install ffmpeg
```

### Option 2: Manual Installation
1. Download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/
2. Download the "ffmpeg-release-essentials.zip" file
3. Extract it to `C:\ffmpeg`
4. Add `C:\ffmpeg\bin` to your system PATH:
   - Open System Properties → Environment Variables
   - Edit "Path" under System variables
   - Add: `C:\ffmpeg\bin`
   - Click OK and restart your terminal

### Option 3: Using winget (Windows 10/11)
```powershell
winget install ffmpeg
```

## Verify Installation

After installation, verify it works:
```powershell
ffmpeg -version
```

You should see version information. If you get an error, make sure:
1. FFmpeg is in your PATH
2. You've restarted your terminal/command prompt
3. You've restarted the Node.js server

## After Installation

1. **Restart your Node.js server** (the server checks for ffmpeg on startup)
2. Try uploading your large file again

## Alternative: Manual Compression

If you can't install ffmpeg, you can manually compress your audio files:

1. Use an online tool like: https://www.online-audio-converter.com/
2. Or use Audacity (free): https://www.audacityteam.org/
   - Open your file
   - Export as MP3 with 64kbps bitrate, 16kHz sample rate, mono
   - This should reduce file size significantly

## Troubleshooting

If ffmpeg is installed but still not detected:
1. Check if it's in PATH: `where.exe ffmpeg` (should show a path)
2. Try restarting your server
3. Check the server logs for ffmpeg detection messages

