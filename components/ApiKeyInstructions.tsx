
import React from 'react';

const ApiKeyInstructions: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
        <p className="font-bold">Configuration Error</p>
        <p>
          The Gemini API key is not configured. Please set the <code>API_KEY</code> environment variable in your project settings to use this application.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyInstructions;
