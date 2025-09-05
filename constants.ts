
export const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Japanese'] as const;
export type Language = typeof LANGUAGES[number];
