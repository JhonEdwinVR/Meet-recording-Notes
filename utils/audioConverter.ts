
// lamejs is loaded from a CDN in index.html, so we declare it on the window object for TypeScript
declare global {
  interface Window {
    lamejs: any;
  }
}

/**
 * Converts an audio blob (e.g., from MediaRecorder) to an MP3 blob.
 * @param audioBlob The input audio blob, likely in 'audio/webm' format.
 * @returns A promise that resolves with a new Blob in 'audio/mpeg' format.
 */
export const convertToMp3 = (audioBlob: Blob): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (!window.lamejs) {
        return reject(new Error("lamejs library not found. Make sure it's loaded."));
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const channels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const kbps = 128; // Standard bitrate

        const mp3encoder = new window.lamejs.Mp3Encoder(channels, sampleRate, kbps);
        const mp3Data = [];

        // Get PCM data from each channel
        const pcmData = [];
        for (let i = 0; i < channels; i++) {
            pcmData.push(audioBuffer.getChannelData(i));
        }

        const samples = new Int16Array(pcmData[0].length);
        let sampleIndex = 0;
        
        // Interleave channels and convert to 16-bit PCM
        for (let i = 0; i < pcmData[0].length; i++) {
            for (let j = 0; j < channels; j++) {
                let sample = pcmData[j][i];
                // Clamp and convert to 16-bit
                sample = Math.max(-1, Math.min(1, sample));
                samples[sampleIndex++] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            }
        }

        const bufferSize = 1152; // Chunk size
        for (let i = 0; i < samples.length; i += bufferSize) {
          const chunk = samples.subarray(i, i + bufferSize);
          const mp3buf = mp3encoder.encodeBuffer(chunk);
          if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
          }
        }

        const flushed = mp3encoder.flush();
        if (flushed.length > 0) {
          mp3Data.push(flushed);
        }

        const mp3Blob = new Blob(mp3Data.map(d => new Uint8Array(d)), { type: 'audio/mpeg' });
        resolve(mp3Blob);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(audioBlob);
  });
};