import React, { useState } from 'react';
import RecorderControl from './components/RecorderControl';
import ResultsDisplay from './components/ResultsDisplay';
import FileUpload from './components/FileUpload';
import { MeetingNotes } from './types';
import { processMeetingAudio } from './services/geminiService';
import { convertToMp3 } from './utils/audioConverter';
import { LANGUAGES, Language } from './constants';
import { getTranslator } from './utils/translations';
import { MicIcon, UploadIcon } from './components/Icons';

type Mode = 'record' | 'upload';

const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState<MeetingNotes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('English');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mode, setMode] = useState<Mode>('record');

  const t = getTranslator(language);

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    setError(null);
    setAudioBlob(blob); // Save the audio blob

    try {
      const notesData = await processMeetingAudio(blob, language);
      
      const now = new Date();
      setMeetingNotes({
        ...notesData,
        title: `Meeting Notes: ${now.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`,
        date: now.toLocaleString(),
      });

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`${t('Error Processing Audio')}: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecordingStart = () => {
    setError(null);
    setIsRecording(true);
  };

  const handleRecordingStop = async (blob: Blob) => {
    setIsRecording(false);
    try {
      const mp3Blob = await convertToMp3(blob);
      await processAudio(mp3Blob);
    } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'Could not convert audio to MP3.';
        setError(`${t('Error Processing Audio')}: ${errorMessage}`);
        setIsProcessing(false); // Ensure processing is stopped on conversion error
    }
  };
  
  const handleFileSubmit = async (file: File) => {
    await processAudio(file);
  };

  const handleReset = () => {
    setMeetingNotes(null);
    setError(null);
    setIsRecording(false);
    setIsProcessing(false);
    setAudioBlob(null);
    setMode('record');
  };
  
  const handleTitleChange = (newTitle: string) => {
    setMeetingNotes(prevNotes => {
      if (!prevNotes) return null;
      return { ...prevNotes, title: newTitle };
    });
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="text-center p-8 bg-slate-800 rounded-xl border border-red-500/50 max-w-md w-full animate-fade-in-fast">
          <h2 className="text-xl font-semibold text-red-400 mb-2">{t('Error Processing Audio')}</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800 transition-colors"
          >
            {t('Record Another')}
          </button>
        </div>
      );
    }

    if (meetingNotes) {
      return <ResultsDisplay notes={meetingNotes} onReset={handleReset} language={language} audioBlob={audioBlob} onTitleChange={handleTitleChange} />;
    }

    return (
        <div className="w-full max-w-md">
            <div className="flex justify-center p-1 mb-4 bg-slate-800/50 rounded-lg gap-1">
                <button
                    onClick={() => setMode('record')}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                        mode === 'record' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                    }`}
                >
                   <MicIcon className="w-5 h-5" />
                   {t('Record Audio')}
                </button>
                <button
                    onClick={() => setMode('upload')}
                     className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                        mode === 'upload' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                    }`}
                >
                    <UploadIcon className="w-5 h-5" />
                    {t('Upload File')}
                </button>
            </div>
            {mode === 'record' ? (
                 <RecorderControl
                    isRecording={isRecording}
                    isProcessing={isProcessing}
                    onRecordingStart={handleRecordingStart}
                    onRecordingStop={handleRecordingStop}
                />
            ) : (
                <FileUpload
                    isProcessing={isProcessing}
                    onFileSubmit={handleFileSubmit}
                />
            )}
        </div>
    )
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-700/[0.2] [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
      
      <header className="text-center mb-8 z-10 animate-fade-in-slow">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100">
          {t('Meeting Notes Generator')}
        </h1>
        <p className="text-slate-400 mt-2">{t('Generate meeting notes from audio')}</p>
      </header>

      <div className="w-full flex justify-center items-center z-10 mb-8">
        {renderContent()}
      </div>
      
      {!meetingNotes && !isRecording && !isProcessing && (
          <div className="z-10 flex items-center gap-2 animate-fade-in-slow">
              <label htmlFor="language-select" className="text-sm text-slate-400">{t('Language')}:</label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-1.5"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
          </div>
      )}
    </div>
  );
};

export default App;
