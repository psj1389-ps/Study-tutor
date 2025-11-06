// Fix: Use `declare global` to augment the global scope for Vite environment variables.
// The previous interface declarations were local to this module and not applied globally,
// causing TypeScript errors when accessing `import.meta.env`.
declare global {
  // This ensures TypeScript knows about Vite's special environment variables
  interface ImportMetaEnv {
    readonly VITE_API_KEY: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export enum Subject {
  KOREAN = 'Korean',
  ENGLISH = 'English',
  MATH = 'Math',
}

export interface UploadedFile {
  name: string;
  mimeType: string;
  data: string;
}

export interface StudyDay {
  day: number;
  goal: string;
  tasks: string[];
}

export interface ChainOfThoughtExplanation {
  step1: string;
  step2: string;
  step3: string;
}

export interface MultipleChoiceQuestion {
  question: string;
  context?: string;
  options: string[];
  answer: string;
  examProbability: 'High' | 'Medium' | 'Low';
  chainOfThoughtExplanation: ChainOfThoughtExplanation;
}

export interface ShortAnswerQuestion {
  question: string;
  context?: string;
  answer: string;
  examProbability: 'High' | 'Medium' | 'Low';
  chainOfThoughtExplanation: ChainOfThoughtExplanation;
}

export interface StudyGuide {
  summary: string;
  studyPlan: StudyDay[];
  multipleChoiceQuestions: MultipleChoiceQuestion[];
  shortAnswerQuestions: ShortAnswerQuestion[];
}

export interface Quiz {
    multipleChoiceQuestions: MultipleChoiceQuestion[];
    shortAnswerQuestions: ShortAnswerQuestion[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}
