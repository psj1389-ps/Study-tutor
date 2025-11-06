import React, { useState } from 'react';
import { StudyGuide, Subject, ChatMessage } from '../types';
import SummarySection from './SummarySection';
import PlanSection from './PlanSection';
import QuizSection from './QuizSection';
import VocabularyQuizSection from './VocabularyQuizSection';
import Chatbot from './Chatbot';

interface StudyGuideDisplayProps {
  guide: StudyGuide;
  subject: Subject;
  onRegenerateQuiz: () => void;
  isRegeneratingQuiz: boolean;
  onRegenerateVocab: () => void;
  isRegeneratingVocab: boolean;
  chatMessages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isChatting: boolean;
}

type ActiveTab = 'summary' | 'plan' | 'quiz' | 'vocabulary';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm md:text-base font-semibold rounded-t-lg transition-colors focus:outline-none ${
            active ? 'bg-white border-slate-200 border-t border-l border-r text-blue-600' : 'bg-transparent text-slate-500 hover:text-slate-700'
        }`}
    >
        {children}
    </button>
);


const StudyGuideDisplay: React.FC<StudyGuideDisplayProps> = ({ guide, subject, onRegenerateQuiz, isRegeneratingQuiz, onRegenerateVocab, isRegeneratingVocab, chatMessages, onSendMessage, isChatting }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('summary');

    return (
        <>
            <div className="max-w-4xl mx-auto animate-fade-in relative">
                <div className="text-center mb-8">
                     <h2 className="text-3xl font-bold text-slate-800">Your Personalized <span className="text-blue-600">{subject}</span> Study Guide</h2>
                     <p className="text-slate-500 mt-2">Here's your AI-generated plan to conquer the material!</p>
                </div>

                <Chatbot
                    messages={chatMessages}
                    onSendMessage={onSendMessage}
                    isLoading={isChatting}
                />

                 <div className="border-b border-slate-200 flex space-x-1 md:space-x-2">
                    <TabButton active={activeTab === 'summary'} onClick={() => setActiveTab('summary')}>📝 Core Summary</TabButton>
                    <TabButton active={activeTab === 'plan'} onClick={() => setActiveTab('plan')}>🗓️ 10-Day Plan</TabButton>
                    <TabButton active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')}>🎯 Practice Quiz</TabButton>
                    <TabButton active={activeTab === 'vocabulary'} onClick={() => setActiveTab('vocabulary')}>🔤 Vocabulary Quiz</TabButton>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-b-lg rounded-tr-lg shadow-md border border-slate-200 min-h-[400px]">
                    {activeTab === 'summary' && <SummarySection summary={guide.summary} />}
                    {activeTab === 'plan' && <PlanSection plan={guide.studyPlan} />}
                    {activeTab === 'quiz' && 
                        <QuizSection 
                            mcqs={guide.multipleChoiceQuestions} 
                            saqs={guide.shortAnswerQuestions}
                            onRegenerateQuiz={onRegenerateQuiz}
                            isRegeneratingQuiz={isRegeneratingQuiz}
                        />
                    }
                    {activeTab === 'vocabulary' &&
                        <VocabularyQuizSection
                            questions={guide.vocabularyQuestions}
                            onRegenerate={onRegenerateVocab}
                            isRegenerating={isRegeneratingVocab}
                        />
                    }
                </div>
            </div>
        </>
    );
};

export default StudyGuideDisplay;