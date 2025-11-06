
import React from 'react';
import { MultipleChoiceQuestion, ShortAnswerQuestion, ChatMessage } from '../types';
import Question from './Question';
import Chatbot from './Chatbot';

interface QuizSectionProps {
  mcqs: MultipleChoiceQuestion[];
  saqs: ShortAnswerQuestion[];
  onRegenerateQuiz: () => void;
  isRegeneratingQuiz: boolean;
  chatMessages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isChatting: boolean;
  onExpandChat: () => void;
}

const QuizSection: React.FC<QuizSectionProps> = ({ mcqs, saqs, onRegenerateQuiz, isRegeneratingQuiz, chatMessages, onSendMessage, isChatting, onExpandChat }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-slate-800">Practice Quiz</h3>
        <button
          onClick={onRegenerateQuiz}
          disabled={isRegeneratingQuiz}
          className="flex items-center px-4 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-wait"
        >
          {isRegeneratingQuiz ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M5.291 9.29A7.962 7.962 0 0112 4c4.418 0 8 3.582 8 8s-3.582 8-8 8a7.962 7.962 0 01-6.709-3.29" />
            </svg>
          )}
          {isRegeneratingQuiz ? 'Generating...' : 'Regenerate Questions'}
        </button>
      </div>

      <Chatbot 
        messages={chatMessages}
        onSendMessage={onSendMessage}
        isLoading={isChatting}
        onExpandChat={onExpandChat}
      />
      
      <h4 className="text-xl font-semibold text-slate-700 mt-8 mb-4 border-b pb-2">Multiple Choice Questions</h4>
      <div className="space-y-6">
        {mcqs.map((mcq, index) => (
          <Question key={`${index}-${mcq.question}`} questionData={mcq} index={index} type="MCQ" />
        ))}
      </div>

      <h4 className="text-xl font-semibold text-slate-700 mt-10 mb-4 border-b pb-2">Short Answer Questions</h4>
      <div className="space-y-6">
        {saqs.map((saq, index) => (
          <Question key={`${mcqs.length + index}-${saq.question}`} questionData={saq} index={mcqs.length + index} type="SAQ" />
        ))}
      </div>
    </div>
  );
};

export default QuizSection;