
import React, { useState, useCallback } from 'react';
import { MeetingNotes } from './types';
import { processMeetingAudio } from './services/geminiService';
import { generatePdf } from './services/pdfService';
import RecorderControl from './components/RecorderControl';
import ResultsDisplay from './components/ResultsDisplay';
import TranscriptModal from './components/TranscriptModal';
import { BrainCircuitIcon } from './components/Icons';
import { LANGUAGES, Language } from './constants';

export default function App() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [meetingNotes, setMeetingNotes] = useState<MeetingNotes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [meetingTitle, setMeetingTitle] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('English');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const handleRecordingStop = useCallback(async (newAudioBlob: Blob) => {
    setIsRecording(false);
    setIsProcessing(true);
    setError(null);
    setMeetingNotes(null);
    setAudioBlob(newAudioBlob);

    try {
      const notesFromAI = await processMeetingAudio(newAudioBlob, selectedLanguage);
      const completeNotes: MeetingNotes = {
        ...notesFromAI,
        title: meetingTitle.trim() || 'Meeting Notes',
        date: new Date().toLocaleString(undefined, {
          year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }),
      };
      setMeetingNotes(completeNotes);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Error processing audio: ${err.message}`);
      } else {
        setError('An unknown error occurred during processing.');
      }
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [meetingTitle, selectedLanguage]);

  const handleDownloadPdf = useCallback(() => {
    if (meetingNotes) {
      generatePdf(meetingNotes, selectedLanguage);
    }
  }, [meetingNotes, selectedLanguage]);
  
  const handleDownloadAudio = useCallback(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      const safeTitle = (meetingNotes?.title || 'meeting-recording').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `${safeTitle}.webm`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }, [audioBlob, meetingNotes]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-center space-x-3 mb-8">
          <BrainCircuitIcon className="w-10 h-10 text-cyan-400" />
          <h1 className="text-3xl sm:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">
            Gemini Meeting Notetaker
          </h1>
        </header>

        <main className="bg-slate-800/50 rounded-2xl shadow-2xl shadow-slate-950/50 p-6 backdrop-blur-sm border border-slate-700">
          <div className="mb-6">
            <label htmlFor="meeting-title" className="block text-sm font-medium text-slate-400 mb-2">
              Meeting Title
            </label>
            <input
              type="text"
              id="meeting-title"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="e.g., Q3 Project Kick-off"
              disabled={isRecording || isProcessing}
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition disabled:bg-slate-800 disabled:cursor-not-allowed"
              aria-label="Meeting Title"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="language-select" className="block text-sm font-medium text-slate-400 mb-2">
              Output Language
            </label>
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as Language)}
              disabled={isRecording || isProcessing}
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition disabled:bg-slate-800 disabled:cursor-not-allowed"
              aria-label="Output Language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <RecorderControl
            isRecording={isRecording}
            isProcessing={isProcessing}
            onRecordingStart={() => {
              setIsRecording(true);
              setError(null);
              setMeetingNotes(null);
              setAudioBlob(null);
            }}
            onRecordingStop={handleRecordingStop}
          />

          {error && (
            <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
              <p className="font-semibold">An Error Occurred</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {meetingNotes && !isProcessing && (
            <ResultsDisplay
              notes={meetingNotes}
              onViewTranscript={() => setShowTranscript(true)}
              onDownloadPdf={handleDownloadPdf}
              onDownloadAudio={handleDownloadAudio}
              language={selectedLanguage}
            />
          )}
        </main>
        
        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Powered by Google Gemini. Your meeting, summarized.</p>
        </footer>
      </div>

      {meetingNotes && (
        <TranscriptModal
          isOpen={showTranscript}
          onClose={() => setShowTranscript(false)}
          transcript={meetingNotes.transcript}
          language={selectedLanguage}
        />
      )}
    </div>
  );
}