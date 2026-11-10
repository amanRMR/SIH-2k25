import ApiError from "./apiError.js";
import fs from "fs";
import path from "path";
import os from "os";
import { translate } from 'google-translate-api-x';

// Groq API Configuration
const GROQ_API_URL_TRANSCRIPTION = "https://api.groq.com/openai/v1/audio/transcriptions";

// Transcription Model
const TRANSCRIPTION_MODEL = "whisper-large-v3";

const getLanguageCode = (langName) => {
    const map = {
        "english": "en",
        "hindi": "hi",
        "marathi": "mr",
        "bengali": "bn",
        "gujarati": "gu",
        "kannada": "kn",
        "malayalam": "ml",
        "punjabi": "pa",
        "tamil": "ta",
        "telugu": "te",
        "urdu": "ur",
        "assamese": "as",
        "oriya": "or",
        "odia": "or",
        "sanskrit": "sa"
    };
    return map[langName?.toLowerCase()] || "en";
};

export const processAudioWithGroq = async (audioBase64, mimeType, targetLanguage) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new ApiError(500, "GROQ_API_KEY is not set in environment");
    }

    let tempFilePath = null;
    try {
        // --- Step 1: Transcription with Groq Whisper ---
        const buffer = Buffer.from(audioBase64, 'base64');
        const ext = mimeType.includes('wav') ? 'wav' : 'mp3';
        tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}.${ext}`);

        fs.writeFileSync(tempFilePath, buffer);

        const formData = new FormData();
        const fileBuffer = fs.readFileSync(tempFilePath);
        const fileBlob = new Blob([fileBuffer], { type: mimeType || `audio/${ext}` });

        formData.append("file", fileBlob, `audio.${ext}`);
        formData.append("model", TRANSCRIPTION_MODEL);
        formData.append("response_format", "json");

        const transResponse = await fetch(GROQ_API_URL_TRANSCRIPTION, {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}` },
            body: formData
        });

        if (!transResponse.ok) {
            const err = await transResponse.text();
            throw new Error(`Groq Transcription API Error: ${transResponse.status} - ${err}`);
        }

        const transData = await transResponse.json();
        const transcription = transData.text;
        console.log("Transcription:", transcription);

        if (!transcription || transcription.trim().length === 0) {
            return "Unable to recognize speech.";
        }

        // --- Step 2: Translation with Google Translate ---
        const resolvedLanguage = targetLanguage || "English";
        const targetCode = getLanguageCode(resolvedLanguage);

        console.log(`Translating to ${resolvedLanguage} (${targetCode}) via Google Translate...`);

        const res = await translate(transcription, { to: targetCode });
        return res.text;

    } catch (error) {
        console.error("Processing Error:", error);
        throw new ApiError(500, error.message || "Failed to process audio");
    } finally {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try { fs.unlinkSync(tempFilePath); } catch (e) { /* ignore */ }
        }
    }
};
