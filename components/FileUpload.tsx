import React, { useState, useCallback } from 'react';
import { UploadIcon } from './Icons';
import Spinner from './Spinner';

interface FileUploadProps {
  isProcessing: boolean;
  onFileSubmit: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ isProcessing, onFileSubmit }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (selectedFile: File | undefined) => {
    if (selectedFile) {
      if (!selectedFile.type.startsWith('audio/')) {
        setError('Invalid file type. Please upload an audio file.');
        setFile(null);
      } else {
        setError(null);
        setFile(selectedFile);
      }
    }
  };

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  }, []);

  const handleSubmit = () => {
    if (file && !isProcessing) {
      onFileSubmit(file);
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-slate-800 rounded-xl border border-slate-700 animate-fade-in-fast">
      <div className="text-center">
        <h2 className="text-lg font-medium text-slate-300">
          {isProcessing ? "Analyzing Audio..." : "Upload an Audio File"}
        </h2>
        <p className="text-sm text-slate-400">
          {isProcessing ? "Please wait a moment." : "Supports MP3, WAV, OGG, and more."}
        </p>
      </div>

      {isProcessing ? (
        <div className="h-44 w-full flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
            className={`w-full p-8 border-2 border-dashed rounded-lg text-center transition-colors duration-200 ${
              isDragging ? 'border-cyan-500 bg-slate-700/50' : 'border-slate-600 hover:border-slate-500'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="audio/*"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center text-slate-400">
              <UploadIcon className="w-10 h-10 mb-2" />
              <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
            </label>
          </div>

          {file && !error && (
            <div className="w-full text-center text-sm text-slate-300 mt-2">
              <p>Selected file: <strong>{file.name}</strong> ({formatFileSize(file.size)})</p>
            </div>
          )}

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          
          <button
            onClick={handleSubmit}
            disabled={!file || isProcessing}
            className="w-full px-4 py-3 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800 transition-colors"
          >
            Analyze Audio
          </button>
        </>
      )}
    </div>
  );
};

export default FileUpload;
