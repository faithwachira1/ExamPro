import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import * as courseApi from '../api/courseApi';
import * as scoreApi from '../api/scoreApi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import { formatScore } from '../utils/formatters';
import { ASSESSMENT_TYPES, formatExamType } from '../utils/constants';
import toast from 'react-hot-toast';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { fetchCourseById, currentCourse, loading } = useData();
  const [scores, setScores] = useState({});
  const [showAddAssessment, setShowAddAssessment] = useState(false);
  const [showAddManualStudent, setShowAddManualStudent] = useState(false);
  const [deleteAssessmentTarget, setDeleteAssessmentTarget] = useState(null);
  const [deleteManualStudentTarget, setDeleteManualStudentTarget] = useState(null);
  const [assessmentForm, setAssessmentForm] = useState({
    type: 'assignment',
    number: 1,
    title: '',
    maxScore: 100,
  });
  const [manualStudentForm, setManualStudentForm] = useState({
    studentName: '',
    admissionNumber: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      const courseData = await fetchCourseById(courseId);
      const scoreData = await scoreApi.getScoresByCourse(courseId);
      
      const scoreMap = {};
      scoreData.forEach((score) => {
        const studentId = typeof score.studentId === 'object' ? score.studentId._id : score.studentId;
        const key = `${studentId}_${score.assessmentIndex}`;
        scoreMap[key] = score.score;
      });
      setScores(scoreMap);
    } catch (error) {
      toast.error('Failed to load course data');
      navigate('/courses');
    }
  };

  const handleAddAssessment = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const title = assessmentForm.title || `${assessmentForm.type.toUpperCase()} ${assessmentForm.number}`;
      await courseApi.addAssessment(courseId, {
        ...assessmentForm,
        title,
      });
      toast.success(`${title} added successfully`);
      setShowAddAssessment(false);
      setAssessmentForm({ type: 'assignment', number: 1, title: '', maxScore: 100 });
      
      setScores({});
      
      await loadCourseData();
    } catch (error) {
      toast.error('Failed to add assessment');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssessment = async () => {
    if (deleteAssessmentTarget === null) return;

    try {
      await courseApi.deleteAssessment(courseId, deleteAssessmentTarget);
      
      setScores((prevScores) => {
        const newScores = {};
        Object.entries(prevScores).forEach(([key, value]) => {
          const [studentId, assessmentIndexStr] = key.split('_');
          const idx = parseInt(assessmentIndexStr);
          
          if (idx === deleteAssessmentTarget) {
            return;
          }
          
          if (idx > deleteAssessmentTarget) {
            newScores[`${studentId}_${idx - 1}`] = value;
          } else {
            newScores[key] = value;
          }
        });
        return newScores;
      });
      
      toast.success('Assessment deleted successfully');
      setDeleteAssessmentTarget(null);
      await loadCourseData();
    } catch (error) {
      toast.error('Failed to delete assessment');
    }
  };

  const handleAddManualStudent = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await courseApi.addManualStudent(courseId, manualStudentForm);
      toast.success('Manual student added successfully');
      setShowAddManualStudent(false);
      setManualStudentForm({ studentName: '', admissionNumber: '' });
      await loadCourseData();
    } catch (error) {
      toast.error('Failed to add manual student');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteManualStudent = async () => {
    if (deleteManualStudentTarget === null) return;

    try {
      await courseApi.deleteManualStudent(courseId, deleteManualStudentTarget);
      toast.success('Manual student deleted successfully');
      setDeleteManualStudentTarget(null);
      await loadCourseData();
    } catch (error) {
      toast.error('Failed to delete manual student');
    }
  };

  const handleScoreChange = (studentId, assessmentIndex, value) => {
    const key = `${studentId}_${assessmentIndex}`;
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveScores = async () => {
    setSaving(true);

    try {
      const scoreEntries = [];
      
      Object.entries(scores).forEach(([key, value]) => {
        const [studentId, assessmentIndex] = key.split('_');
        if (value !== '' && value !== null && value !== undefined && !isNaN(value)) {
          scoreEntries.push({
            studentId,
            assessmentIndex: parseInt(assessmentIndex),
            score: Number(value),
          });
        }
      });

      if (scoreEntries.length === 0) {
        toast.error('No scores to save');
        setSaving(false);
        return;
      }

      const result = await scoreApi.createBulkScores({
        courseId,
        scores: scoreEntries,
      });

      toast.success(`${result.totalSaved} scores saved successfully`);
      if (result.totalErrors > 0) {
        toast.error(`${result.totalErrors} scores failed to save`);
      }
      await loadCourseData();
    } catch (error) {
      toast.error('Failed to save scores');
    } finally {
      setSaving(false);
    }
  };

  const assessmentsWithIndex = currentCourse?.assessments?.map((assessment, index) => ({
    ...assessment,
    originalIndex: index,
  })) || [];

  const assignmentAssessments = assessmentsWithIndex.filter(a => a.type === 'assignment');
  const catAssessments = assessmentsWithIndex.filter(a => a.type === 'cat');
  const examAssessments = assessmentsWithIndex.filter(a => a.type === 'exam');

  const hasAssignments = assignmentAssessments.length > 0;
  const hasCats = catAssessments.length > 0;
  const hasExams = examAssessments.length > 0;

  const showAssignmentAvg = assignmentAssessments.length > 1;
  const showCatAvg = catAssessments.length > 1;
  const showExamAvg = examAssessments.length > 1;

  const getStudentScore = (studentId, assessmentIndex) => {
    const key = `${studentId}_${assessmentIndex}`;
    return scores[key] || '';
  };

  const getRawAverage = (studentId, assessmentType) => {
    const typeAssessments = assessmentsWithIndex
      .filter((assessment) => assessment.type === assessmentType);
    
    if (typeAssessments.length === 0) return '';
    
    const validScores = typeAssessments
      .map((assessment) => {
        const rawScore = getStudentScore(studentId, assessment.originalIndex);
        if (rawScore === '' || isNaN(rawScore)) return null;
        return Number(rawScore);
      })
      .filter((score) => score !== null);
    
    if (validScores.length === 0) return '';
    
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    return sum / validScores.length;
  };

  const getPercentageAverage = (studentId, assessmentType) => {
    const typeAssessments = assessmentsWithIndex
      .filter((assessment) => assessment.type === assessmentType);
    
    if (typeAssessments.length === 0) return '';
    
    const validPercentages = typeAssessments
      .map((assessment) => {
        const rawScore = getStudentScore(studentId, assessment.originalIndex);
        if (rawScore === '' || isNaN(rawScore)) return null;
        
        const maxScore = assessment.maxScore || 100;
        return (Number(rawScore) / maxScore) * 100;
      })
      .filter((score) => score !== null);
    
    if (validPercentages.length === 0) return '';
    
    const sum = validPercentages.reduce((acc, score) => acc + score, 0);
    return sum / validPercentages.length;
  };

  const calculateFinalForStudent = (studentId) => {
    const assignmentPct = getPercentageAverage(studentId, 'assignment');
    const catPct = getPercentageAverage(studentId, 'cat');
    const examPct = getPercentageAverage(studentId, 'exam');
    
    const assignmentScore = assignmentPct === '' ? 0 : assignmentPct;
    const catScore = catPct === '' ? 0 : catPct;
    const examScore = examPct === '' ? 0 : examPct;
    
    let finalScore = 0;
    
    switch (currentCourse?.examType) {
      case 'assignment_cat_exam':
        finalScore = (assignmentScore * currentCourse.weights.assignment / 100) +
                     (catScore * currentCourse.weights.cat / 100) +
                     (examScore * currentCourse.weights.exam / 100);
        break;
      case 'cat_exam':
        finalScore = (catScore * currentCourse.weights.cat / 100) +
                     (examScore * currentCourse.weights.exam / 100);
        break;
      case 'exam_only':
        finalScore = examScore;
        break;
      default:
        finalScore = 0;
    }
    
    return Math.round(finalScore);
  };

  const getGrade = (score) => {
    if (score >= 70) return 'A';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A': 'text-green-600',
      'B': 'text-blue-600',
      'C': 'text-yellow-600',
      'D': 'text-orange-600',
      'F': 'text-red-600',
    };
    return colors[grade] || 'text-gray-600';
  };

  if (loading && !currentCourse) {
    return <Spinner size="lg" className="py-20" />;
  }

  if (!currentCourse) {
    return null;
  }

  const finalScores = currentCourse.students?.map((student) => calculateFinalForStudent(student._id)) || [];

  const summary = {
    classAverage: finalScores.length > 0 ? Math.round(finalScores.reduce((a, b) => a + b, 0) / finalScores.length) : 0,
    passRate: finalScores.length > 0 ? Math.round((finalScores.filter(s => s >= 40).length / finalScores.length) * 100) : 0,
    highest: finalScores.length > 0 ? Math.max(...finalScores) : 0,
    lowest: finalScores.length > 0 ? Math.min(...finalScores) : 0,
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate('/courses')}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 flex items-center"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Courses
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{currentCourse.courseName}</h1>
          <p className="text-gray-600 mt-1">{currentCourse.courseCode}</p>
          <Badge variant="primary" className="mt-2">{formatExamType(currentCourse.examType)}</Badge>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => setShowAddManualStudent(true)}>
            Add Manual Student
          </Button>
          <Button onClick={() => setShowAddAssessment(true)}>
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Assessment
          </Button>
        </div>
      </div>

      {currentCourse.assessments?.length === 0 && (
        <div className="mb-6">
          <Alert
            type="info"
            title="No assessments yet"
            message="Click 'Add Assessment' to add your first Assignment, CAT, or Exam."
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <p className="text-sm text-gray-500">Class Average</p>
          <p className="text-2xl font-bold text-gray-900">{summary.classAverage}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Pass Rate</p>
          <p className="text-2xl font-bold text-gray-900">{summary.passRate}%</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Highest Score</p>
          <p className="text-2xl font-bold text-gray-900">{summary.highest}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Lowest Score</p>
          <p className="text-2xl font-bold text-gray-900">{summary.lowest}</p>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                
                {hasAssignments && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50" colSpan={showAssignmentAvg ? assignmentAssessments.length + 1 : assignmentAssessments.length}>
                    Assignments
                  </th>
                )}
                
                {hasCats && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-50" colSpan={showCatAvg ? catAssessments.length + 1 : catAssessments.length}>
                    CATs
                  </th>
                )}
                
                {hasExams && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50" colSpan={showExamAvg ? examAssessments.length + 1 : examAssessments.length}>
                    Exams
                  </th>
                )}
                
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Final Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
              </tr>
              <tr>
                <th className="px-4 py-3"></th>
                
                {assignmentAssessments.map((assessment) => (
                  <th key={`a-${assessment.originalIndex}`} className="px-2 py-2 text-left text-xs font-medium text-gray-400">
                    <div className="flex items-center space-x-1">
                      <span>{assessment.title || `A${assessment.number}`}</span>
                      <span className="text-gray-300">/{assessment.maxScore}</span>
                      <button 
                        onClick={() => setDeleteAssessmentTarget(assessment.originalIndex)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </th>
                ))}
                {showAssignmentAvg && (
                  <th className="px-2 py-2 text-left text-xs font-bold text-blue-600 uppercase">Avg</th>
                )}
                
                {catAssessments.map((assessment) => (
                  <th key={`c-${assessment.originalIndex}`} className="px-2 py-2 text-left text-xs font-medium text-gray-400">
                    <div className="flex items-center space-x-1">
                      <span>{assessment.title || `CAT ${assessment.number}`}</span>
                      <span className="text-gray-300">/{assessment.maxScore}</span>
                      <button 
                        onClick={() => setDeleteAssessmentTarget(assessment.originalIndex)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </th>
                ))}
                {showCatAvg && (
                  <th className="px-2 py-2 text-left text-xs font-bold text-yellow-600 uppercase">Avg</th>
                )}
                
                {examAssessments.map((assessment) => (
                  <th key={`e-${assessment.originalIndex}`} className="px-2 py-2 text-left text-xs font-medium text-gray-400">
                    <div className="flex items-center space-x-1">
                      <span>{assessment.title || `Exam ${assessment.number}`}</span>
                      <span className="text-gray-300">/{assessment.maxScore}</span>
                      <button 
                        onClick={() => setDeleteAssessmentTarget(assessment.originalIndex)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </th>
                ))}
                {showExamAvg && (
                  <th className="px-2 py-2 text-left text-xs font-bold text-green-600 uppercase">Avg</th>
                )}
                
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentCourse.students?.map((student) => {
                const finalScore = calculateFinalForStudent(student._id);
                const grade = getGrade(finalScore);
                
                return (
                  <tr key={student._id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-medium text-gray-900">{student.fullName}</p>
                      <p className="text-xs text-gray-500">{student.admissionNumber || ''}</p>
                    </td>
                    
                    {assignmentAssessments.map((assessment) => (
                      <td key={`a-${assessment.originalIndex}`} className="px-2 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max={assessment.maxScore}
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={getStudentScore(student._id, assessment.originalIndex)}
                          onChange={(e) => handleScoreChange(student._id, assessment.originalIndex, e.target.value)}
                        />
                      </td>
                    ))}
                    {showAssignmentAvg && (
                      <td className="px-2 py-3 whitespace-nowrap bg-blue-50">
                        <span className="font-bold text-blue-700">{formatScore(getRawAverage(student._id, 'assignment'))}</span>
                      </td>
                    )}
                    
                    {catAssessments.map((assessment) => (
                      <td key={`c-${assessment.originalIndex}`} className="px-2 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max={assessment.maxScore}
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={getStudentScore(student._id, assessment.originalIndex)}
                          onChange={(e) => handleScoreChange(student._id, assessment.originalIndex, e.target.value)}
                        />
                      </td>
                    ))}
                    {showCatAvg && (
                      <td className="px-2 py-3 whitespace-nowrap bg-yellow-50">
                        <span className="font-bold text-yellow-700">{formatScore(getRawAverage(student._id, 'cat'))}</span>
                      </td>
                    )}
                    
                    {examAssessments.map((assessment) => (
                      <td key={`e-${assessment.originalIndex}`} className="px-2 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max={assessment.maxScore}
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={getStudentScore(student._id, assessment.originalIndex)}
                          onChange={(e) => handleScoreChange(student._id, assessment.originalIndex, e.target.value)}
                        />
                      </td>
                    ))}
                    {showExamAvg && (
                      <td className="px-2 py-3 whitespace-nowrap bg-green-50">
                        <span className="font-bold text-green-700">{formatScore(getRawAverage(student._id, 'exam'))}</span>
                      </td>
                    )}
                    
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{finalScore}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`font-semibold ${getGradeColor(grade)}`}>{grade}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveScores} isLoading={saving} size="lg">
            Save All Scores
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={showAddAssessment}
        onClose={() => setShowAddAssessment(false)}
        title="Add Assessment (Assignment / CAT / Exam)"
      >
        <form onSubmit={handleAddAssessment} className="space-y-4">
          <Select
            label="Assessment Type"
            options={ASSESSMENT_TYPES}
            value={assessmentForm.type}
            onChange={(e) => setAssessmentForm({ ...assessmentForm, type: e.target.value })}
            required
          />
          <Input
            label="Number"
            type="number"
            min="1"
            placeholder="e.g., 1 for CAT 1, 2 for CAT 2"
            value={assessmentForm.number}
            onChange={(e) => setAssessmentForm({ ...assessmentForm, number: Number(e.target.value) })}
            required
          />
          <Input
            label="Title (optional)"
            placeholder="e.g., CAT 1, Assignment 2, Final Exam"
            value={assessmentForm.title}
            onChange={(e) => setAssessmentForm({ ...assessmentForm, title: e.target.value })}
          />
          <Input
            label="Max Score"
            type="number"
            min="1"
            placeholder="e.g., 10, 20, 70, 100"
            value={assessmentForm.maxScore}
            onChange={(e) => setAssessmentForm({ ...assessmentForm, maxScore: Number(e.target.value) })}
            required
          />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowAddAssessment(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Add Assessment
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showAddManualStudent}
        onClose={() => setShowAddManualStudent(false)}
        title="Add Manual Student"
      >
        <form onSubmit={handleAddManualStudent} className="space-y-4">
          <Input
            label="Student Name"
            placeholder="Enter student name"
            value={manualStudentForm.studentName}
            onChange={(e) => setManualStudentForm({ ...manualStudentForm, studentName: e.target.value })}
            required
          />
          <Input
            label="Admission Number"
            placeholder="Enter admission number"
            value={manualStudentForm.admissionNumber}
            onChange={(e) => setManualStudentForm({ ...manualStudentForm, admissionNumber: e.target.value })}
          />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowAddManualStudent(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Add
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteAssessmentTarget !== null}
        onClose={() => setDeleteAssessmentTarget(null)}
        onConfirm={handleDeleteAssessment}
        title="Delete Assessment"
        message="Are you sure you want to delete this assessment? All scores for this assessment will be removed."
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={deleteManualStudentTarget !== null}
        onClose={() => setDeleteManualStudentTarget(null)}
        onConfirm={handleDeleteManualStudent}
        title="Delete Manual Student"
        message="Are you sure you want to delete this manual student?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default CourseDetailPage;