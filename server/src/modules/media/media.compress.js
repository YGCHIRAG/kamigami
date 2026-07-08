const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const path = require('path');
const fs = require('fs');

// Set the path to the ffmpeg binary bundled with @ffmpeg-installer/ffmpeg
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Compresses a video file to H.264 standard at 720p, removes audio, and applies faststart.
 * @param {string} inputPath - The path to the uploaded temporary raw video file.
 * @param {string} outputDir - Directory where the compressed video should temporarily sit.
 * @returns {Promise<string>} - Promise resolving to the compressed file's absolute path.
 */
function compressVideo(inputPath, outputDir) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFilename = `compressed-${Date.now()}-${path.basename(inputPath, path.extname(inputPath))}.mp4`;
    const outputPath = path.join(outputDir, outputFilename);

    console.log(`🎬 Starting video compression:\nInput: ${inputPath}\nOutput: ${outputPath}`);

    ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec('libx264')
      .outputOptions([
        '-crf 28',            // Compression quality factor (26-30 is optimal for size/quality balance)
        '-preset fast',        // Faster processing speed
        '-movflags +faststart', // Puts index at start of file for web streaming/instant playback
        '-an'                  // Strips audio to keep file size minimal (since hero/bg videos are muted anyway)
      ])
      .videoFilters('scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2') // Resize and pad to fit 720p
      .on('start', (commandLine) => {
        console.log(`Spawned FFmpeg with command: ${commandLine}`);
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`Compression Progress: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', () => {
        console.log(`✅ Compression complete! Saved to ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('❌ FFmpeg error:', err);
        // Clean up partial file if created
        if (fs.existsSync(outputPath)) {
          try { fs.unlinkSync(outputPath); } catch (e) {}
        }
        reject(err);
      })
      .run();
  });
}

module.exports = {
  compressVideo
};
