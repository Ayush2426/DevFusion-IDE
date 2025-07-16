import { toast } from "sonner";

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";
const RAPIDAPI_HOST = "judge0-ce.p.rapidapi.com";

const createSubmission = async (sourceCode, languageId) => {
  const url = `${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`; // Using base64 for safety
  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
      "X-RapidAPI-Host": RAPIDAPI_HOST,
    },
    body: JSON.stringify({
      language_id: languageId,
      source_code: btoa(sourceCode), // Encode source code to base64
    }),
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.message || response.statusText}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating submission:", error);
    toast.error(`Execution Error: ${error.message}`);
    return null;
  }
};

export const runCode = async (sourceCode, languageId) => {
  if (!import.meta.env.VITE_RAPIDAPI_KEY) {
    toast.error(
      "RapidAPI key is not configured. Please check your .env.local file."
    );
    return {
      stdout: "Error: RapidAPI key not found.",
      stderr: null,
      compile_output: null,
      message: "Configuration error.",
    };
  }

  const result = await createSubmission(sourceCode, languageId);

  if (!result) return null;

  // --- FIX: Check if each field exists before decoding ---
  return {
    stdout: result.stdout ? atob(result.stdout) : null,
    stderr: result.stderr ? atob(result.stderr) : null,
    compile_output: result.compile_output ? atob(result.compile_output) : null,
    message: result.message ? atob(result.message) : null,
    status: result.status.description,
  };
};
