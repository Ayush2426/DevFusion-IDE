import { toast } from 'sonner';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Helper to make API calls
async function callGeminiAPI(prompt) {
    if (!API_KEY) {
        toast.error("Gemini API key is not configured. Please check your .env.local file.");
        return null;
    }

    const payload = {
        contents: [{
            parts: [{ text: prompt }]
        }]
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to get response from AI.');
        }

        const data = await response.json();

        if (data.candidates && data.candidates.length > 0) {
            // Clean up the response to remove markdown code blocks
            let text = data.candidates[0].content.parts[0].text;
            text = text.replace(/```[a-z]*\n/g, '').replace(/```/g, '');
            return text.trim();
        } else {
            throw new Error("No content received from AI.");
        }
    } catch (error) {
        console.error("Gemini API Error:", error);
        toast.error(`AI Error: ${error.message}`);
        return null;
    }
}


export const generateCode = async (existingCode) => {
    const prompt = `You are a world-class AI coding assistant. Your task is to complete the following code snippet. Only return the code that should be added, without any explanation or markdown formatting.\n\nCode to complete:\n\`\`\`\n${existingCode}\n\`\`\``;
    return callGeminiAPI(prompt);
};

export const explainCode = async (codeToExplain) => {
    const prompt = `You are a world-class AI coding assistant. Explain the following code snippet in a clear, concise, and easy-to-understand way. Use bullet points for key aspects.\n\nCode:\n\`\`\`\n${codeToExplain}\n\`\`\``;
    return callGeminiAPI(prompt);
};

export const findBugs = async (codeToAnalyze) => {
    const prompt = `You are a world-class AI code analyst. Analyze the following code for potential bugs, security vulnerabilities, or logical errors. If you find issues, describe them clearly and suggest a fix. If no bugs are found, simply respond with "No obvious bugs found."\n\nCode:\n\`\`\`\n${codeToAnalyze}\n\`\`\``;
    return callGeminiAPI(prompt);
};
export const refactorCode = async (codeToRefactor) => {
    const prompt = `You are a world-class AI coding assistant. Refactor the following code to improve its readability, performance, and maintainability. Only return the refactored code without any explanation or markdown formatting.\n\nCode to refactor:\n\`\`\`\n${codeToRefactor}\n\`\`\``;
    return callGeminiAPI(prompt);
};

