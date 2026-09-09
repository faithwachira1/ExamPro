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

export const GRADING_SYSTEMS = [
  { value: 'af', label: 'A-F Grading' },
  { value: 'cbc', label: 'CBC Based' },
  { value: 'custom', label: 'Custom' },
];

export const DEFAULT_AF_GRADES = [
  { name: 'A', minScore: 70, maxScore: 100, remark: 'Excellent' },
  { name: 'B', minScore: 60, maxScore: 69.99, remark: 'Good' },
  { name: 'C', minScore: 50, maxScore: 59.99, remark: 'Average' },
  { name: 'D', minScore: 40, maxScore: 49.99, remark: 'Below Average' },
  { name: 'F', minScore: 0, maxScore: 39.99, remark: 'Fail' },
];

export const DEFAULT_CBC_GRADES = [
  { name: 'Exceeding Expectation', minScore: 80, maxScore: 100, remark: 'EE' },
  { name: 'Meeting Expectation', minScore: 60, maxScore: 79.99, remark: 'ME' },
  { name: 'Approaching Expectation', minScore: 40, maxScore: 59.99, remark: 'AE' },
  { name: 'Below Expectation', minScore: 0, maxScore: 39.99, remark: 'BE' },
];

export const PASS_MARK = 40;

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 10,
};

export const HIDDEN_ADMIN_SHORTCUT = {
  ctrlKey: true,
  shiftKey: true,
  key: 'A',
};