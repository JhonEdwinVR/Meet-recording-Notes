import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MicIcon, StopCircleIcon } from './Icons';
import Spinner from './Spinner';
import Waveform from './Waveform';

interface RecorderControlProps {
  isRecording: boolean;
  isProcessing: boolean;
  onRecordingStart: () => void;
  onRecordingStop: (blob: Blob) => void;
}

const RecorderControl: React.FC<RecorderControlProps> = ({ isRecording, isProcessing, onRecordingStart, onRecordingStop }) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(0);

  useEffect(() => {
    // Fix: Use ReturnType<typeof setInterval> for browser compatibility.
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      onRecordingStart();
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onRecordingStop(audioBlob);
        stream.getTracks().forEach(track => track.stop()); // Stop microphone access
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check permissions.');
      // Ensure state is reset if permission is denied.
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
         mediaRecorderRef.current.stop();
      }
    }
  }, [onRecordingStart, onRecordingStop]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-slate-800 rounded-xl border border-slate-700">
      <div className="text-center">
        <h2 className="text-lg font-medium text-slate-300">
          {isProcessing ? "Analyzing Meeting..." : isRecording ? "Recording in Progress..." : "Ready to Record"}
        </h2>
        <p className={`transition-all duration-300 min-h-[2rem] flex items-center justify-center ${
            isRecording 
              ? 'text-2xl font-mono font-bold text-red-400' 
              : 'text-sm text-slate-400'
          }`}>
          {isProcessing ? "Please wait a moment." : isRecording ? formatTime(timer) : "Press the button to start recording."}
        </p>
      </div>
      
      {isRecording && <Waveform />}

      {isProcessing ? (
        <div className="h-20 w-20 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative flex items-center justify-center h-20 w-20 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-800 ${
            isRecording 
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-lg shadow-red-500/40' 
              : 'bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-400'
          } disabled:bg-slate-600 disabled:cursor-not-allowed`}
        >
          {isRecording && <div className="absolute inset-0 rounded-full bg-red-500/50 animate-ping"></div>}
          {isRecording ? (
            <StopCircleIcon className="w-10 h-10 text-white" />
          ) : (
            <MicIcon className="w-10 h-10 text-white" />
          )}
        </button>
      )}

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default RecorderControl;