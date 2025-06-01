"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    const currentWord = wordsArray[currentWordIndex];
    const fullText = currentWord.text.join("");

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (currentCharIndex < fullText.length) {
          setDisplayedText(fullText.slice(0, currentCharIndex + 1));
          setCurrentCharIndex(currentCharIndex + 1);
        } else {
          // Word is complete, wait then start deleting
          setTimeout(() => setIsDeleting(true), 1000);
        }
      } else {
        if (currentCharIndex > 0) {
          setDisplayedText(fullText.slice(0, currentCharIndex - 1));
          setCurrentCharIndex(currentCharIndex - 1);
        } else {
          // Word is deleted, move to next word
          setIsDeleting(false);
          setCurrentWordIndex((currentWordIndex + 1) % wordsArray.length);
        }
      }
    }, isDeleting ? 50 : 150);

    return () => clearTimeout(timer);
  }, [currentCharIndex, currentWordIndex, isDeleting, wordsArray]);

  const renderWords = () => {
    const currentWord = wordsArray[currentWordIndex];
    return (
      <span className={cn(currentWord.className)}>
        {displayedText}
      </span>
    );
  };

  return (
    <div className={cn("text-base sm:text-xl md:text-3xl lg:text-5xl font-bold text-center", className)}>
      {renderWords()}
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[4px] h-4 md:h-6 lg:h-10 bg-blue-500",
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
}; 