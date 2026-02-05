"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypewriterProps {
  phrases: { text: string; emoji?: string }[];
  className?: string; // Applied to the text (gradient)
  emojiClassName?: string; // Applied to the emoji (usually just font size adjustment)
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export function LoopingTypewriter({
  phrases,
  className = "",
  emojiClassName = "",
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
}: TypewriterProps) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  // Blinking cursor effect
  useEffect(() => {
    const timeout2 = setInterval(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearInterval(timeout2);
  }, []);

  useEffect(() => {
    // Current target phrase logic
    const currentPhraseObj = phrases[index];
    // Combine text + emoji for the full sequence to type
    // Use Array.from to correctly handle surrogate pairs (emojis) as single items
    const fullTextChars = Array.from(currentPhraseObj.text + (currentPhraseObj.emoji || ""));
    
    const timeout = setTimeout(() => {
      if (!isDeleting && subIndex < fullTextChars.length) {
        // Typing: advance character
        setSubIndex(subIndex + 1);
      } else if (isDeleting && subIndex > 0) {
        // Deleting: remove character
        setSubIndex(subIndex - 1);
      } else if (!isDeleting && subIndex >= fullTextChars.length) {
        // Finished typing, pause then delete
        setTimeout(() => setIsDeleting(true), pauseDuration);
      } else if (isDeleting && subIndex <= 0) {
        // Finished deleting, move to next phrase
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % phrases.length);
      }
    }, isDeleting ? deletingSpeed : typingSpeed + Math.random() * 20); // Add slight randomness

    return () => clearTimeout(timeout);
  }, [subIndex, isDeleting, index, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  // Derived state for rendering
  const currentPhraseObj = phrases[index];
  const fullTextChars = Array.from(currentPhraseObj.text + (currentPhraseObj.emoji || ""));
  const displayedChars = fullTextChars.slice(0, subIndex);
  const displayedText = displayedChars.join("");

  // Split displayed text back into "gradient text" vs "emoji" parts
  // We know the "text" part length in chars
  const textCharsCount = Array.from(currentPhraseObj.text).length;
  
  // Safe slicing based on character counts
  const textPart = displayedChars.slice(0, textCharsCount).join("");
  const emojiPart = displayedChars.slice(textCharsCount).join("");

  return (
    <span className="inline whitespace-pre-wrap min-h-[1.5em] align-middle">
      <span className={className}>
        {textPart}
        {"\u200B"} {/* Prevent vertical collapse */}
      </span>
      {emojiPart && (
         <span className={emojiClassName}>{emojiPart}</span>
      )}
      <motion.span
        animate={{ opacity: blink ? 1 : 0 }}
        transition={{ duration: 0.1 }}
        className="ml-1 inline-block h-[1em] w-[3px] bg-neutral-800 align-middle"
      />
    </span>
  );
}
