import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BrainCircuit,
  Bot,
  Sparkles,
  Clipboard,
  Terminal as TerminalIcon,
  Eye,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../Firebase/firebase";
import { v4 as uuidv4 } from "uuid";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

import FileExplorer from "../Components/FileExplorer";
import OutputTerminal from "../Components/OutputTerminal";
import AiExplanationModal from "../Components/AiExplanationModal";
import { getLanguageExtension } from "../Utils/languageUtils";
import { getJudge0LanguageId } from "../Utils/judge0LanguageMap";
import { runCode } from "../services/judge0Service";
import { generateCode, explainCode, findBugs } from "../services/geminiService";

const Editor = ({ roomId, onExit }) => {
  const [roomData, setRoomData] = useState(null);
  const [activeFileId, setActiveFileId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isTerminalVisible, setIsTerminalVisible] = useState(false);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState(null);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExplanationVisible, setIsExplanationVisible] = useState(false);
  const [explanationContent, setExplanationContent] = useState("");

  const editorViewRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;
    const roomRef = doc(db, "rooms", roomId);

    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const remoteData = docSnap.data();
        setRoomData((currentLocalData) => {
          const localVersion = JSON.stringify(currentLocalData?.fileTree);
          const remoteVersion = JSON.stringify(remoteData.fileTree);
          if (localVersion !== remoteVersion) return remoteData;
          return currentLocalData;
        });
      } else {
        toast.error("Room not found.");
        onExit();
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [roomId, onExit]);

  useEffect(() => {
    if (
      !activeFileId &&
      roomData?.fileTree &&
      Object.keys(roomData.fileTree).length > 0
    ) {
      const firstFileId = Object.keys(roomData.fileTree).find(
        (id) => roomData.fileTree[id].type === "file"
      );
      if (firstFileId) setActiveFileId(firstFileId);
    }
  }, [roomData, activeFileId]);

  const updateFirestoreFileTree = (newFileTree) => {
    const roomRef = doc(db, "rooms", roomId);
    setDoc(roomRef, { fileTree: newFileTree }, { merge: true });
  };

  const handleCodeChange = useCallback(
    (newCode) => {
      if (!roomData || !activeFileId) return;
      const updatedFileTree = {
        ...roomData.fileTree,
        [activeFileId]: {
          ...roomData.fileTree[activeFileId],
          content: newCode,
        },
      };
      setRoomData((prev) => ({ ...prev, fileTree: updatedFileTree }));
      updateFirestoreFileTree(updatedFileTree);
    },
    [roomData, activeFileId, roomId]
  );

  const handleCreateFile = () => {
    const fileName = prompt("Enter a name for the new file:", "new-file.js");
    if (fileName && roomData) {
      const newFileId = uuidv4();
      const newFile = {
        id: newFileId,
        name: fileName,
        type: "file",
        content: `// ${fileName}\n`,
      };
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
      if (activeFileId === itemId) setActiveFileId(null);
    }
  };

  const handleOpenPreview = () => {
    if (!roomData?.fileTree) {
      toast.error("No files to preview.");
      return;
    }
    let html = "",
      css = "",
      js = "";
    Object.values(roomData.fileTree).forEach((file) => {
      if (file.name.endsWith(".html")) html += file.content + "\n";
      if (file.name.endsWith(".css")) css += file.content + "\n";
      if (file.name.endsWith(".js")) js += file.content + "\n";
    });
    if (!html && !css && !js) {
      toast.info("No HTML, CSS, or JS files to preview.");
      return;
    }
    const previewBlob = new Blob(
      [
        `<html><head><style>${css}</style></head><body>${html}<script type="module">${js}</script></body></html>`,
      ],
      { type: "text/html" }
    );
    window.open(URL.createObjectURL(previewBlob), "_blank");
    toast.success("Live preview opened in a new tab!");
  };

  const handleRunCode = async () => {
    const activeFile = roomData?.fileTree?.[activeFileId];
    if (!activeFile) return;
    const extension = activeFile.name.split(".").pop();
    if (["html", "css", "js"].includes(extension)) {
      toast.info("Use 'Open Live Preview' for web files.");
      return;
    }
    const languageId = getJudge0LanguageId(activeFile.name);
    if (!languageId) {
      toast.error(`Execution for .${extension} files not supported.`);
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
    const activeFile = roomData?.fileTree?.[activeFileId];
    if (!activeFile || isAiLoading || !editorViewRef.current) return;

    const editorState = editorViewRef.current.state;
    const selection = editorState.selection.main;

    setIsAiLoading(true);

    let result;
    switch (action) {
      case "complete":
        toast.info("AI is completing your code...");
        const codeBeforeCursor = editorState.doc.sliceString(0, selection.head);
        result = await generateCode(codeBeforeCursor);
        if (result) {
          editorViewRef.current.dispatch({
            changes: { from: selection.head, insert: result },
          });
          toast.success("AI finished generating code.");
        }
        break;
      case "explain":
        toast.info("AI is explaining the code...");
        const codeToExplain = selection.empty
          ? activeFile.content
          : editorState.sliceDoc(selection.from, selection.to);
        result = await explainCode(codeToExplain);
        if (result) {
          setExplanationContent(result);
          setIsExplanationVisible(true);
        }
        break;
      case "bugs":
        toast.info("AI is looking for bugs...");
        const codeToAnalyze = selection.empty
          ? activeFile.content
          : editorState.sliceDoc(selection.from, selection.to);
        result = await findBugs(codeToAnalyze);
        if (result) {
          setExplanationContent(result);
          setIsExplanationVisible(true);
        }
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
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Loading DevFusion IDE...</p>
      </div>
    );
  }

  const activeFile =
    roomData.fileTree && activeFileId ? roomData.fileTree[activeFileId] : null;

  return (
    <motion.div
      key="editor-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-screen bg-gray-900 text-white font-sans overflow-hidden"
    >
      <AiExplanationModal
        isVisible={isExplanationVisible}
        onClose={() => setIsExplanationVisible(false)}
        content={explanationContent}
      />

      <header className="flex-shrink-0 bg-gray-800/50 backdrop-blur-sm p-3 flex justify-between items-center border-b border-white/10 shadow-lg z-20">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onExit}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Exit Room</span>
          </motion.button>
          <div>
            <h2 className="font-semibold text-md leading-tight text-white">
              {roomData.objective}
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
              <span>ROOM ID: {roomId}</span>
              <Clipboard
                size={14}
                className="cursor-pointer hover:text-white transition-colors"
                onClick={handleCopyRoomId}
              />
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
        {/* --- FIX: Added min-w-0 to the main panel to prevent flexbox overflow --- */}
        <main className="flex-grow flex flex-col bg-gray-900 min-w-0">
          <div
            className={`flex-grow bg-black/30 ${
              !activeFile ? "flex items-center justify-center" : "min-h-0"
            }`}
          >
            {activeFile ? (
              <CodeMirror
                value={activeFile.content}
                height="100%"
                theme={vscodeDark}
                extensions={[getLanguageExtension(activeFile.name)]}
                onChange={handleCodeChange}
                onCreateEditor={(view) => {
                  editorViewRef.current = view;
                }}
                style={{ fontSize: "16px", width: "100%", height: "100%" }}
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
            {isAiLoading ? (
              <button
                disabled
                className="w-full flex items-center justify-center gap-3 p-3 bg-gray-600/50 rounded-lg"
              >
                <Loader2 size={18} className="animate-spin" />
                <span>Thinking...</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleAiAction("complete")}
                  className="w-full flex items-center gap-3 p-3 bg-blue-600/50 hover:bg-blue-600/80 rounded-lg transition-colors"
                >
                  <Sparkles size={18} />
                  <span>Complete Code</span>
                </button>
                <button
                  onClick={() => handleAiAction("explain")}
                  className="w-full flex items-center gap-3 p-3 bg-green-600/50 hover:bg-green-600/80 rounded-lg transition-colors"
                >
                  <Bot size={18} />
                  <span>Explain Code</span>
                </button>
                <button
                  onClick={() => handleAiAction("bugs")}
                  className="w-full flex items-center gap-3 p-3 bg-red-600/50 hover:bg-red-600/80 rounded-lg transition-colors"
                >
                  <Bot size={18} />
                  <span>Find Bugs</span>
                </button>
              </>
            )}
          </div>
          <div className="text-center text-xs text-gray-500">
            Powered by Google Gemini
          </div>
        </aside>

        <OutputTerminal
          isVisible={isTerminalVisible}
          onClose={() => setIsTerminalVisible(false)}
          onRunCode={handleRunCode}
          output={terminalOutput}
          isRunning={isRunningCode}
        />
      </div>

      <footer className="flex-shrink-0 bg-gray-800/50 px-4 py-1.5 flex items-center justify-between text-xs border-t border-white/10 z-20">
        <div className="flex items-center gap-4">
          <p>Ready</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleOpenPreview}
            className="flex items-center gap-2 hover:text-white transition-colors text-gray-400"
          >
            <Eye size={14} />
            <span>Open Live Preview</span>
          </button>
          <button
            onClick={() => setIsTerminalVisible(!isTerminalVisible)}
            className="flex items-center gap-2 hover:text-white transition-colors text-gray-400"
          >
            <TerminalIcon size={14} />
            <span>Toggle Terminal</span>
          </button>
        </div>
      </footer>
    </motion.div>
  );
};

export default Editor;
