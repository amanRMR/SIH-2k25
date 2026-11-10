import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function listModels() {
    try {
        const response = await fetch(URL);
        const data = await response.json();
        if (data.models) {
            const names = data.models
                .filter(m => m.supportedGenerationMethods.includes("generateContent"))
                .map(m => m.name)
                .join("\n");
            fs.writeFileSync("valid_models.txt", names);
        }
    } catch (error) {
        fs.writeFileSync("valid_models.txt", error.message);
    }
}

listModels();
