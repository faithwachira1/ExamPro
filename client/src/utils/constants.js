export const EXAM_TYPES = [
  { value: 'assignment_cat_exam', label: 'Assignment + CAT + Exam' },
  { value: 'cat_exam', label: 'CAT + Exam' },
  { value: 'exam_only', label: 'Exam Only' },
  { value: 'custom', label: 'Custom' },
];

export const formatExamType = (examType) => {
  const types = {
    'assignment_cat_exam': 'Assignment + CAT + Exam',
    'cat_exam': 'CAT + Exam',
    'exam_only': 'Exam Only',
    'custom': 'Custom',
  };
  return types[examType] || examType;
};

export const DEFAULT_WEIGHTS = {
  assignment_cat_exam: { assignment: 10, cat: 20, exam: 70 },
  cat_exam: { assignment: 0, cat: 30, exam: 70 },
  exam_only: { assignment: 0, cat: 0, exam: 100 },
  custom: { assignment: 0, cat: 0, exam: 0 },
};

export const ASSESSMENT_TYPES = [
  { value: 'assignment', label: 'Assignment', color: 'bg-blue-100 text-blue-800' },
  { value: 'cat', label: 'CAT', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'exam', label: 'Exam', color: 'bg-green-100 text-green-800' },
];

export const PASS_MARK = 40;

export const GRADE_BOUNDARIES = [
  { grade: 'A', min: 70, max: 100 },
  { grade: 'B', min: 60, max: 69.99 },
  { grade: 'C', min: 50, max: 59.99 },
  { grade: 'D', min: 40, max: 49.99 },
  { grade: 'F', min: 0, max: 39.99 },
];

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 10,
};

export const HIDDEN_ADMIN_SHORTCUT = {
  ctrlKey: true,
  shiftKey: true,
  key: 'A',
};

export const ADMIN_HASH = import.meta.env.VITE_ADMIN_HASH || '';