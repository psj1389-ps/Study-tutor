import React from 'react';

interface QuizOptionsSelectorProps {
  prioritize: boolean;
  onPrioritizeChange: (prioritize: boolean) => void;
}

const QuizOptionsSelector: React.FC<QuizOptionsSelectorProps> = ({ prioritize, onPrioritizeChange }) => {
  const toggleId = 'prioritize-toggle';
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mt-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-700">3. Set Quiz Options</h3>
      <div className="flex items-center justify-between">
        <label htmlFor={toggleId} className="flex-grow pr-4 cursor-pointer">
          <span className="font-medium text-slate-800 block">Prioritize High-Probability Exam Questions</span>
          <span className="text-sm text-slate-500 font-normal">AI will focus on creating questions most likely to appear on your tests.</span>
        </label>
        <div className="flex-shrink-0">
            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                <input
                    type="checkbox"
                    name={toggleId}
                    id={toggleId}
                    checked={prioritize}
                    onChange={(e) => onPrioritizeChange(e.target.checked)}
                    className="toggle-checkbox absolute block w-7 h-7 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label htmlFor={toggleId} className="toggle-label block overflow-hidden h-7 rounded-full bg-slate-300 cursor-pointer"></label>
            </div>
        </div>
      </div>
       <style>{`
        .toggle-checkbox {
            left: -0.25rem;
            transition: left 0.2s ease-in-out;
        }
        .toggle-checkbox:checked {
          left: 1.25rem;
          border-color: #3b82f6; /* blue-500 */
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #3b82f6; /* blue-500 */
        }
      `}</style>
    </div>
  );
};

export default QuizOptionsSelector;
