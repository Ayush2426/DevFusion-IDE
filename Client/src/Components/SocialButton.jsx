import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Linkedin,
  Github,
  Instagram,
  Mail,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "../Lib/util";

const SocialButton = ({ className, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);

  const socialLinks = [
    {
      icon: Linkedin,
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/ayush-verma-a076a7360/",
    }, 
    { icon: Github, label: "GitHub", href: "https://github.com/Ayush2426" }, 
    {
      icon: Instagram,
      label: "Instagram",
      href: "https://www.instagram.com/_ayush__vrma_/",
    }, 
    { icon: Mail, label: "Mail", href: "mailto:ayushhhverma07@gmail.com" }, 
  ];

  const handleLinkClick = (href) => {
    window.open(href, "_blank");
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <motion.div
        animate={{ opacity: isVisible ? 0 : 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="w-full"
      >
        <button
          className={cn(
            "w-48 relative h-10 px-4 py-2 flex items-center justify-center gap-2",
            "bg-gray-800/50 dark:bg-black/30",
            "hover:bg-gray-700/70 dark:hover:bg-black/50",
            "text-white dark:text-gray-200",
            "border border-white/10 dark:border-white/20",
            "backdrop-blur-md rounded-lg",
            "transition-colors duration-200",
            className
          )}
          {...props}
        >
          <span className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Ayush's Socials
          </span>
        </button>
      </motion.div>

      <motion.div
        className="absolute top-0 left-0 flex h-10 overflow-hidden"
        animate={{ width: isVisible ? "192px" : "48px" }} 
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        {socialLinks.map((button, i) => (
          <motion.a
            key={`social-${button.label}`}
            href={button.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={button.label}
            onClick={() => handleLinkClick(button.href)}
            className={cn(
              "h-10 w-12 flex items-center justify-center",
              "bg-black/30 dark:bg-gray-800/50",
              "text-white dark:text-gray-200",
              "border-r border-white/10 dark:border-white/20 last:border-r-0",
              "hover:bg-black/50 dark:hover:bg-gray-700/70",
              "outline-none relative overflow-hidden transition-colors duration-200",
              i === 0 && "rounded-l-lg",
              i === socialLinks.length - 1 && "rounded-r-lg"
            )}
            animate={{
              opacity: isVisible ? 1 : 0,
              x: isVisible ? 0 : -20,
            }}
            transition={{
              duration: 0.3,
              ease: [0.23, 1, 0.32, 1],
              delay: isVisible ? i * 0.07 : 0,
            }}
          >
            <button.icon className="w-5 h-5" />
          </motion.a>
        ))}
      </motion.div>
    </div>
  );
};

export default SocialButton;
