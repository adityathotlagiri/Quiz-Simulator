export type QuestionType = "mcq" | "multi_select" | "true_false";
export type QuizStatus = "draft" | "published";
export type AssessmentMode = "practice" | "exam";

export interface Option {
  id?: string;
  optionText: string;
  isCorrect: boolean;
}

export interface Question {
  id?: string;
  questionText: string;
  type: QuestionType;
  marks: number;
  orderIndex: number;
  explanation: string;
  options: Option[];
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  durationMinutes: number;
  totalMarks: number;
  passingPercentage: number;
  assessmentMode: AssessmentMode;
  status: QuizStatus;
  createdBy: string;
  createdAt: string;
  questions?: Question[];
  _count?: { questions: number };
  randomizeQuestions: boolean;
}

export interface QuizFormValues {
  title: string;
  description: string;
  instructions: string;
  durationMinutes: number;
  totalMarks: number;
  passingPercentage: number;
  status: QuizStatus;
  questions: Question[];
  assessmentMode: AssessmentMode;
  allowedAttempts: number | "";
  hasTimer: boolean;
  scheduledStart: string;
  scheduledEnd: string;
  randomizeQuestions: boolean;
}
export interface PracticeConfig {
  id?: string;
  quizId: string;
  allowedAttempts: number | null;
  hasTimer: boolean;
  durationMinutes: number | null;
  isActive: boolean;
}

export interface ExamConfig {
  id?: string;
  quizId: string;
  scheduledStart: string;
  scheduledEnd: string;
  durationMinutes: number;
  isActive: boolean;
}

export interface Attempt {
  id: string;
  quizId: string;
  studentId: string;
  mode: "practice" | "exam";
  attemptNumber: number;
  status: "in_progress" | "submitted" | "auto_submitted";
  startedAt: string;
  submittedAt?: string | null;
  result?: {
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    passFail: boolean;
  } | null;
}