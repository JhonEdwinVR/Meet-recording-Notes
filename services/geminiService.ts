import { GoogleGenAI, Type } from "@google/genai";
import { MeetingNotes, TranscriptEntry } from '../types';
import { Language } from "../constants";

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // remove the prefix 'data:*/*;base64,'
      resolve(base64data.substring(base64data.indexOf(',') + 1));
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(blob);
  });
};

const noteTakingSchema = {
    type: Type.OBJECT,
    properties: {
        transcript: {
            type: Type.ARRAY,
            description: 'The full verbatim transcription of the meeting audio, with each entry identifying the speaker. If a name is mentioned, use it. Otherwise, label speakers as "Participant 1", "Participant 2", etc.',
            items: {
                type: Type.OBJECT,
                properties: {
                    speaker: {
                        type: Type.STRING,
                        description: 'The identified speaker (e.g., "Jane Doe", "Participant 1").'
                    },
                    dialogue: {
                        type: Type.STRING,
                        description: 'The transcribed text spoken by the speaker.'
                    }
                },
                required: ['speaker', 'dialogue']
            }
        },
        summary: {
            type: Type.ARRAY,
            description: 'A concise bulleted list summarizing the key decisions and discussion points.',
            items: { type: Type.STRING }
        },
        tasks: {
            type: Type.ARRAY,
            description: 'A list of all action items mentioned, assigned to a specific team or individual.',
            items: {
                type: Type.OBJECT,
                properties: {
                    team: {
                        type: Type.STRING,
                        description: 'The team, department, or individual responsible for the action item.'
                    },
                    action: {
                        type: Type.STRING,
                        description: 'A clear and concise description of the task to be performed.'
                    }
                },
                required: ['team', 'action']
            }
        }
    },
    required: ['transcript', 'summary', 'tasks']
};


export const processMeetingAudio = async (audioBlob: Blob, language: Language): Promise<Omit<MeetingNotes, 'title' | 'date'>> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const audioBase64 = await blobToBase64(audioBlob);

  const audioPart = {
    inlineData: {
      mimeType: audioBlob.type,
      data: audioBase64,
    },
  };

  const textPart = {
    text: `You are an expert meeting assistant. Please process the attached meeting audio. 
    First, provide a full transcript of the original audio. For the transcript, identify the different voices and separate their dialogue. Give them the name that is mentioned in the audio. If you cannot identify a name, label them as "Participant 1", "Participant 2", and so on.
    Second, create a bulleted list summarizing the key decisions and discussion points. 
    Third, extract all action items and list them, grouping them by the responsible team or individual. 
    Your entire response, including the summary, tasks, team names, and actions, must be translated into ${language}. The transcript should remain in the original language of the audio.
    Your entire response must be in JSON format conforming to the provided schema.`,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [audioPart, textPart] },
    config: {
        responseMimeType: "application/json",
        responseSchema: noteTakingSchema,
    }
  });
  
  const jsonText = response.text.trim();
  
  try {
    const parsedJson = JSON.parse(jsonText);
    // Basic validation to ensure the parsed object matches our expected structure
    if (parsedJson && Array.isArray(parsedJson.summary) && Array.isArray(parsedJson.tasks) && Array.isArray(parsedJson.transcript)) {
        const isTranscriptValid = parsedJson.transcript.every(
            (entry: any): entry is TranscriptEntry => 
                typeof entry.speaker === 'string' && typeof entry.dialogue === 'string'
        );
        if (isTranscriptValid) {
            return parsedJson as Omit<MeetingNotes, 'title' | 'date'>;
        }
    }
    throw new Error("Parsed JSON does not match the expected structure.");

  } catch (error) {
    console.error("Failed to parse JSON response:", jsonText);
    if (error instanceof Error) {
        throw new Error(`The API returned a response that was not valid JSON. Details: ${error.message}`);
    }
    throw new Error("The API returned a response that was not valid JSON.");
  }
};
