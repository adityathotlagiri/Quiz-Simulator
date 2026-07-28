/* eslint-disable @typescript-eslint/no-explicit-any */
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { X, Plus, Trash2, GripVertical, CheckCircle2 } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";
import type { Quiz, QuizFormValues, QuestionType } from "../../types/quiz";
import { CalendarClock, Repeat } from "lucide-react";
const TEACHER_ID = "teacher-uuid-placeholder";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingQuiz?: Quiz | null;
}

const emptyOption = () => ({ optionText: "", isCorrect: false });

const emptyQuestion = (orderIndex: number) => ({
  questionText: "",
  type: "mcq" as QuestionType,
  marks: 1,
  orderIndex,
  explanation: "",
  options: [emptyOption(), emptyOption()],
});

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  durationMinutes: Yup.number().min(1, "Must be at least 1 minute").required(),
  totalMarks: Yup.number().min(1, "Must be at least 1").required(),
  passingPercentage: Yup.number().min(0).max(100).required(),
  questions: Yup.array()
    .min(1, "Add at least one question")
    .of(
      Yup.object({
        questionText: Yup.string().required("Question text is required"),
        marks: Yup.number().min(1).required(),
        options: Yup.array().min(2, "At least 2 options required"),
      })
    ),
});

export default function QuizFormModal({ isOpen, onClose, onSaved, editingQuiz }: Props) {
  if (!isOpen) return null;

  const initialValues: QuizFormValues = editingQuiz
      ? {
          title: editingQuiz.title,
          description: editingQuiz.description || "",
          instructions: editingQuiz.instructions || "",
          durationMinutes: editingQuiz.durationMinutes,
          totalMarks: editingQuiz.totalMarks,
          passingPercentage: editingQuiz.passingPercentage,
          status: editingQuiz.status,
          assessmentMode: editingQuiz.assessmentMode || "practice",
          allowedAttempts: (editingQuiz as any).practiceConfig?.allowedAttempts ?? "",
          hasTimer: (editingQuiz as any).practiceConfig?.hasTimer ?? false,
          scheduledStart: (editingQuiz as any).examConfig?.scheduledStart?.slice(0, 16) ?? "",
          scheduledEnd: (editingQuiz as any).examConfig?.scheduledEnd?.slice(0, 16) ?? "",
          questions: editingQuiz.questions?.length ? editingQuiz.questions : [emptyQuestion(1)],
          randomizeQuestions: editingQuiz?.randomizeQuestions ?? false,
        }
      : {
          title: "",
          description: "",
          instructions: "",
          durationMinutes: 20,
          totalMarks: 10,
          passingPercentage: 60,
          status: "draft",
          assessmentMode: "practice",
          allowedAttempts: "",
          hasTimer: false,
          scheduledStart: "",
          scheduledEnd: "",
          questions: [emptyQuestion(1)],
          randomizeQuestions: false,
        };

      const handleSubmit = async (values: QuizFormValues) => {
      try {
        const payload = {
          ...values,
          createdBy: TEACHER_ID,
          allowedAttempts: values.allowedAttempts === "" ? null : Number(values.allowedAttempts),
        };
        if (editingQuiz) {
          await axiosClient.put(`/teacher/quizzes/${editingQuiz.id}`, payload);
          toast.success("Quiz updated");
        } else {
          await axiosClient.post(`/teacher/quizzes`, payload);
          toast.success("Quiz created");
        }
        onSaved();
        onClose();
      } catch (err) {
        toast.error("Failed to save quiz");
      }
    };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-violet-600 px-6 py-5 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
            {editingQuiz ? "Edit Quiz" : "Create New Quiz"}
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, isSubmitting, setFieldValue  }) => (
            <Form className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto px-6 py-6 flex-1 space-y-6">
                {/* Basic details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Title
                    </label>
                    <Field
                      name="title"
                      placeholder="e.g. JavaScript Fundamentals"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    />
                    <ErrorMessage name="title" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Description
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      rows={2}
                      placeholder="Brief summary shown to students"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Instructions
                    </label>
                    <Field
                      as="textarea"
                      name="instructions"
                      rows={2}
                      placeholder="Instructions shown before the quiz starts"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Duration (minutes)
                    </label>
                    <Field
                      type="number"
                      name="durationMinutes"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <ErrorMessage name="durationMinutes" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Total Marks
                    </label>
                    <Field
                      type="number"
                      name="totalMarks"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <ErrorMessage name="totalMarks" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Passing %
                    </label>
                    <Field
                      type="number"
                      name="passingPercentage"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Status
                    </label>
                    <Field
                      as="select"
                      name="status"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </Field>
                    <div className="col-span-2 border-t border-slate-100 pt-4 mt-1">
                      <label
                        className={`flex items-center gap-3 cursor-pointer rounded-xl px-4 py-3 border transition-colors ${
                          values.assessmentMode === "exam" ? "border-rose-200 bg-rose-50" : "border-indigo-200 bg-indigo-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={values.assessmentMode === "exam"}
                          onChange={(e) => setFieldValue("assessmentMode", e.target.checked ? "exam" : "practice")}
                          className="accent-rose-600 w-4 h-4 shrink-0"
                        />
                        <span className="text-sm font-semibold flex items-center gap-1.5">
                          {values.assessmentMode === "exam" ? (
                            <>
                              <CalendarClock size={15} className="text-rose-600" />
                              <span className="text-rose-700">Scheduled as Exam</span>
                            </>
                          ) : (
                            <>
                              <Repeat size={15} className="text-indigo-600" />
                              <span className="text-indigo-700">Available as Practice</span>
                            </>
                          )}
                        </span>
                      </label>

                      {values.assessmentMode === "exam" ? (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                              Scheduled Start
                            </label>
                            <Field
                              name="scheduledStart"
                              type="datetime-local"
                              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                              Scheduled End
                            </label>
                            <Field
                              name="scheduledEnd"
                              type="datetime-local"
                              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 mt-4 items-end">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                              Allowed Attempts
                            </label>
                            <Field
                              name="allowedAttempts"
                              type="number"
                              placeholder="Unlimited"
                              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                          </div>
                          <label className="flex items-center gap-2.5 cursor-pointer bg-white rounded-lg px-3.5 py-3 border border-slate-200">
                            <Field type="checkbox" name="hasTimer" className="accent-indigo-600 w-4 h-4" />
                            <span className="text-sm font-medium text-slate-700">Enable timer</span>
                          </label>
                        </div>
                      )}
                      <label className="flex items-center gap-2.5 cursor-pointer col-span-2 bg-slate-50 rounded-lg px-3.5 py-3 border border-slate-100 mt-3">
                        <Field type="checkbox" name="randomizeQuestions" className="accent-indigo-600 w-4 h-4" />
                        <span className="text-sm font-medium text-slate-700">Randomize question order for each attempt</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Questions builder */}
                <div className="pt-2 border-t border-slate-100">
                  <h3 className="font-[family-name:var(--font-display)] font-semibold text-slate-800 mb-3">
                    Questions
                  </h3>

                  <FieldArray name="questions">
                    {({ push, remove }) => (
                      <div className="space-y-4">
                        {values.questions.map((question, qIndex) => (
                          <div
                            key={qIndex}
                            className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 relative"
                          >
                            <div className="flex items-start gap-2 mb-3">
                              <GripVertical size={16} className="text-slate-300 mt-2.5" />
                              <span className="text-xs font-bold text-indigo-500 bg-indigo-50 rounded-md px-2 py-1 mt-1.5">
                                Q{qIndex + 1}
                              </span>
                              <div className="flex-1">
                                <Field
                                  name={`questions.${qIndex}.questionText`}
                                  placeholder="Type your question..."
                                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                                />
                                <ErrorMessage
                                  name={`questions.${qIndex}.questionText`}
                                  component="div"
                                  className="text-red-500 text-xs mt-1"
                                />
                              </div>
                              {values.questions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => remove(qIndex)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3 pl-7">
                              <div>
                                <label className="block text-[11px] font-medium text-slate-500 mb-1">Type</label>
                                <Field
                                  as="select"
                                  name={`questions.${qIndex}.type`}
                                  className="w-full border border-slate-200 rounded-md px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                >
                                  <option value="mcq">Single Choice (MCQ)</option>
                                  <option value="multi_select">Multiple Select</option>
                                  <option value="true_false">True / False</option>
                                </Field>
                              </div>
                              <div>
                                <label className="block text-[11px] font-medium text-slate-500 mb-1">Marks</label>
                                <Field
                                  type="number"
                                  name={`questions.${qIndex}.marks`}
                                  className="w-full border border-slate-200 rounded-md px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                />
                              </div>
                            </div>

                            {/* Options */}
                            <div className="pl-7">
                              <QuestionOptions qIndex={qIndex} questionType={question.type} />
                            </div>

                            <div className="pl-7 mt-3">
                              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                Explanation (shown after submission)
                              </label>
                              <Field
                                as="textarea"
                                name={`questions.${qIndex}.explanation`}
                                rows={2}
                                placeholder="Why is this the correct answer?"
                                className="w-full border border-slate-200 rounded-md px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => push(emptyQuestion(values.questions.length + 1))}
                          className="flex items-center gap-2 text-indigo-600 font-medium text-sm hover:text-indigo-700 px-1"
                        >
                          <Plus size={16} />
                          Add Question
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 px-6 py-4 flex justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg text-slate-600 font-medium text-sm hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-300 transition-all disabled:opacity-50"
                >
                  {editingQuiz ? "Save Changes" : "Create Quiz"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

// Sub-component: renders options differently based on question type
function QuestionOptions({ qIndex, questionType }: { qIndex: number; questionType: QuestionType }) {
  if (questionType === "true_false") {
    return (
      <TrueFalseOptions qIndex={qIndex} />
    );
  }

  return <ChoiceOptions qIndex={qIndex} multi={questionType === "multi_select"} />;
}

function TrueFalseOptions({ qIndex }: { qIndex: number }) {
  return (
    <FieldArray name={`questions.${qIndex}.options`}>
      {({ form }) => {
        const options = form.values.questions[qIndex].options;
        // Ensure exactly True/False options exist
        if (options.length !== 2 || options[0]?.optionText !== "True") {
          form.setFieldValue(`questions.${qIndex}.options`, [
            { optionText: "True", isCorrect: options[0]?.isCorrect || false },
            { optionText: "False", isCorrect: options[1]?.isCorrect || false },
          ]);
        }
        return (
          <div className="flex gap-3">
            {["True", "False"].map((label, oIndex) => (
              <label
                key={label}
                className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white cursor-pointer flex-1 text-sm"
              >
                <input
                  type="radio"
                  name={`tf-${qIndex}`}
                  checked={options[oIndex]?.isCorrect || false}
                  onChange={() => {
                    form.setFieldValue(`questions.${qIndex}.options.0.isCorrect`, label === "True");
                    form.setFieldValue(`questions.${qIndex}.options.1.isCorrect`, label === "False");
                  }}
                  className="accent-indigo-600"
                />
                {label}
              </label>
            ))}
          </div>
        );
      }}
    </FieldArray>
  );
}

function ChoiceOptions({ qIndex, multi }: { qIndex: number; multi: boolean }) {
  return (
    <FieldArray name={`questions.${qIndex}.options`}>
      {({ form, push, remove }) => {
        const options = form.values.questions[qIndex].options;
        return (
          <div className="space-y-2">
            {options.map((opt: any, oIndex: number) => (
              <div key={oIndex} className="flex items-center gap-2">
                <input
                  type={multi ? "checkbox" : "radio"}
                  name={`correct-${qIndex}`}
                  checked={opt.isCorrect}
                  onChange={() => {
                    if (multi) {
                      form.setFieldValue(
                        `questions.${qIndex}.options.${oIndex}.isCorrect`,
                        !opt.isCorrect
                      );
                    } else {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const updated = options.map((o: any, i: number) => ({
                        ...o,
                        isCorrect: i === oIndex,
                      }));
                      form.setFieldValue(`questions.${qIndex}.options`, updated);
                    }
                  }}
                  className="accent-indigo-600 shrink-0"
                />
                <Field
                  name={`questions.${qIndex}.options.${oIndex}.optionText`}
                  placeholder={`Option ${oIndex + 1}`}
                  className="flex-1 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                {opt.isCorrect && <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />}
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => remove(oIndex)}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => push({ optionText: "", isCorrect: false })}
              className="text-xs text-indigo-600 font-medium flex items-center gap-1 mt-1"
            >
              <Plus size={13} />
              Add Option
            </button>
          </div>
        );
      }}
    </FieldArray>
  );
}