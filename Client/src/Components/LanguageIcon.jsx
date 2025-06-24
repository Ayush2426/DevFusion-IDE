import React from 'react';
import { File, FileJson, FileText, Image, Code as CodeIcon, Braces, Pilcrow, FileCode } from 'lucide-react';

const LanguageIcon = ({ filename }) => {
    const extension = filename.split('.').pop().toLowerCase();

    switch (extension) {
        // --- Frontend & Scripting ---
        case 'js':
        case 'jsx':
            return <CodeIcon size={16} className="text-yellow-400" />;
        case 'ts':
        case 'tsx':
            return <Braces size={16} className="text-blue-400" />;
        case 'py':
            return <Pilcrow size={16} className="text-green-400" />;
        case 'go':
            return <FileCode size={16} className="text-teal-400" />;
        case 'php':
            return <FileCode size={16} className="text-indigo-400" />;

        // --- Web Structure & Styling ---
        case 'html':
            return <CodeIcon size={16} className="text-orange-500" />;
        case 'css':
            return <FileCode size={16} className="text-blue-500" />;

        // --- Compiled Languages ---
        case 'java':
            return <FileCode size={16} className="text-red-500" />;
        case 'c':
        case 'h':
            return <FileCode size={16} className="text-blue-600" />;
        case 'cpp':
            return <FileCode size={16} className="text-blue-600" />;
        case 'cs':
            return <FileCode size={16} className="text-purple-500" />;

        // --- Data & Docs ---
        case 'json':
            return <FileJson size={16} className="text-yellow-600" />;
        case 'md':
            return <FileText size={16} className="text-gray-400" />;

        // --- Images ---
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
            return <Image size={16} className="text-purple-400" />;

        default:
            return <File size={16} className="text-gray-500" />;
    }
};

export default LanguageIcon;
