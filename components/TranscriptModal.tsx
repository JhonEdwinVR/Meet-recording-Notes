
import React, { Fragment } from 'react';
import { Language } from '../constants';
import { getTranslator } from '../utils/translations';

interface TranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transcript: string;
  language: Language;
}

const TranscriptModal: React.FC<TranscriptModalProps> = ({ isOpen, onClose, transcript, language }) => {
  if (!isOpen) return null;
  const t = getTranslator(language);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fade-in-fast"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100">{t('Full Transcript')}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <p className="whitespace-pre-wrap text-slate-300 leading-relaxed">
            {transcript}
          </p>
        </div>
        <div className="p-4 border-t border-slate-700 text-right">
           <button
             onClick={onClose}
             className="px-4 py-2 bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-800 transition-colors"
           >
             {t('Close')}
           </button>
        </div>
      </div>
    </div>
  );
};

export default TranscriptModal;
