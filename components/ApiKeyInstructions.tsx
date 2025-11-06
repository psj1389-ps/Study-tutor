import React from 'react';

const ApiKeyInstructions: React.FC = () => {
  return (
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
            To activate your AI tutor, please set up your Google Gemini API key.
          </p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Click the <strong>🔑 Secrets</strong> tab in the left sidebar (or <strong>Settings &gt; Environment Variables</strong> on Vercel).</li>
            <li>Create a new secret with the name <code className="bg-amber-200 px-1 rounded">API_KEY</code>.</li>
            <li>Paste your API key into the value field and save.</li>
          </ol>
           <p className="text-sm mt-3">
            <strong>Security reminder:</strong> Never share your API keys publicly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInstructions;