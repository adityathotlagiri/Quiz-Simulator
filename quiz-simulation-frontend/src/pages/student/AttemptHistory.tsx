import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";

const STUDENT_ID = "student-uuid-placeholder";

interface AttemptRow {
  id: string;
  attemptNumber: number;
  status: string;
  startedAt: string;
  submittedAt: string | null;
  result: {
    obtainedMarks: number;
    totalMarks: number;
    percentage: number;
    passFail: boolean;
  } | null;
}

export default function AttemptHistory() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [historyRes, quizRes] = await Promise.all([
          axiosClient.get(`/student/attempts/history/${quizId}/${STUDENT_ID}?mode=practice`),
          axiosClient.get(`/student/quizzes/${quizId}`),
        ]);
        setAttempts(historyRes.data.data);
        setQuizTitle(quizRes.data.data.title);
      } catch {
        toast.error("Failed to load attempt history");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quizId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading history...</div>;
  }

  const submittedAttempts = attempts.filter((a) => a.result);
  const best = submittedAttempts.length
    ? Math.max(...submittedAttempts.map((a) => a.result!.percentage))
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 px-8 py-10">
        <button
          onClick={() => navigate("/student/quizzes")}
          className="flex items-center gap-1.5 text-indigo-100 text-sm mb-3 hover:text-white transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Assessments
        </button>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
          {quizTitle} — Attempt History
        </h1>
        <p className="text-indigo-100/80 text-sm mt-1">
          {submittedAttempts.length} attempt{submittedAttempts.length !== 1 ? "s" : ""} · Best score: {best.toFixed(1)}%
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-8">
        {attempts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md py-16 text-center">
            <p className="text-slate-400 text-sm">No attempts yet for this practice test.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((a) => (
              <div
                key={a.id}
                onClick={() => a.result && navigate(`/student/result/${a.id}`)}
                className={`bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 flex items-center justify-between ${
                  a.result ? "cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center font-[family-name:var(--font-display)] font-semibold text-indigo-600">
                    #{a.attemptNumber}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <Clock size={13} className="text-slate-400" />
                      {new Date(a.startedAt).toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 capitalize">{a.status.replace("_", " ")}</div>
                  </div>
                </div>

                {a.result ? (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-[family-name:var(--font-display)] font-semibold text-slate-800">
                        {a.result.obtainedMarks}/{a.result.totalMarks}
                      </div>
                      <div className="text-xs text-slate-400">{a.result.percentage.toFixed(1)}%</div>
                    </div>
                    {a.result.passFail ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-3 py-1.5">
                        <CheckCircle2 size={13} />
                        Pass
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 rounded-full px-3 py-1.5">
                        <XCircle size={13} />
                        Fail
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">In progress</span>
                )}
              </div>
            ))}
          </div>
        )}

        {submittedAttempts.length > 1 && (
          <div className="mt-6 bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 flex items-center gap-3">
            <TrendingUp size={18} className="text-indigo-500" />
            <p className="text-sm text-slate-600">
              {submittedAttempts[submittedAttempts.length - 1].result!.percentage >
              submittedAttempts[0].result!.percentage
                ? "You're improving — your latest score beats your first attempt."
                : "Keep practicing — review the explanations from past attempts to boost your score."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}