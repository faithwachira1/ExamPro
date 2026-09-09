export const calculateAverage = (scores) => {
  if (!scores || scores.length === 0) return 0;
  
  const validScores = scores.filter(score => score !== null && score !== undefined && !isNaN(score));
  if (validScores.length === 0) return 0;
  
  const sum = validScores.reduce((acc, score) => acc + Number(score), 0);
  return sum / validScores.length;
};

export const calculateWeightedScore = (score, weight) => {
  if (!score || !weight) return 0;
  return (Number(score) * Number(weight)) / 100;
};

export const calculateFinalScore = (assignmentAvg, catAvg, examAvg, weights, examType) => {
  let finalScore = 0;
  
  switch (examType) {
    case 'assignment_cat_exam':
      finalScore = calculateWeightedScore(assignmentAvg, weights.assignment) +
                   calculateWeightedScore(catAvg, weights.cat) +
                   calculateWeightedScore(examAvg, weights.exam);
      break;
    case 'cat_exam':
      finalScore = calculateWeightedScore(catAvg, weights.cat) +
                   calculateWeightedScore(examAvg, weights.exam);
      break;
    case 'exam_only':
      finalScore = Number(examAvg) || 0;
      break;
    case 'custom':
      finalScore = Number(examAvg) || 0;
      break;
    default:
      finalScore = 0;
  }
  
  return Math.round(finalScore * 100) / 100;
};

export const calculateClassAverage = (finalScores) => {
  return calculateAverage(finalScores);
};

export const calculatePassRate = (finalScores, passMark = 40) => {
  if (!finalScores || finalScores.length === 0) return 0;
  
  const passed = finalScores.filter(score => score >= passMark).length;
  return Math.round((passed / finalScores.length) * 100);
};

export const groupScoresByType = (course, scores) => {
  const assignmentScores = [];
  const catScores = [];
  const examScores = [];
  
  course.assessments.forEach((assessment, index) => {
    const score = scores.find(s => s.assessmentIndex === index);
    if (score) {
      if (assessment.type === 'assignment') {
        assignmentScores.push(score.score);
      } else if (assessment.type === 'cat') {
        catScores.push(score.score);
      } else if (assessment.type === 'exam') {
        examScores.push(score.score);
      }
    }
  });
  
  return { assignmentScores, catScores, examScores };
};

export const calculateStudentFinalScore = (course, studentScores) => {
  const { assignmentScores, catScores, examScores } = groupScoresByType(course, studentScores);
  
  const assignmentAvg = calculateAverage(assignmentScores);
  const catAvg = calculateAverage(catScores);
  const examAvg = calculateAverage(examScores);
  
  const finalScore = calculateFinalScore(assignmentAvg, catAvg, examAvg, course.weights, course.examType);
  
  return {
    assignmentAvg,
    catAvg,
    examAvg,
    finalScore,
  };
};

export const getGradeFromSettings = (score, settings) => {
  if (!settings?.grades || settings.grades.length === 0) {
    if (score >= 70) return 'A';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  }
  
  for (const grade of settings.grades) {
    if (score >= grade.minScore && score <= grade.maxScore) {
      return grade.name;
    }
  }
  
  return 'F';
};

export const getGradeColorFromSettings = (grade, settings) => {
  const defaultColors = {
    'A': 'text-green-600',
    'B': 'text-blue-600',
    'C': 'text-yellow-600',
    'D': 'text-orange-600',
    'F': 'text-red-600',
  };
  
  if (defaultColors[grade]) {
    return defaultColors[grade];
  }
  
  if (settings?.grades) {
    const foundGrade = settings.grades.find(g => g.name === grade);
    if (foundGrade) {
      const minScore = foundGrade.minScore;
      if (minScore >= 80) return 'text-green-600';
      if (minScore >= 60) return 'text-blue-600';
      if (minScore >= 40) return 'text-yellow-600';
      return 'text-red-600';
    }
  }
  
  return 'text-gray-600';
};

export const getGradeRemark = (score, settings) => {
  if (!settings?.grades || settings.grades.length === 0) {
    return '';
  }
  
  for (const grade of settings.grades) {
    if (score >= grade.minScore && score <= grade.maxScore) {
      return grade.remark || '';
    }
  }
  
  return '';
};