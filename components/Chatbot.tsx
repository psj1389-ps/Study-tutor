import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '../types';

interface ChatbotProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    isExpanded?: boolean;
    onCloseExpanded?: () => void;
}

const resizeHandles: { direction: string; className: string }[] = [
    { direction: 'n', className: 'cursor-n-resize top-0 left-2 right-2 h-2' },
    { direction: 's', className: 'cursor-s-resize bottom-0 left-2 right-2 h-2' },
    { direction: 'e', className: 'cursor-e-resize top-2 bottom-2 right-0 w-2' },
    { direction: 'w', className: 'cursor-w-resize top-2 bottom-2 left-0 w-2' },
    { direction: 'ne', className: 'cursor-ne-resize top-0 right-0 h-4 w-4' },
    { direction: 'nw', className: 'cursor-nw-resize top-0 left-0 h-4 w-4' },
    { direction: 'se', className: 'cursor-se-resize bottom-0 right-0 h-4 w-4' },
    { direction: 'sw', className: 'cursor-sw-resize bottom-0 left-0 h-4 w-4' },
];


const Chatbot: React.FC<ChatbotProps> = ({ messages, onSendMessage, isLoading, isExpanded, onCloseExpanded }) => {
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [size, setSize] = useState({ width: 500, height: 400 });
    const [isDragging, setIsDragging] = useState(false);
    const [resizingDirection, setResizingDirection] = useState<string | null>(null);

    const dragStartOffset = useRef({ x: 0, y: 0 });
    const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });

    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    const handleDragMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        // Prevent dragging when clicking on form elements or the resize handles
        if (target.closest('input') || target.closest('form button') || target.closest('[class*="-resize"]')) {
            return;
        }
        setIsDragging(true);
        dragStartOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
        e.preventDefault();
    };

    const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>, direction: string) => {
        e.preventDefault();
        e.stopPropagation();
        setResizingDirection(direction);
        resizeStart.current = {
            x: e.clientX,
            y: e.clientY,
            width: size.width,
            height: size.height,
            posX: position.x,
            posY: position.y,
        };
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStartOffset.current.x,
                y: e.clientY - dragStartOffset.current.y,
            });
        }
        if (resizingDirection) {
            const dx = e.clientX - resizeStart.current.x;
            const dy = e.clientY - resizeStart.current.y;

            const nextPos = { ...resizeStart.current };
            const nextSize = { ...size };
            
            const minWidth = 350;
            const minHeight = 300;

            if (resizingDirection.includes('e')) {
                nextSize.width = Math.max(minWidth, resizeStart.current.width + dx);
            }
            if (resizingDirection.includes('s')) {
                nextSize.height = Math.max(minHeight, resizeStart.current.height + dy);
            }
            if (resizingDirection.includes('w')) {
                const potentialWidth = resizeStart.current.width - dx;
                if (potentialWidth >= minWidth) {
                    nextSize.width = potentialWidth;
                    nextPos.posX = resizeStart.current.posX + dx;
                }
            }
            if (resizingDirection.includes('n')) {
                const potentialHeight = resizeStart.current.height - dy;
                if (potentialHeight >= minHeight) {
                    nextSize.height = potentialHeight;
                    nextPos.posY = resizeStart.current.posY + dy;
                }
            }
            
            setSize(nextSize);
            setPosition({ x: nextPos.posX, y: nextPos.posY });
        }
    }, [isDragging, resizingDirection, size]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setResizingDirection(null);
    }, []);

    useEffect(() => {
        if (!isExpanded && (isDragging || resizingDirection)) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = 'none';
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isExpanded, isDragging, resizingDirection, handleMouseMove, handleMouseUp]);

    return (
        <div
            className={isExpanded
                ? "relative w-full h-full flex flex-col"
                : "absolute z-10 bg-white border border-slate-200 rounded-lg p-4 flex flex-col shadow-xl"}
            style={isExpanded ? {} : {
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${size.width}px`,
                height: `${size.height}px`,
            }}
        >
             {!isExpanded && resizeHandles.map(handle => (
                <div
                    key={handle.direction}
                    className={`absolute ${handle.className} z-20`}
                    onMouseDown={(e) => handleResizeMouseDown(e, handle.direction)}
                />
            ))}

            <div onMouseDown={isExpanded ? undefined : handleDragMouseDown} className={`${isExpanded ? '' : 'cursor-move'} flex justify-between items-start mb-2 flex-shrink-0`}>
                <div>
                    <h4 className="text-lg font-semibold text-slate-700">질문이 있으신가요?</h4>
                    <p className="text-sm text-slate-500 mt-1">학습 자료에 대해 더 궁금하거나 보충 설명이 필요한 부분을 AI 튜터에게 질문해보세요.</p>
                </div>
                 {isExpanded && onCloseExpanded && (
                    <button
                        onClick={onCloseExpanded}
                        className="p-1 text-slate-500 hover:text-red-600 transition-colors rounded-full hover:bg-slate-200 -mt-1 -mr-1"
                        aria-label="Close"
                        title="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
            
            <div className="flex-grow overflow-y-auto bg-white p-3 rounded border border-slate-200 space-y-3 mb-4">
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

            <form onSubmit={handleSend} className="flex gap-2 flex-shrink-0">
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
                    className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    전송
                </button>
            </form>
        </div>
    );
};

export default Chatbot;