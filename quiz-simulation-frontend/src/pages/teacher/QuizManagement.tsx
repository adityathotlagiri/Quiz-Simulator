import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, FileQuestion, Clock, Sparkles, CalendarClock, Repeat } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import type { Quiz } from "../../types/quiz";
import toast from "react-hot-toast";
import QuizFormModal from "../../components/teacher/QuizFormModal";
const TEACHER_ID = "teacher-uuid-placeholder";
import QuizPreviewModal from "../../components/teacher/QuizPreviewModal";

export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/teacher/quizzes?createdBy=${TEACHER_ID}`);
      setQuizzes(res.data.data);
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
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quiz? This cannot be undone.")) return;
    try {
      await axiosClient.delete(`/teacher/quizzes/${id}`);
      toast.success("Quiz deleted");
      fetchQuizzes();
    } catch (err) {
      console.error("Quiz loading error details:", err);
      toast.error("Failed to delete quiz");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header band */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_35%)]" />
        <div className="max-w-6xl mx-auto px-8 py-10 relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-200 text-sm font-medium mb-2">
                <Sparkles size={16} />
                <span>Assessment Studio</span>
              </div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white tracking-tight">
                Quiz Management
              </h1>
              <p className="text-indigo-100/80 text-sm mt-1">
                Build, publish, and manage assessments for your students
              </p>
            </div>
            <button
              onClick={() => { setEditingQuiz(null); setModalOpen(true); }}
              className="flex items-center gap-2 bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-all shadow-lg shadow-indigo-900/20 hover:shadow-xl hover:-translate-y-0.5"
            >
              <Plus size={18} />
              New Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 -mt-6 pb-16 relative">
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Title</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Questions</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Duration</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Mode</th>
                <th className="text-right px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    Loading quizzes...
                  </td>
                </tr>
              ) : quizzes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                        <FileQuestion size={22} className="text-indigo-400" />
                      </div>
                      <p className="text-slate-500 text-sm">No quizzes yet — create your first assessment</p>
                    </div>
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz) => (
                  <tr key={quiz.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-[family-name:var(--font-display)] font-semibold text-slate-800">
                        {quiz.title}
                      </div>
                      {quiz.description && (
                        <div className="text-slate-400 text-xs mt-0.5 line-clamp-1">{quiz.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <FileQuestion size={14} className="text-slate-400" />
                        {quiz._count?.questions ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        {quiz.durationMinutes} min
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {quiz.status === "published" ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-200">
                          Published
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {quiz.assessmentMode === "exam" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <CalendarClock size={12} />
                          Exam
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Repeat size={12} />
                          Practice
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={async () => {
                            const res = await axiosClient.get(`/teacher/quizzes/${quiz.id}`);
                            setPreviewQuiz(res.data.data);
                            setPreviewOpen(true);
                          }}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={async () => {
                            const res = await axiosClient.get(`/teacher/quizzes/${quiz.id}`);
                            setEditingQuiz(res.data.data);
                            setModalOpen(true);
                          }}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(quiz.id)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <QuizFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchQuizzes}
        editingQuiz={editingQuiz}
      />
      <QuizPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        quiz={previewQuiz}
      />
    </div>
  );
}