/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Repeat, CalendarClock, Clock, Award, Sparkles, ChevronRight } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";
import type { Quiz } from "../../types/quiz";
import { useNavigate } from "react-router-dom";
// const STUDENT_ID = "student-uuid-placeholder"; // will come from auth later

type Tab = "practice" | "exam";

export default function StudentQuizList() {
  const [tab, setTab] = useState<Tab>("practice");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/student/quizzes?status=published`);
      const filtered = res.data.data.filter((q: any) => q.assessmentMode === tab);
      setQuizzes(filtered);
    } catch (err) {
      console.error("Quiz loading error details:", err);
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQuizzes();
  }, [tab]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_80%_20%,white,transparent_35%)]" />
        <div className="max-w-6xl mx-auto px-8 py-15 pt-7 relative">
          <div className="flex items-center gap-2 text-indigo-200 text-sm font-medium mb-2">
            <Sparkles size={16} />
            <span>Your Learning Path</span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white tracking-tight">
            Assessments
          </h1>
          <p className="text-indigo-100/80 text-sm mt-1">
            Sharpen your skills with practice, or take it live in an exam
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 -mt-12 pb-16 relative">
        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setTab("practice")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              tab === "practice"
                ? "bg-white text-indigo-700 shadow-lg shadow-slate-300/40"
                : "bg-white/50 text-white hover:bg-white/70"
            }`}
          >
            <Repeat size={16} />
            Practice
          </button>
          <button
            onClick={() => setTab("exam")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              tab === "exam"
                ? "bg-white text-indigo-700 shadow-lg shadow-slate-300/40"
                : "bg-white/50 text-white hover:bg-white/70"
            }`}
          >
            <CalendarClock size={16} />
            Exam
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading assessments...</div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg py-16 text-center">
            <p className="text-slate-400 text-sm">
              No {tab === "practice" ? "practice tests" : "exams"} available right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} mode={tab} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// function QuizCard({ quiz, mode }: { quiz: Quiz; mode: Tab }) {
//   const navigate = useNavigate();
//   const examConfig = (quiz as any).examConfig;
//   const practiceConfig = (quiz as any).practiceConfig;

//   const isExamOpen =
//     mode === "exam" &&
//     examConfig &&
//     new Date() >= new Date(examConfig.scheduledStart) &&
//     new Date() <= new Date(examConfig.scheduledEnd);

//   const handleStart = async () => {
//     try {
//       // Resume an in-progress attempt if one exists (Save & Continue Later)
//       const savedAttemptId = localStorage.getItem(`inprogress-${quiz.id}-${mode}`);
//       if (savedAttemptId) {
//         navigate(`/student/attempt/${savedAttemptId}`);
//         return;
//       }

//       const res = await axiosClient.post(`/student/attempts/start`, {
//         quizId: quiz.id,
//         studentId: "student-uuid-placeholder",
//         mode,
//       });
//       const attempt = res.data.data;
//       localStorage.setItem(`inprogress-${quiz.id}-${mode}`, attempt.id);
//       navigate(`/student/attempt/${attempt.id}`);
//     } catch (err: any) {
//       toast.error(err.response?.data?.message || "Unable to start attempt");
//     }
//   };

//   return (
//     <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md hover:shadow-xl transition-shadow p-5 flex flex-col">
//       <div className="flex items-start justify-between mb-2">
//         <h3 className="font-[family-name:var(--font-display)] font-semibold text-slate-800 text-lg">
//           {quiz.title}
//         </h3>
//         {mode === "exam" && (
//           <span
//             className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${
//               isExamOpen ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
//             }`}
//           >
//             {isExamOpen ? "Open Now" : "Scheduled"}
//           </span>
//         )}
//       </div>

//       {quiz.description && (
//         <p className="text-slate-500 text-sm mb-4 line-clamp-2">{quiz.description}</p>
//       )}

//       <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
//         <span className="flex items-center gap-1.5">
//           <Clock size={13} />
//           {mode === "practice"
//             ? practiceConfig?.hasTimer
//               ? `${practiceConfig.durationMinutes} min`
//               : "No timer"
//             : `${examConfig?.durationMinutes} min`}
//         </span>
//         <span className="flex items-center gap-1.5">
//           <Award size={13} />
//           {quiz.totalMarks} marks
//         </span>
//         {mode === "practice" && (
//           <span className="flex items-center gap-1.5">
//             <Repeat size={13} />
//             {practiceConfig?.allowedAttempts ? `${practiceConfig.allowedAttempts} attempts` : "Unlimited"}
//           </span>
//         )}
        
//       </div>
//       {mode === "practice" && (
//         <button
//           onClick={() => navigate(`/student/history/${quiz.id}`)}
//           className="text-xs text-indigo-500 font-medium mb-2 self-start hover:underline"
//         >
//           View attempt history →
//         </button>
//       )}
//       {mode === "exam" && examConfig && (
//         <p className="text-xs text-slate-400 mb-4">
//           {new Date(examConfig.scheduledStart).toLocaleString()} —{" "}
//           {new Date(examConfig.scheduledEnd).toLocaleString()}
//         </p>
//       )}

//       <button
//         onClick={handleStart}
//         disabled={mode === "exam" && !isExamOpen}
//         className="mt-auto flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
//       >
//         {mode === "practice" ? "Start Practice" : isExamOpen ? "Start Exam" : "Not Yet Open"}
//         <ChevronRight size={15} />
//       </button>
//     </div>
//   );
// }
function QuizCard({ quiz, mode }: { quiz: Quiz; mode: Tab }) {
  const navigate = useNavigate();
  const examConfig = (quiz as any).examConfig;
  const practiceConfig = (quiz as any).practiceConfig;
  const [attemptsUsed, setAttemptsUsed] = useState<number | null>(null);

  useEffect(() => {
  if (mode === "practice" && !practiceConfig?.allowedAttempts) return;

  axiosClient
    .get(`/student/attempts/history/${quiz.id}/student-uuid-placeholder?mode=${mode}`)
    .then((res) => setAttemptsUsed(res.data.data.length))
    .catch(() => setAttemptsUsed(0));
}, [quiz.id, mode]);

  const attemptsExhausted =
    (mode === "practice" &&
      practiceConfig?.allowedAttempts &&
      attemptsUsed !== null &&
      attemptsUsed >= practiceConfig.allowedAttempts) ||
    (mode === "exam" && attemptsUsed !== null && attemptsUsed >= 1);

  const isExamOpen =
    mode === "exam" &&
    examConfig &&
    new Date() >= new Date(examConfig.scheduledStart) &&
    new Date() <= new Date(examConfig.scheduledEnd);

  const handleStart = async () => {
    try {
      const savedAttemptId = localStorage.getItem(`inprogress-${quiz.id}-${mode}`);
      if (savedAttemptId) {
        navigate(`/student/attempt/${savedAttemptId}`);
        return;
      }

      const res = await axiosClient.post(`/student/attempts/start`, {
        quizId: quiz.id,
        studentId: "student-uuid-placeholder",
        mode,
      });
      const attempt = res.data.data;
      localStorage.setItem(`inprogress-${quiz.id}-${mode}`, attempt.id);
      navigate(`/student/attempt/${attempt.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Unable to start attempt");
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-md transition-shadow p-5 flex flex-col ${attemptsExhausted ? "opacity-60" : "hover:shadow-xl"}`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-[family-name:var(--font-display)] font-semibold text-slate-800 text-lg">
          {quiz.title}
        </h3>
        {mode === "exam" && (
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${
              isExamOpen ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
            }`}
          >
            {isExamOpen ? "Open Now" : "Scheduled"}
          </span>
        )}
      </div>

      {quiz.description && (
        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{quiz.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
        <span className="flex items-center gap-1.5">
          <Clock size={13} />
          {mode === "practice"
            ? practiceConfig?.hasTimer
              ? `${practiceConfig.durationMinutes} min`
              : "No timer"
            : `${examConfig?.durationMinutes} min`}
        </span>
        <span className="flex items-center gap-1.5">
          <Award size={13} />
          {quiz.totalMarks} marks
        </span>
        {mode === "practice" && (
          <span className={`flex items-center gap-1.5 font-medium ${attemptsExhausted ? "text-rose-500" : ""}`}>
            <Repeat size={13} />
            {practiceConfig?.allowedAttempts
              ? `${attemptsUsed ?? 0}/${practiceConfig.allowedAttempts} attempts`
              : "Unlimited"}
          </span>
        )}
      </div>
      {mode === "practice" && (
        <button
          onClick={() => navigate(`/student/history/${quiz.id}`)}
          className="text-xs text-indigo-500 font-medium mb-2 self-start hover:underline"
        >
          View attempt history →
        </button>
      )}
      {mode === "exam" && examConfig && (
        <p className="text-xs text-slate-400 mb-4">
          {new Date(examConfig.scheduledStart).toLocaleString()} —{" "}
          {new Date(examConfig.scheduledEnd).toLocaleString()}
        </p>
      )}

      <button
        onClick={handleStart}
        disabled={(mode === "exam" && (!isExamOpen || attemptsExhausted)) || attemptsExhausted}
        className="mt-auto flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
      >
        {mode === "practice"
          ? attemptsExhausted
            ? "No Attempts Left"
            : "Start Practice"
          : attemptsExhausted
          ? "Already Attempted"
          : isExamOpen
          ? "Start Exam"
          : "Not Yet Open"}
        <ChevronRight size={15} />
      </button>
      {/* <ChatWidget /> */}
    </div>
  );
}