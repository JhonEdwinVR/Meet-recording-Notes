import React, { useState, useRef, useEffect } from 'react';
import { MeetingNotes, Task } from '../types';
import { Language } from '../constants';
import { getTranslator } from '../utils/translations';
import TranscriptModal from './TranscriptModal';
import { generatePdf } from '../services/pdfService';
import { DownloadIcon, EyeIcon, ReplayIcon, AudioIcon, EditIcon } from './Icons';

interface ResultsDisplayProps {
  notes: MeetingNotes;
  language: Language;
  onReset: () => void;
  audioBlob: Blob | null;
  onTitleChange: (newTitle: string) => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ notes, language, onReset, audioBlob, onTitleChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const t = getTranslator(language);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleDownloadPdf = () => {
    generatePdf(notes, language);
  };
  
  const handleDownloadRecording = () => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    const filename = `${notes.title.replace(/[:\s]/g, '_')}.mp3`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const groupedTasks = notes.tasks.reduce((acc, task) => {
    (acc[task.team] = acc[task.team] || []).push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg w-full max-w-3xl animate-fade-in-slow">
      <header className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-1">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={notes.title}
              onChange={(e) => onTitleChange(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingTitle(false);
                }
              }}
              className="text-2xl font-bold text-slate-100 bg-transparent border-b-2 border-cyan-500 focus:outline-none w-full"
            />
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-100" onClick={() => setIsEditingTitle(true)}>{notes.title}</h1>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors flex-shrink-0"
                aria-label="Edit title"
              >
                <EditIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
        <p className="text-slate-400">{notes.date}</p>
      </header>
      
      <div className="p-6 space-y-8">
        {/* Key Summary */}
        <section>
          <h2 className="text-xl font-semibold text-cyan-400 mb-3">{t('Key Summary')}</h2>
          <ul className="list-disc list-inside space-y-2 text-slate-300">
            {notes.summary.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Action Items */}
        <section>
          <h2 className="text-xl font-semibold text-cyan-400 mb-4">{t('Action Items')}</h2>
          <div className="space-y-4">
            {Object.entries(groupedTasks).map(([team, tasks]) => (
              <div key={team}>
                <h3 className="font-bold text-slate-200 mb-2">{team}</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-300 pl-4">
                  {tasks.map((task, index) => (
                    <li key={index}>{task.action}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-between items-center rounded-b-xl">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-800 transition-colors"
        >
          <EyeIcon className="w-4 h-4" />
          {t('View Transcript')}
        </button>
        <div className="flex items-center gap-3">
            {audioBlob && (
                 <button
                   onClick={handleDownloadRecording}
                   className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-800 transition-colors"
                 >
                   <AudioIcon className="w-4 h-4" />
                   {t('Download Recording')}
                 </button>
            )}
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-800 transition-colors"
            >
              <DownloadIcon className="w-4 h-4" />
              {t('Download PDF')}
            </button>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800 transition-colors"
            >
              <ReplayIcon className="w-4 h-4" />
              {t('Record Another')}
            </button>
        </div>
      </footer>

      <TranscriptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transcript={notes.transcript}
        language={language}
      />
    </div>
  );
};

export default ResultsDisplay;