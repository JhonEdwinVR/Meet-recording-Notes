
export interface Task {
  team: string;
  action: string;
}

export interface MeetingNotes {
  title: string;
  date: string;
  summary: string[];
  tasks: Task[];
  transcript: string;
}