
import React from 'react';

interface HeaderProps {
    onReset: () => void;
    showReset: boolean;
}

const Header: React.FC<HeaderProps> = ({ onReset, showReset }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
            <div className="text-2xl p-2 rounded-lg bg-blue-600 text-white font-bold">🧠</div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                Study-GPT
            </h1>
        </div>
        {showReset && (
             <button 
                onClick={onReset}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
                New Session
            </button>
        )}
      </div>
    </header>
  );
};

export default Header;
