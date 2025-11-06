
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Subject, UploadedFile, StudyGuide, ChatMessage } from './types';
import { generateStudyGuide, regenerateQuiz } from './services/geminiService';

import Header from './components/Header';
import Welcome from './components/Welcome';
import SubjectSelector from './components/SubjectSelector';
import ContentUploader from './components/ContentUploader';
import QuizOptionsSelector from './components/QuizOptionsSelector';
import StudyGuideDisplay from './components/StudyGuideDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import ApiKeyInstructions from './components/ApiKeyInstructions';

const App: React.FC = () => {
    const [apiKeyExists, setApiKeyExists] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [textContent, setTextContent] = useState<string>('');
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [prioritizeExamQuestions, setPrioritizeExamQuestions] = useState<boolean>(true);
    const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRegeneratingQuiz, setIsRegeneratingQuiz] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // Chat state
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isChatting, setIsChatting] = useState<boolean>(false);

    useEffect(() => {
        setApiKeyExists(!!process.env.API_KEY);
    }, []);

    const isFormValid = selectedSubject && (textContent.length > 0 || uploadedFiles.length > 0);

    const initializeChat = useCallback((subject: Subject, text: string, files: UploadedFile[]) => {
        if (!process.env.API_KEY) return;
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const materialSource = files.length > 0
            ? `the provided ${files.length} file(s)`
            : "the provided text content";
        
        const systemInstruction = `You are an expert AI tutor, Study-GPT. I have provided you with study material about ${subject}. Your task is to answer my follow-up questions about this material. Your answers must be based on the provided content. Keep your answers concise, helpful, and in Korean.`;

        const history: any[] = [];
        const parts: any[] = [{ text: `Here is the study material about ${subject}:` }];

        if (files.length > 0) {
            files.forEach(file => {
                parts.push({
                    inlineData: {
                        mimeType: file.mimeType,
                        data: file.data,
                    },
                });
            });
        } else {
            parts.push({ text: text });
        }

        history.push({
            role: 'user',
            parts: parts,
        });

        history.push({
            role: 'model',
            parts: [{ text: "Okay, I have reviewed the material. How can I help you?" }],
        });

        const newChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        setChatSession(newChat);
    }, []);

    const handleReset = () => {
        setSelectedSubject(null);
        setTextContent('');
        setUploadedFiles([]);
        setPrioritizeExamQuestions(true);
        setStudyGuide(null);
        setIsLoading(false);
        setIsRegeneratingQuiz(false);
        setError(null);
        setChatMessages([]);
        setIsChatting(false);
        setChatSession(null);
    };

    const handleGenerateStudyGuide = async () => {
        if (!isFormValid) {
            setError("Please select a subject and provide some study material.");
            return;
        }
        setError(null);
        setIsLoading(true);
        setStudyGuide(null);
        setChatMessages([]);
        setChatSession(null);

        try {
            const guide = await generateStudyGuide(
                selectedSubject!,
                { text: textContent, files: uploadedFiles },
                prioritizeExamQuestions
            );
            setStudyGuide(guide);
            initializeChat(selectedSubject!, textContent, uploadedFiles);
        } catch (err: any) {
            console.error("Error generating study guide:", err);
            setError(err.message || "An unknown error occurred while generating the study guide.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRegenerateQuiz = async () => {
        if (!selectedSubject || !studyGuide) return;
        
        setIsRegeneratingQuiz(true);
        setError(null);
        
        try {
            const newQuiz = await regenerateQuiz(
                selectedSubject,
                { text: textContent, files: uploadedFiles },
                prioritizeExamQuestions
            );
            setStudyGuide(prevGuide => prevGuide ? { ...prevGuide, ...newQuiz } : null);
        } catch (err: any) {
            console.error("Error regenerating quiz:", err);
            setError(err.message || "An unknown error occurred while regenerating the quiz.");
        } finally {
            setIsRegeneratingQuiz(false);
        }
    };
    
    const handleSendMessage = useCallback(async (message: string) => {
        if (!chatSession) return;

        const newUserMessage: ChatMessage = { role: 'user', content: message };
        setChatMessages(prev => [...prev, newUserMessage]);
        setIsChatting(true);
        setError(null);
        
        try {
            const result = await chatSession.sendMessage({ message });
            const responseContent = result.text;

            const newModelMessage: ChatMessage = { role: 'model', content: responseContent };
            setChatMessages(prev => [...prev, newModelMessage]);
        } catch (err: any) {
             console.error("Error in chat:", err);
             const errorMessage: ChatMessage = { role: 'model', content: `Sorry, I encountered an error: ${err.message}` };
             setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsChatting(false);
        }

    }, [chatSession]);


    const renderContent = () => {
        if (!apiKeyExists) {
            return <ApiKeyInstructions />;
        }
        if (isLoading) {
            return <LoadingSpinner />;
        }
       
        if (studyGuide) {
            return (
                <>
                    {error && <ErrorMessage message={error} />}
                    <StudyGuideDisplay 
                        guide={studyGuide} 
                        subject={selectedSubject!}
                        onRegenerateQuiz={handleRegenerateQuiz}
                        isRegeneratingQuiz={isRegeneratingQuiz}
                        chatMessages={chatMessages}
                        onSendMessage={handleSendMessage}
                        isChatting={isChatting}
                    />
                </>
            );
        }
        return (
            <div className="max-w-4xl mx-auto animate-fade-in">
                <Welcome />
                {error && <div className="mb-4"><ErrorMessage message={error} /></div>}
                <SubjectSelector selectedSubject={selectedSubject} onSelectSubject={setSelectedSubject} />
                <ContentUploader 
                    onTextContentChange={setTextContent} 
                    onFilesChange={setUploadedFiles}
                    textContent={textContent}
                    uploadedFiles={uploadedFiles}
                />
                <QuizOptionsSelector prioritize={prioritizeExamQuestions} onPrioritizeChange={setPrioritizeExamQuestions} />
                <div className="mt-8 text-center">
                    <button
                        onClick={handleGenerateStudyGuide}
                        disabled={!isFormValid || isLoading}
                        className="w-full md:w-auto px-12 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        Generate Study Guide
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <Header onReset={handleReset} showReset={!!studyGuide} />
            <main className="container mx-auto p-4 md:p-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
