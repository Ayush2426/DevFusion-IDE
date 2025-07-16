import React from "react";
import { motion } from "framer-motion";
import { Terminal, X, Play, Loader2 } from "lucide-react";

const OutputTerminal = ({
  isVisible,
  onClose,
  onRunCode,
  output,
  isRunning,
}) => {
  const renderOutput = () => {
    if (isRunning) {
      return (
        <p className="text-yellow-400 flex items-center gap-2">
          <Loader2 className="animate-spin" /> Running code...
        </p>
      );
    }
    if (!output) {
      return (
        <>
          <p className="text-gray-400">
            $ Welcome to the DevFusion IDE terminal.
          </p>
          <p className="text-gray-400">
            $ Click "Run Code" to execute the active file.
          </p>
        </>
      );
    }
    return (
      <>
        {output.status && (
          <p className="text-gray-500">Status: {output.status}</p>
        )}
        {output.stdout && (
          <pre className="text-white whitespace-pre-wrap">{output.stdout}</pre>
        )}
        {output.stderr && (
          <pre className="text-red-400 whitespace-pre-wrap">
            {output.stderr}
          </pre>
        )}
        {output.compile_output && (
          <pre className="text-yellow-500 whitespace-pre-wrap">
            Compiler Output: {output.compile_output}
          </pre>
        )}
        {output.message && (
          <pre className="text-gray-500 whitespace-pre-wrap">
            {output.message}
          </pre>
        )}
      </>
    );
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: isVisible ? 0 : "100%" }}
      transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
      className="absolute bottom-0 left-0 right-0 h-1/3 bg-gray-900/80 backdrop-blur-md border-t-2 border-blue-500/50 shadow-2xl rounded-t-lg z-30"
    >
      <div className="h-full flex flex-col">
        {/* Terminal Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-2 bg-gray-800/50 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-gray-400" />
            <span className="font-mono text-sm font-bold">
              Output / Terminal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={onRunCode}
              disabled={isRunning}
              className="flex items-center gap-2 px-3 py-1 bg-green-600/50 hover:bg-green-600/80 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-wait"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isRunning ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Play size={14} />
              )}
              {isRunning ? "Running..." : "Run Code"}
            </motion.button>
            <motion.button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-md"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={18} />
            </motion.button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="flex-grow p-4 overflow-y-auto font-mono text-sm">
          {renderOutput()}
        </div>
      </div>
    </motion.div>
  );
};

export default OutputTerminal;
