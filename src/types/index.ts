export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;
  points: number;
  difficulty: Difficulty;
}

export interface QuestionCategory {
  category: string;
  description: string;
  questions: Question[];
}

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  path: string;
}

export interface Score {
  id: string;
  username: string;
  score: number;
  category: string;
  createdAt: Date;
}

export interface QuizState {
  currentQuestions: Question[];
  currentQuestionIndex: number;
  score: number;
  selectedOption: number | null;
  isAnswered: boolean;
  isQuizCompleted: boolean;
  timeRemaining: number;
} 