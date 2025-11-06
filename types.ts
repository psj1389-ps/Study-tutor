
export enum Subject {
  KOREAN = 'Korean',
  ENGLISH = 'English',
  MATH = 'Math',
}

export interface UploadedFile {
  name: string;
  mimeType: string;
  data: string; // base64 encoded data
}

export interface ChainOfThoughtExplanation {
  step1: string; // Analyze & Identify
  step2: string; // Step-by-Step Solution
  step3: string; // Review & Apply
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

export interface StudyDay {
  day: number;
  goal: string;
  tasks: string[];
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
