
import React from 'react';
import { MeetingNotes, Task } from '../types';
import { FileDownIcon, FileTextIcon, ListTodoIcon, BookTextIcon, DownloadCloudIcon } from './Icons';
import { Language } from '../constants';
import { getTranslator } from '../utils/translations';

interface ResultsDisplayProps {
  notes: MeetingNotes;
  onViewTranscript: () => void;
  onDownloadPdf: () => void;
  onDownloadAudio: () => void;
  language: Language;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ notes, onViewTranscript, onDownloadPdf, onDownloadAudio, language }) => {
  const t = getTranslator(language);
  const groupedTasks = notes.tasks.reduce((acc, task) => {
    (acc[task.team] = acc[task.team] || []).push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="mt-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-6 border-b border-slate-700">
        <h2 className="text-3xl font-bold text-slate-100 break-words">{notes.title}</h2>
        <p className="text-md text-slate-400 mt-2">{notes.date}</p>
      </div>

      {/* Summary Section */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <BookTextIcon className="w-7 h-7 text-cyan-400" />
          <h3 className="text-2xl font-semibold text-slate-100">{t('Key Summary')}</h3>
        </div>
        <div className="p-5 bg-slate-900/50 rounded-lg border border-slate-700">
          <ul className="space-y-3 list-disc list-inside text-slate-300">
            {notes.summary.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Items Section */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <ListTodoIcon className="w-7 h-7 text-violet-400" />
          <h3 className="text-2xl font-semibold text-slate-100">{t('Action Items')}</h3>
        </div>
        <div className="space-y-4">
          {Object.entries(groupedTasks).map(([team, tasks]) => (
            <div key={team} className="p-5 bg-slate-900/50 rounded-lg border border-slate-700">
              <h4 className="font-bold text-lg text-violet-300 mb-3">{team}</h4>
              <ul className="space-y-2 list-disc list-inside text-slate-300">
                {tasks.map((task, index) => (
                  <li key={index}>{task.action}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-700">
        <button
          onClick={onViewTranscript}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-cyan-900 bg-cyan-400 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800 transition-colors"
        >
          <FileTextIcon className="w-5 h-5 mr-2" />
          {t('View Full Transcript')}
        </button>
        <button
          onClick={onDownloadAudio}
          className="inline-flex items-center justify-center px-6 py-3 border border-slate-600 text-base font-medium rounded-md text-slate-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-800 transition-colors"
        >
          <DownloadCloudIcon className="w-5 h-5 mr-2" />
          {t('Download Audio')}
        </button>
        <button
          onClick={onDownloadPdf}
          className="inline-flex items-center justify-center px-6 py-3 border border-slate-600 text-base font-medium rounded-md text-slate-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-800 transition-colors"
        >
          <FileDownIcon className="w-5 h-5 mr-2" />
          {t('Download as PDF')}
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;