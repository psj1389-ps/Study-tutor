import React, { useState, useCallback } from 'react';
import { Chat } from '@google/genai';
import { Subject, StudyGuide, UploadedFile, ChatMessage } from './types';
import { generateStudyGuide, regenerateQuiz, getAiClient } from './services/geminiService';
import Header from './components/Header';
import SubjectSelector from './components/SubjectSelector';
import ContentUploader from './components/ContentUploader';
import StudyGuideDisplay from './components/StudyGuideDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import Welcome from './components/Welcome';
import QuizOptionsSelector from './components/QuizOptionsSelector';

function App() {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [textContent, setTextContent] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [prioritizeExamQuestions, setPrioritizeExamQuestions] = useState<boolean>(true);
  const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegeneratingQuiz, setIsRegeneratingQuiz] = useState<boolean>(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState<boolean>(false);

  const handleGenerate = useCallback(async () => {
    if (!subject) {
      setError('Please select a subject first.');
      return;
    }
    if (!textContent && uploadedFiles.length === 0) {
        setError('Please provide some content to analyze, either by pasting text or uploading file(s).');
        return;
    }
    setIsLoading(true);
    setError(null);
    setStudyGuide(null);

    try {
      const result = await generateStudyGuide(subject, { text: textContent, files: uploadedFiles }, prioritizeExamQuestions);
      setStudyGuide(result);
      
      const systemInstruction = `You are an expert AI tutor named Study-GPT. The user has provided you with study material for a ${subject} class. Your role is to answer their follow-up questions about this material, the summary, the study plan, or the practice questions you've already generated. Be helpful, clear, and encouraging. Your answers should be in a conversational, chatbot style.`;
      
      const ai = getAiClient();
      const newChat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction }
      });
      setChat(newChat);
      setChatMessages([{ role: 'model', content: "I've reviewed the material. Ask me any follow-up questions about the quiz or the content!" }]);

    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
         setError(`Failed to generate study guide: ${e.message}`);
      } else {
        setError('An unknown error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [subject, textContent, uploadedFiles, prioritizeExamQuestions]);

  const handleRegenerateQuiz = useCallback(async () => {
    if (!subject) return;

    setIsRegeneratingQuiz(true);
    setError(null);
    try {
      const newQuiz = await regenerateQuiz(subject, { text: textContent, files: uploadedFiles }, prioritizeExamQuestions);
      setStudyGuide(prev => {
        if (!prev) return null;
        return {
          ...prev,
          multipleChoiceQuestions: newQuiz.multipleChoiceQuestions,
          shortAnswerQuestions: newQuiz.shortAnswerQuestions,
        }
      });
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
          setError(`Failed to regenerate quiz: ${e.message}`);
      } else {
        setError('An unknown error occurred while regenerating the quiz.');
      }
    } finally {
      setIsRegeneratingQuiz(false);
    }
  }, [subject, textContent, uploadedFiles, prioritizeExamQuestions]);

  const handleSendChatMessage = useCallback(async (message: string) => {
    if (!chat) return;

    setIsChatting(true);
    const updatedMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: message }];
    setChatMessages(updatedMessages);

    try {
      const response = await chat.sendMessage({ message });
      const modelResponse = response.text;
      setChatMessages([...updatedMessages, { role: 'model', content: modelResponse }]);
    } catch(e) {
      console.error(e);
      setChatMessages([...updatedMessages, { role: 'model', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsChatting(false);
    }
  }, [chat, chatMessages]);

  const handleReset = () => {
    setSubject(null);
    setTextContent('');
    setUploadedFiles([]);
    setStudyGuide(null);
    setError(null);
    setIsLoading(false);
    setPrioritizeExamQuestions(true);
    setChat(null);
    setChatMessages([]);
  };

  const showGeneratorButton = subject && (textContent || uploadedFiles.length > 0) && !isLoading && !studyGuide;

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Header onReset={handleReset} showReset={!!studyGuide || !!subject} />
      <main className="container mx-auto p-4 md:p-8">
        {!studyGuide && !isLoading ? (
          <div className="max-w-4xl mx-auto">
             <Welcome />
            <SubjectSelector selectedSubject={subject} onSelectSubject={setSubject} />
            {subject && (
              <>
                <ContentUploader
                  onTextContentChange={setTextContent}
                  onFilesChange={setUploadedFiles}
                  uploadedFiles={uploadedFiles}
                  textContent={textContent}
                />
                <QuizOptionsSelector
                  prioritize={prioritizeExamQuestions}
                  onPrioritizeChange={setPrioritizeExamQuestions}
                />
              </>
            )}
          </div>
        ) : null}
        
        {isLoading && <LoadingSpinner />}
        {error && !isLoading && <ErrorMessage message={error} />}
        {studyGuide && !isLoading && 
            <StudyGuideDisplay 
                guide={studyGuide} 
                subject={subject!} 
                onRegenerateQuiz={handleRegenerateQuiz}
                isRegeneratingQuiz={isRegeneratingQuiz}
                chatMessages={chatMessages}
                onSendMessage={handleSendChatMessage}
                isChatting={isChatting}
            />
        }
      </main>

      {showGeneratorButton && (
         <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-slate-200 p-4 shadow-lg">
            <div className="max-w-4xl mx-auto flex justify-center">
                 <button
                    onClick={handleGenerate}
                    className={`px-8 py-3 text-lg font-bold rounded-full shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 text-white`}
                    disabled={!textContent && uploadedFiles.length === 0}
                >
                    ✨ Generate My Study Guide
                </button>
            </div>
        </div>
      )}

      {studyGuide && (
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-slate-200 p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex justify-center">
            <button
              onClick={handleReset}
              className={`px-8 py-3 text-lg font-bold rounded-full shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 bg-amber-500 hover:bg-amber-600 focus:ring-amber-300 text-white`}
            >
              Start a New Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;