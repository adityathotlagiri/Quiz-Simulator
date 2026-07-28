import { X, Clock, Award, Target, CheckCircle2, ListChecks } from "lucide-react";
import type { Quiz } from "../../types/quiz";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz | null;
}

const typeLabel: Record<string, string> = {
  mcq: "Single Choice",
  multi_select: "Multiple Select",
  true_false: "True / False",
};

export default function QuizPreviewModal({ isOpen, onClose, quiz }: Props) {
  if (!isOpen || !quiz) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-violet-600 px-6 py-5 flex items-start justify-between">
          <div>
            <div className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
              Preview
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
              {quiz.title}
            </h2>
            {quiz.description && (
              <p className="text-indigo-100/80 text-sm mt-1">{quiz.description}</p>
            )}
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors shrink-0">
            <X size={22} />
          </button>
        </div>

        {/* Meta strip */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/60">
          <div className="px-6 py-3 flex items-center gap-2">
            <Clock size={16} className="text-indigo-500" />
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wide">Duration</div>
              <div className="text-sm font-semibold text-slate-700">{quiz.durationMinutes} min</div>
            </div>
          </div>
          <div className="px-6 py-3 flex items-center gap-2">
            <Award size={16} className="text-indigo-500" />
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wide">Total Marks</div>
              <div className="text-sm font-semibold text-slate-700">{quiz.totalMarks}</div>
            </div>
          </div>
          <div className="px-6 py-3 flex items-center gap-2">
            <Target size={16} className="text-indigo-500" />
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wide">Passing</div>
              <div className="text-sm font-semibold text-slate-700">{quiz.passingPercentage}%</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {quiz.instructions && (
          <div className="px-6 py-4 bg-amber-50/60 border-b border-amber-100 text-sm text-amber-800">
            <span className="font-semibold">Instructions: </span>
            {quiz.instructions}
          </div>
        )}

        {/* Questions */}
        <div className="overflow-y-auto px-6 py-6 flex-1 space-y-5">
          {!quiz.questions || quiz.questions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">No questions added yet.</div>
          ) : (
            quiz.questions.map((q, qIndex) => (
              <div key={q.id || qIndex} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-indigo-500 bg-indigo-50 rounded-md px-2 py-1 shrink-0">
                      Q{qIndex + 1}
                    </span>
                    <p className="text-sm font-medium text-slate-800 pt-0.5">{q.questionText}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 rounded-full px-2.5 py-1">
                      {typeLabel[q.type]}
                    </span>
                    <span className="text-[11px] font-semibold text-violet-600 bg-violet-50 rounded-full px-2.5 py-1">
                      {q.marks} {q.marks === 1 ? "mark" : "marks"}
                    </span>
                  </div>
                </div>

                <div className="pl-9 space-y-1.5">
                  {q.options.map((opt, oIndex) => (
                    <div
                      key={oIndex}
                      className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${
                        opt.isCorrect
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 font-medium"
                          : "border-slate-100 text-slate-600"
                      }`}
                    >
                      {opt.isCorrect ? (
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                      ) : (
                        <ListChecks size={15} className="text-slate-300 shrink-0" />
                      )}
                      {opt.optionText}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <div className="pl-9 mt-3 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                    <span className="font-semibold text-slate-600">Explanation: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex justify-end bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-300 transition-all"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}