import React from 'react';
import { motion } from 'framer-motion';

const AnimatedInput = ({ value, onChange, placeholder, type = "text", required = false, icon: Icon }) => {
    return (
        <motion.div
            className="relative w-full"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`
          w-full p-3 rounded-lg bg-gray-800/50 border-2 border-gray-700 
          text-white placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-300
          ${Icon ? 'pl-10' : 'pl-4'}
        `}
            />
        </motion.div>
    );
};

export default AnimatedInput;
