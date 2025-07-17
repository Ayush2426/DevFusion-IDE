import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
    return (
        <div className="absolute inset-0 w-full h-full bg-gray-900 overflow-hidden -z-10">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                    x: ['-20%', '20%', '-20%'],
                    y: ['-20%', '20%', '-20%'],
                }}
                transition={{
                    duration: 40,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "mirror",
                }}
                className="absolute top-0 left-0 w-96 h-96 bg-blue-900/30 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -90, 0],
                    x: ['20%', '-20%', '20%'],
                    y: ['20%', '-20%', '20%'],
                }}
                transition={{
                    duration: 35,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "mirror",
                }}
                className="absolute bottom-0 right-0 w-80 h-80 bg-purple-900/30 rounded-full blur-3xl"
            />
        </div>
    );
};

export default AnimatedBackground;
