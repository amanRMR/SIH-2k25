import axios from 'axios';

/**
 * Generate audio buffer from text using Google TTS
 * @param {string} text - Text to convert
 * @param {string} lang - Language code (e.g., 'en', 'hi', 'mr')
 * @returns {Promise<Buffer>} - Audio buffer (MP3)
 */
export const generateAudioFromText = async (text, lang = 'en') => {
    if (!text || text.trim() === '') {
        throw new Error('Text is required for TTS');
    }

    const language = lang.toLowerCase();

    // Google TTS has a character limit (around 200 chars).
    const MAX_CHUNK_LENGTH = 200;

    const splitText = (text, maxLength) => {
        const chunks = [];
        let currentChunk = '';
        const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length <= maxLength) {
                currentChunk += sentence;
            } else {
                if (currentChunk) chunks.push(currentChunk.trim());
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
    const audioBuffers = [];

    const fetchAudioChunk = async (chunk) => {
        const url = `https://translate.google.com/translate_tts`;
        const response = await axios.get(url, {
            params: {
                ie: 'UTF-8',
                q: chunk,
                tl: language,
                client: 'tw-ob'
            },
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        return response.data;
    };

    for (const chunk of textChunks) {
        if (chunk.trim()) {
            try {
                const buffer = await fetchAudioChunk(chunk);
                audioBuffers.push(buffer);
            } catch (err) {
                console.error(`TTS Error on chunk "${chunk}":`, err.message);
                throw err;
            }
        }
    }

    return Buffer.concat(audioBuffers);
};
