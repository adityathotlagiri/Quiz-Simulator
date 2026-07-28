import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Trophy, TrendingUp, Target, ListChecks, AlertTriangle, Sparkles } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";
import { Download } from "lucide-react";
const STUDENT_ID = "student-uuid-placeholder";

interface QuizWise {
  quizId: string;
  title: string;
  highest: number;
  average: number;
  latest: number;
  totalAttempts: number;
}

interface Summary {
  highestScore: number;
  averageScore: number;
  latestScore: number;
  totalAttempts: number;
  quizWise: QuizWise[];
}

interface WeakTopic {
  questionId: string;
  questionText: string;
  correct: number;
  incorrect: number;
}

interface TrendPoint {
  attemptId: string;
  quizTitle: string;
  date: string;
  percentage: number;
  passFail: boolean;
}

export default function PerformanceDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [correctIncorrect, setCorrectIncorrect] = useState({ correct: 0, incorrect: 0 });
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, weakRes, trendRes] = await Promise.all([
          axiosClient.get(`/student/performance/${STUDENT_ID}/summary`),
          axiosClient.get(`/student/performance/${STUDENT_ID}/weak-areas`),
          axiosClient.get(`/student/performance/${STUDENT_ID}/trend`),
        ]);
        setSummary(summaryRes.data.data);
        setWeakTopics(weakRes.data.data.weakTopics);
        setCorrectIncorrect({
          correct: weakRes.data.data.correctCount,
          incorrect: weakRes.data.data.incorrectCount,
        });
        setTrend(
          trendRes.data.data.map((t: TrendPoint) => ({
            ...t,
            date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          }))
        );
      } catch {
        toast.error("Failed to load performance data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading performance...</div>;
  }

  if (!summary || summary.totalAttempts === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-sm">No attempts yet — complete a quiz to see your performance here.</p>
        </div>
      </div>
    );
  }

    const totalAnswered = correctIncorrect.correct + correctIncorrect.incorrect;
    const accuracyPercent = totalAnswered > 0 ? (correctIncorrect.correct / totalAnswered) * 100 : 0;
    const exportCSV = () => {
    if (!summary) return;

    const headers = ["Quiz", "Highest %", "Average %", "Latest %", "Attempts"];
    const rows = summary.quizWise.map((q) => [
      q.title,
      q.highest.toFixed(1),
      q.average.toFixed(1),
      q.latest.toFixed(1),
      q.totalAttempts,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "performance_report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_35%)]" />
        <div className="max-w-6xl mx-auto px-8 py-10 relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-200 text-sm font-medium mb-2">
            <Sparkles size={16} />
            <span>Your Progress</span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white tracking-tight">
            Performance Dashboard
          </h1>
          <p className="text-indigo-100/80 text-sm mt-1">Track your scores, trends, and areas to improve</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-white text-indigo-700 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-all shadow-lg shadow-indigo-900/20"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>
      </div>
    

      <div className="max-w-6xl mx-auto px-8 -mt-6 pb-16 relative space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={<Trophy size={18} />} label="Highest Score" value={`${summary.highestScore.toFixed(1)}%`} color="from-amber-500 to-orange-500" />
          <StatCard icon={<TrendingUp size={18} />} label="Average Score" value={`${summary.averageScore.toFixed(1)}%`} color="from-indigo-500 to-violet-500" />
          <StatCard icon={<Target size={18} />} label="Latest Score" value={`${summary.latestScore.toFixed(1)}%`} color="from-emerald-500 to-teal-500" />
          <StatCard icon={<ListChecks size={18} />} label="Total Attempts" value={String(summary.totalAttempts)} color="from-rose-500 to-pink-500" />
        </div>

        {/* Trend chart */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg p-6">
          <h2 className="font-[family-name:var(--font-display)] font-semibold text-slate-800 text-lg mb-4">
            Score Trend
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} />
              <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 13 }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`${value.toFixed(1)}%`, "Score"]}
              />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#7C3AED"
                strokeWidth={3}
                dot={{ r: 5, fill: "#7C3AED" }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Quiz-wise breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg p-6">
            <h2 className="font-[family-name:var(--font-display)] font-semibold text-slate-800 text-lg mb-4">
              Quiz-wise Performance
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={summary.quizWise}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="title" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 13 }} />
                <Bar dataKey="average" fill="#7C3AED" radius={[6, 6, 0, 0]} name="Average %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Correct vs Incorrect */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg p-6">
            <h2 className="font-[family-name:var(--font-display)] font-semibold text-slate-800 text-lg mb-4">
              Answer Accuracy
            </h2>
            <div className="flex items-center justify-center h-[240px]">
              <div className="relative w-40 h-40">
                <svg className="w-40 h-40 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#FEE2E2" strokeWidth="12" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={2 * Math.PI * 42 * (1 - accuracyPercent / 100)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-800">
                    {accuracyPercent.toFixed(0)}%
                  </span>
                  <span className="text-[11px] text-slate-400">Accuracy</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-6 text-xs mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Correct: {correctIncorrect.correct}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-200" />
                Incorrect: {correctIncorrect.incorrect}
              </span>
            </div>
          </div>
        </div>

        {/* Weak topics */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="font-[family-name:var(--font-display)] font-semibold text-slate-800 text-lg">
              Areas to Improve
            </h2>
          </div>
          {weakTopics.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">
              No weak areas identified — nice work!
            </p>
          ) : (
            <div className="space-y-2.5">
              {weakTopics.map((t) => (
                <div
                  key={t.questionId}
                  className="flex items-center justify-between border border-amber-100 bg-amber-50/50 rounded-xl px-4 py-3"
                >
                  <p className="text-sm text-slate-700 flex-1 pr-4">{t.questionText}</p>
                  <div className="flex items-center gap-2 shrink-0 text-xs font-semibold">
                    <span className="text-emerald-600">{t.correct} correct</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-rose-600">{t.incorrect} incorrect</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-5">
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <div className="text-slate-400 text-[11px] uppercase tracking-wider font-medium">{label}</div>
      <div className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-800 mt-0.5">
        {value}
      </div>
    </div>
  );
}