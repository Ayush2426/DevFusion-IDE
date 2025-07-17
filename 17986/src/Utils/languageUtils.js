import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { php } from '@codemirror/lang-php';
import { python } from '@codemirror/lang-python';

// This map helps us get the correct CodeMirror language extension
const languageMap = {
    js: javascript({ jsx: true }),
    jsx: javascript({ jsx: true }),
    ts: javascript({ jsx: true, typescript: true }),
    tsx: javascript({ jsx: true, typescript: true }),
    py: python(),
    java: java(),
    c: cpp(),
    cpp: cpp(),
    cs: cpp(), // C# can use the C++ highlighter for basic syntax
    go: python(), // Go can use the Python highlighter as a basic alternative
    php: php(),
    html: html(),
    css: css(),
    json: javascript({ jsx: false }),
    md: javascript({ jsx: false }), // Markdown can just be plain text
};

export const getLanguageExtension = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    return languageMap[extension] || []; // Return an empty array for unsupported languages
};
