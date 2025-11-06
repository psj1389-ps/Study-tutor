
import React, { useState, useCallback, useMemo } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Subject, StudyGuide, UploadedFile, ChatMessage } from './types';
import { generateStudyGuide, regenerateQuiz } from './services/geminiService';
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

  // Fix: Use process.env.API_KEY as per the guidelines.
  const apiKey = process.env.API_KEY;

  const ai = useMemo(() => {
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }, [apiKey]);

  const handleGenerate = useCallback(async () => {
    if (!ai) {
      // Fix: Update error message to refer to API_KEY.
      setError("AI client could not be initialized. Please ensure the API_KEY is set correctly in your deployment environment.");
      return;
    }
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
  }, [subject, textContent, uploadedFiles, prioritizeExamQuestions, ai]);

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

  if (!apiKey) {
      return (
        <div className="min-h-screen bg-slate-100 font-sans flex items-center justify-center p-4">
             <div className="max-w-4xl mx-auto bg-amber-50 border-l-4 border-amber-500 text-amber-800 p-6 rounded-r-lg shadow-md" role="alert">
                <div className="flex">
                    <div className="py-1">
                    <svg className="fill-current h-6 w-6 text-amber-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm1-4a1 1 0 110 2 1 1 0 010-2z"/>
                    </svg>
                    </div>
                    <div>
                    <p className="font-bold text-lg">Action Required: Set Your API Key</p>
                    <p className="text-md mt-2">
                        To activate your AI tutor, please set up your Google Gemini API key in your deployment environment.
                    </p>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>In your Vercel project dashboard, go to <strong>Settings &gt; Environment Variables</strong>.</li>
                        {/* Fix: Update environment variable name to API_KEY. */}
                        <li>Create a new variable with the name <code className="bg-amber-200 px-1 rounded">API_KEY</code>.</li>
                        <li>Paste your API key into the value field, save, and redeploy.</li>
                    </ol>
                    <p className="text-sm mt-3">
                        <strong>Security reminder:</strong> Never share your API keys publicly.
                    </p>
                    </div>
                </div>
            </div>
        </div>
      );
  }

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
