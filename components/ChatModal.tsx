
import React, { useEffect } from 'react';
import { ChatMessage } from '../types';
import Chatbot from './Chatbot';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isChatting: boolean;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, messages, onSendMessage, isChatting }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-slate-50 rounded-lg shadow-xl w-full max-w-3xl h-[80vh] flex flex-col p-4"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <Chatbot
                    messages={messages}
                    onSendMessage={onSendMessage}
                    isLoading={isChatting}
                    isExpanded={true}
                    onCloseExpanded={onClose}
                />
            </div>
        </div>
    );
};

export default ChatModal;
