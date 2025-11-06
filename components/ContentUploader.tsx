import React, { useCallback, useEffect } from 'react';
import { UploadedFile } from '../types';

interface ContentUploaderProps {
  onTextContentChange: (content: string) => void;
  onFilesChange: (files: UploadedFile[]) => void;
  uploadedFiles: UploadedFile[];
  textContent: string;
}

const readAsDataURL = (file: File): Promise<UploadedFile> => {
    return new Promise((resolve, reject) => {
        const supportedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!supportedTypes.includes(file.type)) {
            alert(`Unsupported file type: ${file.name}. Please upload PDF or image files.`);
            return reject(new Error("Unsupported file type"));
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const base64Data = dataUrl.split(',')[1];
            resolve({ name: file.name, mimeType: file.type, data: base64Data });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

const ContentUploader: React.FC<ContentUploaderProps> = ({ onTextContentChange, onFilesChange, uploadedFiles, textContent }) => {

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            const extension = file.type.split('/')[1] || 'png';
            const namedFile = new File([file], `pasted-image-${Date.now()}.${extension}`, { type: file.type });
            imageFiles.push(namedFile);
          }
        }
      }

      if (imageFiles.length > 0) {
        event.preventDefault();
        onTextContentChange('');

        try {
          const newFiles = await Promise.all(imageFiles.map(readAsDataURL));
          onFilesChange([...uploadedFiles, ...newFiles]);
        } catch (error) {
          console.error("Error reading pasted files:", error);
        }
      }
    };

    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [onTextContentChange, onFilesChange, uploadedFiles]);


  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    onTextContentChange(''); // Clear text when files are selected

    const newFilesPromises = Array.from(files).map(readAsDataURL);
    
    try {
        const newFiles = await Promise.all(newFilesPromises);
        onFilesChange([...uploadedFiles, ...newFiles]);
    } catch (error) {
        console.error("Error reading files:", error);
    }

    event.target.value = ''; // Allow re-uploading the same file(s)
  }, [onTextContentChange, onFilesChange, uploadedFiles]);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onFilesChange([]); // Clear files when text is entered
    onTextContentChange(event.target.value);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    onFilesChange(uploadedFiles.filter((_, index) => index !== indexToRemove));
  }

  const isTextInputActive = textContent.length > 0;
  const isFileUploadActive = uploadedFiles.length > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold mb-4 text-slate-700">2. Upload or Paste Your Material</h3>
        <div className="flex flex-col space-y-4">
            {!isTextInputActive && (
              <div>
                  <label htmlFor="file-upload" className={`cursor-pointer bg-white border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors ${isFileUploadActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'}`}>
                      <svg className="w-12 h-12 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      <span className="text-blue-600 font-semibold">Click to upload file(s)</span>
                      <span className="text-slate-500 text-sm">(PDF, JPG, PNG)</span>
                  </label>
                  <input id="file-upload" type="file" className="hidden" multiple onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.webp" disabled={isTextInputActive}/>
              </div>
            )}

            {isFileUploadActive && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-slate-600">Uploaded Files:</h4>
                    {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-100 p-2 rounded-md">
                            <span className="text-slate-800 text-sm truncate pr-2">{file.name}</span>
                            <button onClick={() => handleRemoveFile(index)} className="text-red-600 hover:text-red-800 font-bold text-lg">&times;</button>
                        </div>
                    ))}
                </div>
            )}

            {!isFileUploadActive && !isTextInputActive && (
                <div className="flex items-center text-slate-400">
                    <hr className="flex-grow border-t" />
                    <span className="px-2 text-sm">OR</span>
                    <hr className="flex-grow border-t" />
                </div>
            )}

            {!isFileUploadActive && (
                <textarea
                    onChange={handleTextChange}
                    value={textContent}
                    rows={10}
                    placeholder="Paste your text content here... or paste an image anywhere on the page!"
                    className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow disabled:bg-slate-100 disabled:cursor-not-allowed"
                    disabled={isFileUploadActive}
                />
            )}
        </div>
    </div>
  );
};

export default ContentUploader;