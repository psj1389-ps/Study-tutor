import React, { useState } from 'react';
import { MultipleChoiceQuestion, ShortAnswerQuestion } from '../types';

type QuestionProps = {
  questionData: MultipleChoiceQuestion | ShortAnswerQuestion;
  index: number;
  type: 'MCQ' | 'SAQ';
};

const ExplanationStep: React.FC<{ title: string; content: string; icon: string }> = ({ title, content, icon }) => (
    <div className="mt-4">
        <h5 className="font-semibold text-md text-slate-700 flex items-center"><span className="mr-2 text-xl">{icon}</span> {title}</h5>
        <p className="text-slate-600 mt-1 pl-8 text-sm whitespace-pre-wrap">{content}</p>
    </div>
);


const Question: React.FC<QuestionProps> = ({ questionData, index, type }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const isMcq = (data: any): data is MultipleChoiceQuestion => type === 'MCQ';
  
  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setShowExplanation(true);
  };

  const getOptionClasses = (option: string) => {
    if (!showExplanation) {
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

  const { examProbability } = questionData;
  const probabilityStyles = {
    High: { text: '높음', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200' },
    Medium: { text: '중간', color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200' },
    Low: { text: '낮음', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200' },
  };
  const styles = probabilityStyles[examProbability];


  return (
    <div className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
        <div className="flex justify-between items-start gap-4">
             <div className="flex-1">
                {questionData.context && (
                    <blockquote className="mb-4 p-3 bg-slate-50 border-l-4 border-slate-300 text-slate-700 text-sm whitespace-pre-wrap">
                        {questionData.context}
                    </blockquote>
                )}
                <p className="font-semibold text-slate-800">Q{index + 1}. {questionData.question}</p>
            </div>

            {styles && (
                <span className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full border ${styles.bg} ${styles.color} ${styles.border}`}>
                    출제 확률: {styles.text}
                </span>
            )}
        </div>
      
      {isMcq(questionData) && (
        <div className="mt-4 space-y-2">
          {questionData.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleOptionSelect(option)}
              disabled={showExplanation}
              className={`w-full text-left p-3 rounded-md border transition-colors ${getOptionClasses(option)}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {!isMcq(questionData) && !showExplanation && (
        <button 
          onClick={() => setShowExplanation(true)}
          className="mt-4 px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Show Answer & Explanation
        </button>
      )}

      {showExplanation && (
        <div className="mt-4 p-4 bg-slate-50 rounded-md border border-slate-200">
            <h4 className="text-lg font-bold text-blue-700">Chain of Thought Explanation</h4>
            <p className="text-sm font-bold mt-4">
                Correct Answer: <span className="text-green-600">{questionData.answer}</span>
            </p>
            <ExplanationStep title="1단계: 문제 분석 및 핵심 파악" content={questionData.chainOfThoughtExplanation.step1} icon="🤔" />
            <ExplanationStep title="2단계: 단계별 풀이 과정 제시" content={questionData.chainOfThoughtExplanation.step2} icon="✍️" />
            <ExplanationStep title="3단계: 최종 정리 및 응용" content={questionData.chainOfThoughtExplanation.step3} icon="💡" />
        </div>
      )}
    </div>
  );
};

export default Question;