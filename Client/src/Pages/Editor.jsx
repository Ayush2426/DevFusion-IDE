import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BrainCircuit, Bot, Sparkles, Clipboard, Terminal as TerminalIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { v4 as uuidv4 } from 'uuid';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

import FileExplorer from '../components/FileExplorer';
import OutputTerminal from '../components/OutputTerminal';
import { getLanguageExtension } from '../utils/languageUtils';
import { getJudge0LanguageId } from '../utils/judge0LanguageMap';
import { runCode } from '../services/judge0Service';
import { generateCode, explainCode, findBugs } from '../services/geminiService';

const Editor = ({ roomId, onExit }) => {
    const [roomData, setRoomData] = useState(null);
    const [activeFileId, setActiveFileId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isTerminalVisible, setIsTerminalVisible] = useState(false);
    const [isRunningCode, setIsRunningCode] = useState(false);
    const [terminalOutput, setTerminalOutput] = useState(null);

    const [isAiLoading, setIsAiLoading] = useState(false);

    const isUpdatingFromFirestore = useRef(false);

    useEffect(() => {
        if (!roomId) return;
        const roomRef = doc(db, 'rooms', roomId);
        const unsubscribe = onSnapshot(roomRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                isUpdatingFromFirestore.current = true;
                setRoomData(data);
                if (!activeFileId && data.fileTree && Object.keys(data.fileTree).length > 0) {
                    const firstFileId = Object.keys(data.fileTree).find(id => data.fileTree[id].type === 'file');
                    if (firstFileId) setActiveFileId(firstFileId);
                }
            } else {
                toast.error("Room not found.");
                onExit();
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [roomId, onExit]);

    const updateFirestoreFileTree = (newFileTree) => {
        const roomRef = doc(db, 'rooms', roomId);
        setDoc(roomRef, { fileTree: newFileTree }, { merge: true });
    };

    const handleCodeChange = useCallback((newCode) => {
        if (isUpdatingFromFirestore.current) {
            isUpdatingFromFirestore.current = false;
            return;
        }
        if (roomData && activeFileId) {
            const updatedFileTree = { ...roomData.fileTree, [activeFileId]: { ...roomData.fileTree[activeFileId], content: newCode } };
            updateFirestoreFileTree(updatedFileTree);
        }
    }, [roomData, activeFileId, roomId]);

    const handleCreateFile = () => {
        const fileName = prompt("Enter a name for the new file:", "new-file.js");
        if (fileName && roomData) {
            const newFileId = uuidv4();
            const newFile = { id: newFileId, name: fileName, type: 'file', content: `// ${fileName}\n` };
            const newFileTree = { ...roomData.fileTree, [newFileId]: newFile };
            updateFirestoreFileTree(newFileTree);
            setActiveFileId(newFileId);
        }
    };

    const handleDeleteItem = (itemId) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            const newFileTree = { ...roomData.fileTree };
            delete newFileTree[itemId];
            updateFirestoreFileTree(newFileTree);
            // If the deleted file was the active one, clear the editor
            if (activeFileId === itemId) {
                setActiveFileId(null);
            }
        }
    };

    const handleRunCode = async () => {
        if (!activeFile) return;

        const languageId = getJudge0LanguageId(activeFile.name);
        if (!languageId) {
            toast.error(`Execution for .${activeFile.name.split('.').pop()} files is not supported yet.`);
            return;
        }

        setIsTerminalVisible(true);
        setIsRunningCode(true);
        setTerminalOutput(null);

        const result = await runCode(activeFile.content, languageId);
        setTerminalOutput(result);
        setIsRunningCode(false);
    };

    const handleAiAction = async (action) => {
        if (!activeFile || isAiLoading) return;
        setIsAiLoading(true);

        let result;
        switch (action) {
            case 'complete':
                toast.info("AI is completing your code...");
                result = await generateCode(activeFile.content);
                if (result) {
                    const newCode = activeFile.content + result;
                    handleCodeChange(newCode); // Update editor and Firestore
                    toast.success("AI finished generating code.");
                }
                break;
            case 'explain':
                toast.info("AI is explaining the code...");
                result = await explainCode(activeFile.content);
                if (result) toast.message("AI Explanation", { description: result, duration: 15000 });
                break;
            case 'bugs':
                toast.info("AI is looking for bugs...");
                result = await findBugs(activeFile.content);
                if (result) toast.message("AI Bug Report", { description: result, duration: 15000 });
                break;
            default:
                break;
        }
        setIsAiLoading(false);
    };

    const handleCopyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        toast.success("Room ID copied to clipboard!");
    };

    if (isLoading || !roomData) {
        return <div className="flex items-center justify-center h-screen bg-gray-900 text-white"><p>Loading DevFusion IDE...</p></div>;
    }

    const activeFile = roomData.fileTree && activeFileId ? roomData.fileTree[activeFileId] : null;

    const AILoadingButton = ({ text }) => (
        <button disabled className="w-full flex items-center justify-center gap-3 p-3 bg-gray-600/50 rounded-lg">
            <Loader2 size={18} className="animate-spin" /><span>{text}</span>
        </button>
    );

    return (
        <motion.div
            key="editor-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }} className="flex flex-col h-screen bg-gray-900 text-white font-sans overflow-hidden"
        >
            <header className="flex-shrink-0 bg-gray-800/50 backdrop-blur-sm p-3 flex justify-between items-center border-b border-white/10 shadow-lg z-20">
                <div className="flex items-center gap-4">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onExit} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                        <ArrowLeft size={20} />
                        <span>Exit Room</span>
                    </motion.button>
                    <div>
                        <h2 className="font-semibold text-md leading-tight text-white">{roomData.objective}</h2>
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                            <span>ROOM ID: {roomId}</span>
                            <Clipboard size={14} className="cursor-pointer hover:text-white transition-colors" onClick={handleCopyRoomId} />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-grow flex overflow-hidden relative">
                <FileExplorer
                    fileTree={roomData.fileTree}
                    onSelectFile={setActiveFileId}
                    onCreateFile={handleCreateFile}
                    onDeleteItem={handleDeleteItem}
                />
                <main className="flex-grow flex flex-col bg-gray-900">
                    <div className="flex-grow bg-black/30 flex items-center justify-center">
                        {activeFile ? (
                            <CodeMirror
                                value={activeFile.content}
                                height="100%"
                                theme={vscodeDark}
                                extensions={[getLanguageExtension(activeFile.name)]}
                                onChange={handleCodeChange}
                                style={{ fontSize: '16px', width: '100%', height: '100%' }}
                            />
                        ) : (
                            <p className="text-gray-500">Select a file to start editing.</p>
                        )}
                    </div>
                </main>
                <aside className="w-80 flex-shrink-0 bg-gray-800/30 border-l border-white/10 p-4 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <BrainCircuit size={24} className="text-purple-400" />
                        <h3 className="text-xl font-bold">AI Assistant</h3>
                    </div>
                    <div className="flex-grow space-y-4">
                        {isAiLoading ? <AILoadingButton text="Thinking..." /> : (
                            <>
                                <button onClick={() => handleAiAction('complete')} className="w-full flex items-center gap-3 p-3 bg-blue-600/50 hover:bg-blue-600/80 rounded-lg transition-colors"><Sparkles size={18} /><span>Complete Code</span></button>
                                <button onClick={() => handleAiAction('explain')} className="w-full flex items-center gap-3 p-3 bg-green-600/50 hover:bg-green-600/80 rounded-lg transition-colors"><Bot size={18} /><span>Explain Code</span></button>
                                <button onClick={() => handleAiAction('bugs')} className="w-full flex items-center gap-3 p-3 bg-red-600/50 hover:bg-red-600/80 rounded-lg transition-colors"><Bot size={18} /><span>Find Bugs</span></button>
                            </>
                        )}
                    </div>
                    <div className="text-center text-xs text-gray-500">Powered by Google Gemini</div>
                </aside>
                <OutputTerminal isVisible={isTerminalVisible} onClose={() => setIsTerminalVisible(false)} onRunCode={handleRunCode} output={terminalOutput} isRunning={isRunningCode} />
            </div>

            <footer className="flex-shrink-0 bg-gray-800/50 px-4 py-1.5 flex items-center justify-between text-xs border-t border-white/10 z-20">
                <div className="flex items-center gap-4">
                    <p>Ready</p>
                </div>
                <button onClick={() => setIsTerminalVisible(!isTerminalVisible)} className="flex items-center gap-2 hover:text-white transition-colors text-gray-400">
                    <TerminalIcon size={14} />
                    <span>Toggle Terminal</span>
                </button>
            </footer>
        </motion.div>
    );
};

export default Editor;
