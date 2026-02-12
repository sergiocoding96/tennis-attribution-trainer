const path = require('path');
const { spawn, execFile } = require('child_process');
const fs = require('fs-extra');
const { promisify } = require('util');

const execFilePromise = promisify(execFile);

/**
 * Body language analysis service. Invokes Python pipeline (measurement-first)
 * via subprocess and returns parsed JSON. No pose logic in Node.
 */
class BodyLanguageService {
    constructor() {
        this.pythonCommand = process.env.BODY_LANGUAGE_PYTHON || 'python';
        this.timeoutMs = parseInt(process.env.BODY_LANGUAGE_TIMEOUT, 10) || 600000; // 10 min default
        this.repoRoot = path.join(__dirname, '..', '..');
        this.reencodeTimeoutMs = 300000; // 5 min for ffmpeg re-encode
    }

    /**
     * Re-encode video with FFmpeg so OpenCV can read full duration (avoids cutoff with some codecs).
     * @param {string} inputPath - Absolute path to uploaded video
     * @returns {Promise<string|null>} Path to re-encoded file, or null if ffmpeg not available/failed
     */
    async reencodeForAnalysis(inputPath) {
        const dir = path.dirname(inputPath);
        const ext = path.extname(inputPath);
        const normalizedPath = path.join(dir, `video-normalized-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`);
        try {
            await execFilePromise('ffmpeg', [
                '-y',
                '-i', inputPath,
                '-c:v', 'libx264',
                '-preset', 'fast',
                '-crf', '23',
                '-movflags', '+faststart',
                '-an',
                normalizedPath,
            ], { timeout: this.reencodeTimeoutMs });
            if (await fs.pathExists(normalizedPath)) {
                return normalizedPath;
            }
        } catch (err) {
            if (await fs.pathExists(normalizedPath)) {
                await fs.remove(normalizedPath).catch(() => {});
            }
        }
        return null;
    }

    /**
     * Run body language pipeline on video file. Returns { data, metadata }.
     * @param {string} videoPath - Absolute or relative path to video file
     * @returns {Promise<{ data: object, metadata: object }>}
     */
    async analyzeVideo(videoPath, options = {}) {
        const absolutePath = path.isAbsolute(videoPath) ? videoPath : path.resolve(this.repoRoot, videoPath);
        if (!(await fs.pathExists(absolutePath))) {
            throw new Error(`Video file not found: ${absolutePath}`);
        }

        // Re-encode with FFmpeg so OpenCV reads full duration (fixes cutoff with some codecs)
        let normalizedPath = null;
        try {
            normalizedPath = await this.reencodeForAnalysis(absolutePath);
        } catch (err) {
            console.warn('Body language: FFmpeg re-encode failed, using original file:', err.message);
        }
        const videoToAnalyze = normalizedPath || absolutePath;
        if (normalizedPath) {
            console.log('Body language: using re-encoded video for full-duration analysis');
        }

        return new Promise((resolve, reject) => {
            const args = ['-m', 'body_language_analysis.run', videoToAnalyze];
            const proc = spawn(this.pythonCommand, args, {
                cwd: this.repoRoot,
                stdio: ['ignore', 'pipe', 'pipe'],
            });

            let stdout = '';
            let stderr = '';
            proc.stdout.setEncoding('utf8');
            proc.stderr.setEncoding('utf8');
            proc.stdout.on('data', (chunk) => { stdout += chunk; });
            proc.stderr.on('data', (chunk) => { stderr += chunk; });

            const timeout = setTimeout(() => {
                proc.kill('SIGKILL');
                if (normalizedPath) {
                    fs.remove(normalizedPath).catch((e) => console.warn('Body language: cleanup normalized video failed', e.message));
                }
                reject(new Error(`Body language analysis timed out after ${this.timeoutMs / 1000}s`));
            }, this.timeoutMs);

            const cleanupNormalized = () => {
                if (normalizedPath) {
                    fs.remove(normalizedPath).catch((e) => console.warn('Body language: cleanup normalized video failed', e.message));
                }
            };

            proc.on('error', (err) => {
                clearTimeout(timeout);
                cleanupNormalized();
                reject(new Error(`Failed to start Python pipeline: ${err.message}`));
            });

            proc.on('close', (code) => {
                clearTimeout(timeout);
                if (code !== 0) {
                    cleanupNormalized();
                    const raw = stderr.trim() || stdout.trim() || `Process exited with code ${code}`;
                    let errObj = null;
                    const lines = raw.split('\n');
                    const jsonLine = [...lines].reverse().find((line) => line.startsWith('{"error":'));
                    if (jsonLine) {
                        try {
                            errObj = JSON.parse(jsonLine);
                        } catch (_) { /* use raw below */ }
                    }
                    if (errObj) {
                        const errType = errObj.error_type ? `[${errObj.error_type}] ` : '';
                        reject(new Error(errType + (errObj.error || raw)));
                    } else {
                        reject(new Error(raw));
                    }
                    return;
                }
                try {
                    const result = JSON.parse(stdout);
                    if (result.error) {
                        cleanupNormalized();
                        reject(new Error(result.error));
                        return;
                    }
                    cleanupNormalized();
                    resolve({
                        data: result,
                        metadata: {
                            windows: result.windows?.length ?? 0,
                            video_duration_seconds: result.video_duration_seconds,
                            video_fps: result.video_fps,
                        },
                    });
                } catch (err) {
                    cleanupNormalized();
                    reject(new Error(`Invalid JSON from pipeline: ${err.message}`));
                }
            });
        });
    }

    /**
     * Remove uploaded video file after processing (same pattern as transcription).
     * @param {string} filePath
     */
    async cleanupFile(filePath) {
        try {
            if (filePath && (await fs.pathExists(filePath))) {
                await fs.remove(filePath);
            }
        } catch (err) {
            console.error('Body language cleanup error:', err.message);
        }
    }
}

module.exports = new BodyLanguageService();
