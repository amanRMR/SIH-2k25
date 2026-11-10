import 'dotenv/config';
import axios from 'axios';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("GEMINI_API_KEY is not set in environment");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log(`Fetching models from: ${url.replace(API_KEY, 'HIDDEN_KEY')}`);

try {
    const response = await axios.get(url);
    const models = response.data.models;

    console.log("\nAvailable Models:");
    const names = models
        .filter(m => m.supportedGenerationMethods.includes("generateContent"))
        .map(m => m.name);

    const fs = await import('fs');
    fs.writeFileSync('models_utf8.txt', names.join("\n"), 'utf8');
    console.log("Written to models_utf8.txt");

} catch (error) {
    console.error("Error fetching models:");
    if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(JSON.stringify(error.response.data, null, 2));
    } else {
        console.error(error.message);
    }
}
