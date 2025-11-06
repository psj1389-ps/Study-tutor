import React from 'react';

const Welcome: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8 text-center">
            <h2 className="text-2xl font-bold text-blue-600 mb-2">Welcome to your Personal AI Tutor!</h2>
            <p className="text-slate-600">
                Ready to turn your 2-3 grade into a solid 1? Just follow these simple steps:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full">1</span>
                    <span className="font-semibold">Select subject</span>
                </div>
                 <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full">2</span>
                    <span className="font-semibold">Upload material</span>
                </div>
                 <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full">3</span>
                    <span className="font-semibold">Set quiz options</span>
                </div>
                 <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full">4</span>
                    <span className="font-semibold">Generate guide!</span>
                </div>
            </div>
        </div>
    );
};

export default Welcome;