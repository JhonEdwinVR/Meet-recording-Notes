import { Language } from './constants';

export interface Task {
  team: string;
  action: string;
}

export interface TranscriptEntry {
  speaker: string;
  dialogue: string;
}

export interface MeetingNotes {
  title: string;
  date: string;
  summary: string[];
  tasks: Task[];
  transcript: TranscriptEntry[];
}
