import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const AnimatedButton = ({ text = 'Get Started', onClick, disabled = false, fullWidth = false, type = 'button' }) => {
    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(255,255,255,0.2)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`
        flex items-center justify-center gap-2 px-6 py-3 font-bold text-white rounded-lg
        bg-gradient-to-r from-blue-600 to-purple-600
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
      `}
        >
            {text}
            <motion.div
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
            >
                <ArrowRight size={20} />
            </motion.div>
        </motion.button>
    );
};

export default AnimatedButton;
