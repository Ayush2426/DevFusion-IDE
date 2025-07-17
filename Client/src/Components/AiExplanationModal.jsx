import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BrainCircuit } from 'lucide-react';

const AiExplanationModal = ({ isVisible, onClose, content }) => {
    // A simple markdown parser for bullet points
    const formatContent = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, index) => {
            if (line.trim().startsWith('- ')) {
                return <li key={index} className="ml-4 list-disc">{line.substring(2)}</li>;
            }
            if (line.trim().length > 0) {
                return <p key={index} className="mb-2">{line}</p>;
            }
            return null;
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="bg-gray-800 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl text-white flex flex-col"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        {/* Header */}
                        <header className="flex justify-between items-center p-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <BrainCircuit size={24} className="text-purple-400" />
                                <h2 className="text-xl font-bold">AI Explanation</h2>
                            </div>
                            <motion.button
                                onClick={onClose}
                                className="p-1 hover:bg-white/10 rounded-full"
                                whileHover={{ scale: 1.1, rotate: 90 }}
                            >
                                <X size={20} />
                            </motion.button>
                        </header>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            {formatContent(content)}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AiExplanationModal;
