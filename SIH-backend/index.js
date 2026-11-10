import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { processAudioWithGroq } from "./utils/groqHelper.js";
import { generateAudioFromText } from "./utils/ttsHelper.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store active language for each room (Hospital ID -> Language Code/Name)
const roomLanguages = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // User/Hospital joins a specific chat room
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);

    // Optional: Send current active language to the joining client
    const roomStr = String(room);
    if (roomLanguages.has(roomStr)) {
      socket.emit("language_update", { language: roomLanguages.get(roomStr) });
    }
  });

  // Handle language change from Hospital Portal
  socket.on("change_language", (data) => {
    const { room, language } = data;
    if (room && language) {
      const roomStr = String(room);
      roomLanguages.set(roomStr, language);
      console.log(`Room ${roomStr} language updated to: ${language}`);
      // Notify others in room if needed (e.g. to update UI)
      io.to(room).emit("language_update", { language });
    }
  });

  // Handle voice message
  socket.on("voice_message", async (data) => {
    /* 
      Expected data format:
      { 
        audio: "base64_encoded_string", 
        mimeType: "audio/wav" or "audio/mp3", 
        targetLanguage: "Hindi" (optional, will use room setting if available), 
        room: "room_id" 
      }
    */
    try {
      const { audio, mimeType, targetLanguage, room } = data;

      if (!audio) {
        socket.emit("error", { message: "Missing audio data" });
        return;
      }

      // DETERMINISTIC LANGUAGE SELECTION
      // 1. Priority: Language selected by Doctor for this Room
      // 2. Fallback: Language requested by Client (User App)
      // 3. Fallback: Default to "English"
      const roomStr = String(room);
      const activeLanguage = roomLanguages.get(roomStr) || targetLanguage || "English";

      console.log(`[DEBUG] Lang Selection - Room: ${roomStr}, Map: ${roomLanguages.get(roomStr)}, Client: ${targetLanguage} -> Final: ${activeLanguage}`);
      console.log(`[DEBUG] Current Language Map Keys:`, [...roomLanguages.keys()]);

      console.log(`Processing voice message for room ${room || 'self'} to Active Language: ${activeLanguage} via Groq`);

      const translatedText = await processAudioWithGroq(audio, mimeType, activeLanguage);

      const responsePayload = {
        originalSender: socket.id,
        text: translatedText,
        targetLanguage: activeLanguage, // Send back which language was used
        timestamp: new Date()
      };

      if (room) {
        // Check room size for debugging
        const clientsInRoom = io.sockets.adapter.rooms.get(room)?.size || 0;
        console.log(`Broadcasting to room "${room}" with ${clientsInRoom} active listeners.`);

        // Send to everyone in the room
        io.to(room).emit("receive_translated_message", responsePayload);
      } else {
        socket.emit("receive_translated_message", responsePayload);
      }

    } catch (error) {
      console.error("Socket Voice Processing Error:", error);
      socket.emit("error", { message: "Failed to process voice message" });
    }
  });

  // Handle Doctor's Voice Message (Hospital -> User)
  socket.on("doctor_voice_message", async (data) => {
    try {
      const { audio, mimeType, room } = data;
      const roomStr = String(room);

      // Determine Patient's Language (Based on what Doctor set for the room)
      const patientLanguage = roomLanguages.get(roomStr) || "English";

      console.log(`[Doctor Voice] Processing for room ${roomStr} -> Patient speak: ${patientLanguage}`);

      // Step 1: Transcribe & Translate (Doctor's Speech -> Patient's Language)
      const translatedTextForPatient = await processAudioWithGroq(audio, mimeType, patientLanguage);
      console.log(`[Doctor Voice] Translated Text: ${translatedTextForPatient}`);

      // Step 2: Convert Translated Text to Audio (TTS)
      // Google TTS expects language codes like 'hi', 'en'. 
      // We need to map 'Hindi' -> 'hi'.
      // Let's create a quick mapper or assume the helper handles strict names?
      // The helper `generateAudioFromText` calls `splitText` then `axios`.
      // It expects `lang` code.
      // `groqHelper` has `getLanguageCode`. Let's export it or duplicate it here? 
      // Actually, I should update `ttsHelper` to handle names or import the mapper.
      // For now, I'll export `getLanguageCode` from `groqHelper` and use it.

      // Wait, I can't easily export non-exported function from `groqHelper` without modifying it.
      // I will use a simple inline map here for safety.
      const langMap = {
        "english": "en", "hindi": "hi", "marathi": "mr", "bengali": "bn", "gujarati": "gu",
        "kannada": "kn", "malayalam": "ml", "punjabi": "pa", "tamil": "ta", "telugu": "te",
        "urdu": "ur"
      };
      const langCode = langMap[patientLanguage.toLowerCase()] || "en";

      const audioBuffer = await generateAudioFromText(translatedTextForPatient, langCode);

      // Step 3: Send Audio back to Patient (User App)
      const responsePayload = {
        originalSender: socket.id,
        text: translatedTextForPatient,
        audio: audioBuffer.toString('base64'),
        language: patientLanguage,
        timestamp: new Date()
      };

      if (room) {
        io.to(room).emit("receive_audio_message", responsePayload);
      } else {
        socket.emit("receive_audio_message", responsePayload);
      }

    } catch (error) {
      console.error("Doctor Voice Processing Error:", error);
      socket.emit("error", { message: "Failed to process doctor voice" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
