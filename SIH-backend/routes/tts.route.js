import express from 'express';
import {
    textToSpeech,
    getSupportedLanguages,
    ttsHealthCheck
} from '../controllers/tts.controller.js';

const router = express.Router();

/**
 * TTS Routes
 * Base path: /api/tts
 */

// Health check (public)
router.get('/health', ttsHealthCheck);

// Get supported languages (public)
router.get('/languages', getSupportedLanguages);

// Convert text to speech (public)
router.post('/', textToSpeech);

export default router;
