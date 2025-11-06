
import React, { useState, useEffect } from 'react';

const messages = [
  "Analyzing your materials...",
  "Identifying key concepts...",
  "Crafting your personalized study plan...",
  "Generating practice questions...",
  "Finalizing your guide, almost there!",
];

const LoadingSpinner: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 border-4 border-t-blue-500 border-slate-200 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-slate-700 transition-opacity duration-500">
        {messages[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingSpinner;
