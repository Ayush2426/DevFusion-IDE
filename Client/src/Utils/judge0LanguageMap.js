// This file maps file extensions to the language IDs required by the Judge0 API.
// A full list can be found at: https://api.judge0.com/languages

export const languageToJudge0Id = {
    js: 93,     // JavaScript (Node.js)
    jsx: 93,    // JavaScript (Node.js)
    ts: 94,     // TypeScript
    tsx: 94,    // TypeScript
    py: 71,     // Python 3.8.1
    java: 91,   // Java (JDK 17)
    c: 50,      // C (GCC 9.2.0)
    cpp: 54,    // C++ (GCC 9.2.0)
    cs: 51,     // C# (Mono 6.6.0)
    go: 95,     // Go (1.18.5)
    php: 68,    // PHP (7.4.1)
    // HTML/CSS are not executed on a server, they are rendered on the client.
};

export const getJudge0LanguageId = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    return languageToJudge0Id[extension] || null;
};
