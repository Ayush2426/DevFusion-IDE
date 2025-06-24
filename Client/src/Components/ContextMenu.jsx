import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const ContextMenu = ({ x, y, options, onClose }) => {
    const menuRef = useRef(null);

    // Effect to handle clicking outside the menu to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            style={{ top: y, left: x }}
            className="absolute bg-gray-800 border border-white/10 rounded-lg shadow-2xl p-1 z-50"
        >
            {options.map((option, index) => (
                <button
                    key={index}
                    onClick={() => {
                        option.action();
                        onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-1.5 text-sm rounded-md transition-colors ${option.style === 'danger'
                            ? 'text-red-400 hover:bg-red-500/20'
                            : 'text-gray-200 hover:bg-white/10'
                        }`}
                >
                    {option.icon}
                    <span>{option.label}</span>
                </button>
            ))}
        </motion.div>
    );
};

export default ContextMenu;
