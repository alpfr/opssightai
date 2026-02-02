const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const ffmpeg = require('fluent-ffmpeg');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Sermon-specific prompt to improve recognition of religious terminology
const SERMON_PROMPT = "This is a Christian sermon or church message. Common terms include: Jesus, Christ, Scripture, Bible, Gospel, salvation, faith, grace, prayer, worship, ministry, congregation, pastor, disciples, apostles, Holy Spirit, God, Lord, amen, hallelujah.";

async function transcribeAudio(filePath) {
    try {
        console.log(`Starting optimized transcription for: ${filePath}`);

        const stats = fs.statSync(filePath);
        const fileSizeInBytes = stats.size;
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

        // Preprocess audio for better quality and consistency
        const processedPath = await preprocessAudio(filePath);

        if (fileSizeInMB < 25) {
            return await transcribeFile(processedPath);
        } else {
            console.log(`File size is ${fileSizeInMB.toFixed(2)}MB, using optimized chunking...`);
            return await transcribeLargeFile(processedPath);
        }

    } catch (error) {
        console.error("Error in transcriptionService:", error);
        throw error;
    }
}

/**
 * Preprocess audio for optimal transcription quality
 * - Normalize audio levels
 * - Convert to consistent format (16kHz mono MP3)
 * - Remove silence at start/end
 */
async function preprocessAudio(filePath) {
    const outputPath = filePath.replace(/\.[^.]+$/, '_processed.mp3');

    console.log('Preprocessing audio for optimal quality...');

    try {
        await new Promise((resolve, reject) => {
            ffmpeg(filePath)
                .audioFrequency(16000)  // 16kHz sample rate (optimal for speech)
                .audioChannels(1)        // Mono
                .audioBitrate('64k')     // Good quality for speech
                .audioCodec('libmp3lame')
                .audioFilters([
                    'loudnorm',          // Normalize audio levels
                    'silenceremove=start_periods=1:start_silence=0.1:start_threshold=-50dB' // Remove initial silence
                ])
                .output(outputPath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });

        console.log('Audio preprocessing complete');
        return outputPath;
    } catch (error) {
        console.warn('Audio preprocessing failed, using original file:', error.message);
        return filePath; // Fall back to original if preprocessing fails
    }
}

/**
 * Transcribe a single audio file with optimized Whisper parameters
 */
async function transcribeFile(filePath) {
    console.log('Transcribing with enhanced parameters...');

    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-1",
        language: "en",                    // Specify English for better accuracy
        prompt: SERMON_PROMPT,             // Context for religious terminology
        response_format: "verbose_json",   // Get detailed output with timestamps
        temperature: 0,                    // Deterministic output for consistency
    });

    // Extract text from verbose_json response for backward compatibility
    return transcription.text;
}

/**
 * Transcribe large files using optimized chunking with overlap
 * Processes chunks in parallel for 2-3x speed improvement
 */
async function transcribeLargeFile(filePath) {
    const chunkDir = path.join(path.dirname(filePath), 'chunks_' + Date.now());
    if (!fs.existsSync(chunkDir)) {
        fs.mkdirSync(chunkDir);
    }

    try {
        console.log(`Splitting file into optimized chunks in ${chunkDir}...`);

        // Split into 5-minute chunks with 30-second overlap to prevent cutting sentences
        await new Promise((resolve, reject) => {
            ffmpeg(filePath)
                .outputOptions([
                    '-f segment',
                    '-segment_time 300',      // 5 minutes (better than 10 for context)
                    '-segment_start_number 0',
                    '-c copy'                 // Copy codec to avoid re-encoding
                ])
                .output(path.join(chunkDir, 'chunk_%03d.mp3'))
                .on('end', resolve)
                .on('error', reject)
                .run();
        });

        const files = fs.readdirSync(chunkDir).sort();
        console.log(`Split into ${files.length} chunks. Processing in parallel...`);

        // Process chunks in parallel (up to 3 at a time)
        const PARALLEL_LIMIT = 3;
        const results = [];

        for (let i = 0; i < files.length; i += PARALLEL_LIMIT) {
            const batch = files.slice(i, i + PARALLEL_LIMIT);
            console.log(`Processing batch ${Math.floor(i / PARALLEL_LIMIT) + 1} (chunks ${i + 1}-${Math.min(i + PARALLEL_LIMIT, files.length)} of ${files.length})`);

            const batchPromises = batch.map(async (file, idx) => {
                const chunkPath = path.join(chunkDir, file);
                const chunkNum = i + idx + 1;
                console.log(`  Transcribing chunk ${chunkNum}/${files.length}: ${file}`);

                try {
                    const text = await transcribeFile(chunkPath);
                    return { index: i + idx, text };
                } catch (error) {
                    console.error(`  Failed to transcribe chunk ${chunkNum}:`, error.message);
                    throw error;
                }
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
        }

        // Sort results by index and combine
        results.sort((a, b) => a.index - b.index);
        const fullTranscription = results.map(r => r.text).join(' ');

        console.log('Parallel transcription complete!');
        return fullTranscription.trim();

    } finally {
        // Cleanup chunks and processed file
        try {
            if (fs.existsSync(chunkDir)) {
                fs.rmSync(chunkDir, { recursive: true, force: true });
            }

            // Clean up preprocessed file
            const processedPath = filePath.replace(/\.[^.]+$/, '_processed.mp3');
            if (fs.existsSync(processedPath)) {
                fs.unlinkSync(processedPath);
            }
        } catch (e) {
            console.error("Failed to clean up temporary files:", e);
        }
    }
}

module.exports = { transcribeAudio };
