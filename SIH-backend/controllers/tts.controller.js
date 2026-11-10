import axios from 'axios';
import ApiError from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Supported languages for TTS
 * Includes all 22 Scheduled Indian Languages + Major International Languages
 */
const SUPPORTED_LANGUAGES = {
    // English
    'en': 'English',

    // Major Indian Languages (22 Scheduled Languages)
    'hi': 'Hindi',
    'bn': 'Bengali',
    'te': 'Telugu',
    'mr': 'Marathi',
    'ta': 'Tamil',
    'ur': 'Urdu',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'or': 'Odia',
    'pa': 'Punjabi',
    'as': 'Assamese',
    'mai': 'Maithili',
    'sa': 'Sanskrit',
    'ne': 'Nepali',
    'si': 'Sinhala',
    'kok': 'Konkani',
    'sd': 'Sindhi',
    'ks': 'Kashmiri',
    'doi': 'Dogri',
    'mni': 'Manipuri',
    'sat': 'Santali',

    // Additional languages
    'ar': 'Arabic',
    'zh': 'Chinese',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'id': 'Indonesian',
    'ms': 'Malay',
    'fil': 'Filipino'
};

/**
 * Convert text to speech using Google TTS API directly
 * Supports long text by splitting into chunks
 * @route POST /api/tts
 */
export const textToSpeech = async (req, res, next) => {
    try {
        const { text, lang = 'en' } = req.body;

        // Validate input
        if (!text || text.trim() === '') {
            throw new ApiError(400, 'Text is required');
        }

        const language = lang.toLowerCase();
        console.log(`TTS Request: ${language} - Length: ${text.length} chars`);

        // Google TTS has a character limit (around 200 chars).
        // We need to split long text into chunks.
        const MAX_CHUNK_LENGTH = 200;

        // Helper function to split text into chunks
        const splitText = (text, maxLength) => {
            const chunks = [];
            let currentChunk = '';

            // Split by sentences first to sound natural
            const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];

            for (const sentence of sentences) {
                if ((currentChunk + sentence).length <= maxLength) {
                    currentChunk += sentence;
                } else {
                    // If current chunk is not empty, push it
                    if (currentChunk) chunks.push(currentChunk.trim());

                    // If the sentence itself is too long, split by comma or space
                    if (sentence.length > maxLength) {
                        const words = sentence.split(' ');
                        currentChunk = '';
                        for (const word of words) {
                            if ((currentChunk + ' ' + word).length <= maxLength) {
                                currentChunk += (currentChunk ? ' ' : '') + word;
                            } else {
                                if (currentChunk) chunks.push(currentChunk.trim());
                                currentChunk = word;
                            }
                        }
                    } else {
                        currentChunk = sentence;
                    }
                }
            }
            if (currentChunk) chunks.push(currentChunk.trim());
            return chunks;
        };

        const textChunks = splitText(text, MAX_CHUNK_LENGTH);
        console.log(`Split into ${textChunks.length} chunks`);

        // Function to fetch audio for a single chunk
        const fetchAudioChunk = async (chunk) => {
            const url = `https://translate.google.com/translate_tts`;
            const response = await axios.get(url, {
                params: {
                    ie: 'UTF-8',
                    q: chunk,
                    tl: language,
                    client: 'tw-ob'
                },
                responseType: 'arraybuffer', // Get as buffer to concatenate
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            return response.data;
        };

        // Fetch all chunks sequentially (to preserve order and avoid rate limits)
        const audioBuffers = [];
        for (const chunk of textChunks) {
            if (chunk.trim()) {
                try {
                    const buffer = await fetchAudioChunk(chunk);
                    audioBuffers.push(buffer);
                } catch (err) {
                    console.error(`Error fetching chunk "${chunk.substring(0, 20)}...":`, err.message);
                    // Continue with other chunks or fail? Let's fail to avoid broken speech.
                    throw err;
                }
            }
        }

        // Concatenate all audio buffers
        const combinedBuffer = Buffer.concat(audioBuffers);

        // Set response headers
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', 'inline; filename="speech.mp3"');
        res.setHeader('Content-Length', combinedBuffer.length);
        res.setHeader('Cache-Control', 'public, max-age=3600');

        // Send the combined audio
        res.send(combinedBuffer);

    } catch (error) {
        console.error('TTS Error:', error.message);

        if (error.response) {
            console.error('Google API Status:', error.response.status);
            console.error('Google API Data:', error.response.data ? error.response.data.toString() : 'No data');

            if (error.response.status === 404) {
                return next(new ApiError(400, `Language "${req.body.lang}" is not supported by Google TTS`));
            }
        }

        next(new ApiError(500, 'Failed to generate speech: ' + error.message));
    }
};

/**
 * Get list of supported languages
 * @route GET /api/tts/languages
 */
export const getSupportedLanguages = async (req, res, next) => {
    try {
        res.status(200).json(
            new ApiResponse(
                200,
                SUPPORTED_LANGUAGES,
                'Supported languages retrieved successfully'
            )
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Health check for TTS service
 * @route GET /api/tts/health
 */
export const ttsHealthCheck = async (req, res, next) => {
    try {
        res.status(200).json(
            new ApiResponse(
                200,
                {
                    status: 'OK',
                    service: 'text-to-speech',
                    supportedLanguages: Object.keys(SUPPORTED_LANGUAGES).length,
                    implementation: 'direct-google-api-chunked'
                },
                'TTS service is running'
            )
        );
    } catch (error) {
        next(error);
    }
};
