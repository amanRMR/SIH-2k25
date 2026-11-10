import ApiError from "./apiError.js";

const MODELS = [
    "gemini-1.5-flash-001",
    "gemini-1.5-flash",
    "gemini-2.0-flash-lite-preview-02-05", // Specific version from your list
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash"
];

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export const generateGeminiContent = async (parts) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new ApiError(500, "GEMINI_API_KEY is not set in environment");
    }

    let lastError = null;

    for (const model of MODELS) {
        try {
            console.log(`Attempting Gemini request with model: ${model}`);
            const response = await fetch(`${BASE_URL}/${model}:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: parts
                    }]
                })
            });

            if (!response.ok) {
                const text = await response.text();
                // If it's a 429 (Resource Exhausted) or 404 (Not Found), try next model
                if (response.status === 429 || response.status === 404) {
                    console.warn(`Model ${model} failed with status ${response.status}. Retrying with next model...`);
                    lastError = new Error(`Gemini API error: ${response.status} - ${text}`);
                    continue;
                }
                // For other errors (500, etc.), throw immediately
                throw new Error(`Gemini API error: ${response.status} - ${text}`);
            }

            const data = await response.json();
            return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        } catch (error) {
            console.error(`Error with model ${model}:`, error.message);
            lastError = error;
            // Continue to next model only if the loop isn't finished
        }
    }

    // If we exhausted all models
    console.error("All Gemini models failed.");
    throw new ApiError(500, lastError?.message || "All Gemini models failed to generate content.");
};
