// Compares selected option IDs against correct option IDs for a question.
// Works for mcq, multi_select, and true_false since all are option-based.
export const gradeResponse = (
  correctOptionIds: string[],
  selectedOptionIds: string[]
): boolean => {
  if (correctOptionIds.length !== selectedOptionIds.length) return false;

  const correctSet = new Set(correctOptionIds);
  const selectedSet = new Set(selectedOptionIds);

  if (correctSet.size !== selectedSet.size) return false;

  for (const id of correctSet) {
    if (!selectedSet.has(id)) return false;
  }

  return true;
};