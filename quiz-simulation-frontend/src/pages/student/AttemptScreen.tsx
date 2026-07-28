import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Save, CheckCircle2 } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";
import CountdownTimer from "../../components/student/CountdownTimer";
interface Option {
  id: string;
  optionText: string;
}

interface Question {
  id: string;
  questionText: string;
  type: "mcq" | "multi_select" | "true_false";
  marks: number;
  options: Option[];
}

export default function AttemptScreen() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [quizId, setQuizId] = useState("");
  const [mode, setMode] = useState<"practice" | "exam">("practice");
  const [timerDuration, setTimerDuration] = useState<number | null>(null);
  const storageKey = `answers-${attemptId}`;

  
    const handleAutoSubmit = async () => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        const responses = questions.map((q) => ({
          questionId: q.id,
          selectedOptionIds: answers[q.id] || [],
        }));

        await axiosClient.post(`/student/attempts/${attemptId}/submit`, {
          responses,
          autoSubmitted: true,
        });
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`inprogress-${quizId}-${mode}`);
        toast.error("Time's up — your assessment was submitted automatically");
        navigate(`/student/result/${attemptId}`);
      } catch (err) {
        console.error("Quiz loading error details:", err);
        toast.error("Auto-submit failed");
        setIsSubmitting(false);
      }
    };
  useEffect(() => {
    const load = async () => {
  try {
    const attemptRes = await axiosClient.get(`/student/attempts/${attemptId}`);
    const attempt = attemptRes.data.data;
    setQuizId(attempt.quizId);
    setMode(attempt.mode);
    setQuizTitle(attempt.quiz.title);

    const quizRes = await axiosClient.get(`/student/quizzes/${attempt.quizId}`);
    let loadedQuestions = quizRes.data.data.questions;

    if (quizRes.data.data.randomizeQuestions) {
      loadedQuestions = [...loadedQuestions].sort(() => Math.random() - 0.5);
    }

    setQuestions(loadedQuestions);

    // Determine timer duration based on mode
    if (attempt.mode === "exam") {
      const examRes = await axiosClient.get(`/teacher/config/exam/${attempt.quizId}`);
      setTimerDuration(examRes.data.data.durationMinutes);
    } else {
      const practiceRes = await axiosClient.get(`/teacher/config/practice/${attempt.quizId}`);
      if (practiceRes.data.data.hasTimer) {
        setTimerDuration(practiceRes.data.data.durationMinutes);
      }
    }

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setAnswers(JSON.parse(saved));
    }
  } catch (err) {
    console.error("Quiz loading error details:", err);
    toast.error("Failed to load attempt");
  } finally {
    setLoading(false);
  }
};

    load();
  }, [attemptId]);

  const saveProgress = (updated: Record<string, string[]>) => {
    setAnswers(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const toggleOption = (questionId: string, optionId: string, multi: boolean) => {
    const current = answers[questionId] || [];
    let updated: string[];

    if (multi) {
      updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
    } else {
      updated = [optionId];
    }

    saveProgress({ ...answers, [questionId]: updated });
  };

  const handleSaveAndExit = () => {
    toast.success("Progress saved — continue anytime");
    navigate("/student/quizzes");
  };

    const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const responses = questions.map((q) => ({
        questionId: q.id,
        selectedOptionIds: answers[q.id] || [],
      }));

      await axiosClient.post(`/student/attempts/${attemptId}/submit`, { responses });
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`inprogress-${quizId}-${mode}`);
      toast.success("Submitted!");
      navigate(`/student/result/${attemptId}`);
    } catch (err) {
      console.error("Quiz loading error details:", err);
      toast.error("Failed to submit");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;
  }

  const question = questions[currentIndex];
  const answeredCount = Object.keys(answers).filter((qId) => answers[qId]?.length > 0).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-violet-600 px-8 py-5 flex items-center justify-between">
        <div>
            <h1 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            {quizTitle}
            </h1>
            <p className="text-indigo-100/80 text-xs mt-0.5">
            {answeredCount} of {questions.length} answered
            </p>
        </div>

        <div className="flex items-center gap-3">
            {timerDuration !== null && (
            <CountdownTimer durationMinutes={timerDuration} onExpire={handleAutoSubmit} />
            )}
            {mode === "practice" && (
            <button
                onClick={handleSaveAndExit}
                className="flex items-center gap-1.5 bg-white/15 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/25 transition-colors"
            >
                <Save size={15} />
                Save & Continue Later
            </button>
            )}
        </div>
        </div>

      <div className="max-w-3xl mx-auto px-8 py-8">
        {/* Progress dots */}
        <div className="flex flex-wrap gap-2 mb-6">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                i === currentIndex
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : answers[q.id]?.length
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-white text-slate-400 border border-slate-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question card */}
        {question && (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-bold text-indigo-500 bg-indigo-50 rounded-md px-2.5 py-1">
                Question {currentIndex + 1}
              </span>
              <span className="text-xs font-semibold text-violet-600 bg-violet-50 rounded-full px-2.5 py-1">
                {question.marks} {question.marks === 1 ? "mark" : "marks"}
              </span>
            </div>

            <p className="text-slate-800 font-medium mb-5">{question.questionText}</p>

            <div className="space-y-2.5">
              {question.options.map((opt) => {
                const isSelected = (answers[question.id] || []).includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-all ${
                      isSelected
                        ? "border-indigo-400 bg-indigo-50/70 ring-1 ring-indigo-200"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type={question.type === "multi_select" ? "checkbox" : "radio"}
                      checked={isSelected}
                      onChange={() =>
                        toggleOption(question.id, opt.id, question.type === "multi_select")
                      }
                      className="accent-indigo-600 w-4 h-4"
                    />
                    <span className="text-sm text-slate-700">{opt.optionText}</span>
                    {isSelected && <CheckCircle2 size={16} className="text-indigo-500 ml-auto" />}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-slate-600 font-medium text-sm hover:bg-slate-100 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Assessment"}
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-indigo-200 transition-all"
            >
              Next
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}