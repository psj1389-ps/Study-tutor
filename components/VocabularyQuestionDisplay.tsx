import React, { useState } from 'react';
import { VocabularyQuestion } from '../types';

interface VocabQuestionProps {
  questionData: VocabularyQuestion;
  index: number;
}

const VocabularyQuestionDisplay: React.FC<VocabQuestionProps> = ({ questionData, index }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
  };

  const getOptionClasses = (option: string) => {
    if (!isAnswered) {
      return 'bg-slate-100 hover:bg-blue-100 border-slate-200';
    }
    if (option === questionData.answer) {
      return 'bg-green-100 border-green-300 text-green-800 font-semibold';
    }
    if (option === selectedOption && option !== questionData.answer) {
      return 'bg-red-100 border-red-300 text-red-800';
    }
    return 'bg-slate-100 border-slate-200 text-slate-500';
  };

  return (
    <div className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
      <p className="font-bold text-slate-800 text-lg">Q{index + 1}. {questionData.word}</p>
      <p className="text-sm text-slate-500 mb-4">다음 중 위 단어의 올바른 뜻을 고르세요.</p>
      <div className="mt-4 space-y-2">
        {questionData.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleOptionSelect(option)}
            disabled={isAnswered}
            className={`w-full text-left p-3 rounded-md border transition-colors ${getOptionClasses(option)}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VocabularyQuestionDisplay;
