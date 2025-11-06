
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatbotProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    isExpanded?: boolean;
    onExpandChat?: () => void;
    onCloseExpanded?: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ messages, onSendMessage, isLoading, isExpanded = false, onExpandChat, onCloseExpanded }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    }

    const containerClasses = isExpanded
        ? "h-full flex flex-col"
        : "bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8";

    return (
        <div className={containerClasses}>
            <div className="flex justify-between items-center mb-2">
                 <div>
                    <h4 className="text-lg font-semibold text-slate-700">질문이 있으신가요?</h4>
                    {!isExpanded && <p className="text-sm text-slate-500 mt-1">학습 자료에 대해 더 궁금하거나 보충 설명이 필요한 부분을 AI 튜터에게 질문해보세요.</p>}
                 </div>
                 {isExpanded && onCloseExpanded && (
                     <button
                        onClick={onCloseExpanded}
                        className="p-2 text-slate-500 hover:text-slate-800 text-2xl font-bold"
                        aria-label="Close chat"
                        title="Close chat"
                    >
                        &times;
                    </button>
                 )}
                 {!isExpanded && onExpandChat && (
                     <button
                        onClick={onExpandChat}
                        className="p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-full hover:bg-slate-200"
                        aria-label="Expand chat"
                        title="Expand Chat View"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
                        </svg>
                    </button>
                 )}
            </div>
            
            <div className={`overflow-y-auto bg-white p-3 rounded border border-slate-200 space-y-3 ${isExpanded ? 'flex-grow mb-4' : 'h-48'}`}>
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-3 py-2 rounded-lg whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                           {msg.content}
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-200 text-slate-800 px-3 py-2 rounded-lg inline-flex items-center">
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse mr-1.5"></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse mr-1.5" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="추가 질문을 입력하세요..."
                    className="flex-grow p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-500"
                    disabled={isLoading}
                />
                <button 
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                    전송
                </button>
            </form>
        </div>
    );
};

export default Chatbot;
