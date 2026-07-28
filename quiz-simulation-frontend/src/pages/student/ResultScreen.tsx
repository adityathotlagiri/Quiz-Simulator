import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Trophy, Target, ListChecks, ArrowLeft } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import { Download } from "lucide-react";
interface Option {
  id: string;
  optionText: string;
  isCorrect: boolean;
}

interface ResponseItem {
  id: string;
  questionId: string;
  selectedOptionIds: string[];
  isCorrect: boolean;
  marksObtained: number;
  question: {
    questionText: string;
    marks: number;
    explanation: string | null;
    options: Option[];
  };
}

interface AttemptDetail {
  id: string;
  mode: "practice" | "exam";
  responses: ResponseItem[];
  result: {
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    passFail: boolean;
  };
  quiz: { title: string };
}

export default function ResultScreen() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get(`/student/attempts/${attemptId}`)
      .then((res) => setAttempt(res.data.data))
      .catch(() => toast.error("Failed to load result"))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading result...</div>;
  }

  if (!attempt || !attempt.result) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Result not found.</div>;
  }

  const { result } = attempt;
  const passed = result.passFail;
  const downloadReport = () => {
  if (!attempt || !attempt.result) return;

  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(18);
  doc.setTextColor(76, 29, 149); // violet
  doc.text(attempt.quiz.title, 14, y);
  y += 10;

  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(`Result Report — Generated ${new Date().toLocaleString()}`, 14, y);
  y += 12;

  doc.setDrawColor(230, 230, 230);
  doc.line(14, y, 196, y);
  y += 10;

  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text(`Score: ${attempt.result.obtainedMarks} / ${attempt.result.totalMarks}`, 14, y);
  y += 8;
  doc.text(`Percentage: ${attempt.result.percentage.toFixed(1)}%`, 14, y);
  y += 8;
  doc.setTextColor(attempt.result.passFail ? 16 : 220, attempt.result.passFail ? 150 : 38, attempt.result.passFail ? 90 : 38);
  doc.text(`Status: ${attempt.result.passFail ? "PASS" : "FAIL"}`, 14, y);
  y += 12;

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.text("Answer Breakdown", 14, y);
  y += 8;
  doc.setDrawColor(230, 230, 230);
  doc.line(14, y, 196, y);
  y += 8;

  attempt.responses.forEach((r, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    const qLines = doc.splitTextToSize(`Q${index + 1}. ${r.question.questionText}`, 180);
    doc.text(qLines, 14, y);
    y += qLines.length * 5 + 2;

    doc.setTextColor(r.isCorrect ? 16 : 220, r.isCorrect ? 150 : 38, r.isCorrect ? 90 : 38);
    doc.text(r.isCorrect ? `Correct (+${r.marksObtained})` : `Incorrect (0/${r.question.marks})`, 14, y);
    y += 6;

    if (!r.isCorrect && r.question.explanation) {
      doc.setTextColor(120, 120, 120);
      const expLines = doc.splitTextToSize(`Explanation: ${r.question.explanation}`, 180);
      doc.text(expLines, 14, y);
      y += expLines.length * 5;
    }

    y += 6;
  });

  doc.save(`${attempt.quiz.title.replace(/\s+/g, "_")}_result.pdf`);
};
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div
        className={`relative overflow-hidden px-8 py-10 ${
          passed
            ? "bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500"
            : "bg-gradient-to-br from-rose-600 via-rose-500 to-orange-500"
        }`}
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_80%_20%,white,transparent_35%)]" />
        <div className="max-w-3xl mx-auto relative">
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
            <Trophy size={16} />
            <span>{attempt.quiz.title}</span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white tracking-tight">
            {passed ? "You Passed! 🎉" : "Keep Practicing"}
          </h1>
          <p className="text-white/80 text-sm mt-1">
            {passed
              ? "Great work — you cleared the passing threshold."
              : "You didn't reach the passing score this time, but you can review and try again."}
          </p>

          {/* Score cards */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3">
              <div className="text-white/70 text-[11px] uppercase tracking-wider">Score</div>
              <div className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
                {result.obtainedMarks}/{result.totalMarks}
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3">
              <div className="text-white/70 text-[11px] uppercase tracking-wider">Percentage</div>
              <div className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
                {result.percentage.toFixed(1)}%
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3">
              <div className="text-white/70 text-[11px] uppercase tracking-wider">Status</div>
              <div className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
                {passed ? "Pass" : "Fail"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review */}
      <div className="max-w-3xl mx-auto px-8 py-8">
        <div className="flex items-center gap-2 mb-5">
          <ListChecks size={18} className="text-indigo-500" />
          <h2 className="font-[family-name:var(--font-display)] font-semibold text-slate-800 text-lg">
            Answer Review
          </h2>
        </div>

        <div className="space-y-4">
          {attempt.responses.map((r, index) => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-indigo-500 bg-indigo-50 rounded-md px-2 py-1 shrink-0">
                    Q{index + 1}
                  </span>
                  <p className="text-sm font-medium text-slate-800 pt-0.5">{r.question.questionText}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {r.isCorrect ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1">
                      <CheckCircle2 size={13} />
                      +{r.marksObtained}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 rounded-full px-2.5 py-1">
                      <XCircle size={13} />
                      0/{r.question.marks}
                    </span>
                  )}
                </div>
              </div>

              <div className="pl-9 space-y-1.5">
                {r.question.options.map((opt) => {
                  const wasSelected = r.selectedOptionIds.includes(opt.id);
                  const isCorrectOption = opt.isCorrect;

                  let style = "border-slate-100 text-slate-500";
                  if (isCorrectOption) {
                    style = "border-emerald-200 bg-emerald-50 text-emerald-700 font-medium";
                  } else if (wasSelected && !isCorrectOption) {
                    style = "border-rose-200 bg-rose-50 text-rose-700 font-medium";
                  }

                  return (
                    <div key={opt.id} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${style}`}>
                      {isCorrectOption ? (
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                      ) : wasSelected ? (
                        <XCircle size={15} className="text-rose-500 shrink-0" />
                      ) : (
                        <Target size={15} className="text-slate-300 shrink-0" />
                      )}
                      {opt.optionText}
                      {wasSelected && <span className="ml-auto text-[10px] uppercase tracking-wide opacity-70">Your answer</span>}
                    </div>
                  );
                })}
              </div>

              {!r.isCorrect && r.question.explanation && (
                <div className="pl-9 mt-3 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                  <span className="font-semibold text-slate-600">Explanation: </span>
                  {r.question.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={() => navigate("/student/quizzes")}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-300 transition-all"
          >
            <ArrowLeft size={15} />
            Back to Assessments
          </button>
          <button
            onClick={downloadReport}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all"
          >
            <Download size={15} />
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}