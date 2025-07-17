import { toast } from "sonner";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Helper to make API calls
async function callGeminiAPI(prompt) {
  if (!API_KEY) {
    toast.error(
      "Gemini API key is not configured. Please check your .env.local file."
    );
    return null;
  }

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Failed to get response from AI."
      );
    }

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0) {
      let text = data.candidates[0].content.parts[0].text;
      text = text.replace(/```[a-z]*\n/g, "").replace(/```/g, "");
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

export const generateCode = async (codeBeforeCursor) => {
  // --- UPDATED PROMPT to be more specific ---
  const prompt = `You are an expert AI code completion assistant.
    Your task is to complete the provided code snippet starting from the user's cursor.
    Analyze the indentation and context of the code before the cursor to provide a seamless completion.
    Only return the raw code that should be inserted at the cursor position. Do not include any explanations, markdown formatting, or the original code.

    Here is the code up to the cursor:
    ---
    ${codeBeforeCursor}
    ---
    Now, provide the completion:`;
  return callGeminiAPI(prompt);
};

export const explainCode = async (codeToExplain) => {
  const prompt = `As an expert code analyst, provide a concise explanation of the following code snippet.
    Your response must be structured as follows:
    1. A single, one-sentence summary of the code's primary function.
    2. A blank line.
    3. A short, bulleted list detailing the key components or steps, using a hyphen (-) for each bullet point. Do not use asterisks.
    Keep the entire explanation under 100 words.

    Code to explain:
    \`\`\`
    ${codeToExplain}
    \`\`\``;
  return callGeminiAPI(prompt);
};

export const findBugs = async (codeToAnalyze) => {
  const prompt = `You are a world-class AI code analyst. Analyze the following code for potential bugs, security vulnerabilities, or logical errors. If you find issues, describe them clearly and suggest a fix. If no bugs are found, simply respond with "No obvious bugs found."\n\nCode:\n\`\`\`\n${codeToAnalyze}\n\`\`\``;
  return callGeminiAPI(prompt);
};
