const Course = require('../models/Course');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Score = require('../models/Score');

const calcPctAvg = (scoresArray) => {
  if (scoresArray.length === 0) return 0;
  const pcts = scoresArray.map(s => (s.raw / s.max) * 100);
  return pcts.reduce((a, b) => a + b, 0) / pcts.length;
};

const calcFinal = (assignmentAvg, catAvg, examAvg, course) => {
  let finalScore = 0;
  
  switch (course.examType) {
    case 'assignment_cat_exam':
      finalScore = (assignmentAvg * course.weights.assignment / 100) +
                   (catAvg * course.weights.cat / 100) +
                   (examAvg * course.weights.exam / 100);
      break;
    case 'cat_exam':
      finalScore = (catAvg * course.weights.cat / 100) +
                   (examAvg * course.weights.exam / 100);
      break;
    case 'exam_only':
      finalScore = examAvg;
      break;
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

const getClassReport = async (req, res) => {
  try {
    const { classId } = req.params;
    
    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    const students = await Student.find({ classId, isActive: true }).sort({ fullName: 1 });
    const courses = await Course.find({ classId, isActive: true });
    
    const report = [];
    
    for (const student of students) {
      const studentReport = {
        student,
        courses: []
      };
      
      for (const course of courses) {
        const scores = await Score.find({ 
          studentId: student._id, 
          courseId: course._id 
        });
        
        let assignmentScores = [];
        let catScores = [];
        let examScores = [];
        
        course.assessments.forEach((assessment, index) => {
          const score = scores.find(s => s.assessmentIndex === index);
          if (score) {
            if (assessment.type === 'assignment') {
              assignmentScores.push({ raw: score.score, max: assessment.maxScore });
            } else if (assessment.type === 'cat') {
              catScores.push({ raw: score.score, max: assessment.maxScore });
            } else if (assessment.type === 'exam') {
              examScores.push({ raw: score.score, max: assessment.maxScore });
            }
          }
        });
        
        const assignmentAvg = calcPctAvg(assignmentScores);
        const catAvg = calcPctAvg(catScores);
        const examAvg = calcPctAvg(examScores);
        
        const finalScore = calcFinal(assignmentAvg, catAvg, examAvg, course);
        const grade = getGrade(finalScore);
        
        studentReport.courses.push({
          course,
          assignmentAvg: Math.round(assignmentAvg * 10) / 10,
          catAvg: Math.round(catAvg * 10) / 10,
          examAvg: Math.round(examAvg * 10) / 10,
          finalScore,
          grade
        });
      }
      
      report.push(studentReport);
    }
    
    res.json({
      class: cls,
      report
    });
    
  } catch (error) {
    console.error('Get class report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await Student.findById(studentId)
      .populate('classId', 'className');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const courses = await Course.find({ 
      classId: student.classId._id, 
      isActive: true 
    });
    
    const courseReports = [];
    
    for (const course of courses) {
      const scores = await Score.find({ 
        studentId: student._id, 
        courseId: course._id 
      });
      
      let assignmentScores = [];
      let catScores = [];
      let examScores = [];
      
      course.assessments.forEach((assessment, index) => {
        const score = scores.find(s => s.assessmentIndex === index);
        if (score) {
          if (assessment.type === 'assignment') {
            assignmentScores.push({ raw: score.score, max: assessment.maxScore });
          } else if (assessment.type === 'cat') {
            catScores.push({ raw: score.score, max: assessment.maxScore });
          } else if (assessment.type === 'exam') {
            examScores.push({ raw: score.score, max: assessment.maxScore });
          }
        }
      });
      
      const assignmentAvg = calcPctAvg(assignmentScores);
      const catAvg = calcPctAvg(catScores);
      const examAvg = calcPctAvg(examScores);
      
      const finalScore = calcFinal(assignmentAvg, catAvg, examAvg, course);
      const grade = getGrade(finalScore);
      
      courseReports.push({
        course,
        assignmentAvg: Math.round(assignmentAvg * 10) / 10,
        catAvg: Math.round(catAvg * 10) / 10,
        examAvg: Math.round(examAvg * 10) / 10,
        finalScore,
        grade,
        scores
      });
    }
    
    res.json({
      student,
      courseReports
    });
    
  } catch (error) {
    console.error('Get student report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCourseReport = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId)
      .populate('classId', 'className');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const students = await Student.find({ 
      classId: course.classId._id, 
      isActive: true 
    }).sort({ fullName: 1 });
    
    const scores = await Score.find({ courseId: course._id });
    
    const studentSummaries = [];
    
    for (const student of students) {
      const studentScores = scores.filter(s => 
        s.studentId.toString() === student._id.toString()
      );
      
      let assignmentScores = [];
      let catScores = [];
      let examScores = [];
      
      course.assessments.forEach((assessment, index) => {
        const score = studentScores.find(s => s.assessmentIndex === index);
        if (score) {
          if (assessment.type === 'assignment') {
            assignmentScores.push({ raw: score.score, max: assessment.maxScore });
          } else if (assessment.type === 'cat') {
            catScores.push({ raw: score.score, max: assessment.maxScore });
          } else if (assessment.type === 'exam') {
            examScores.push({ raw: score.score, max: assessment.maxScore });
          }
        }
      });
      
      const assignmentAvg = calcPctAvg(assignmentScores);
      const catAvg = calcPctAvg(catScores);
      const examAvg = calcPctAvg(examScores);
      
      const finalScore = calcFinal(assignmentAvg, catAvg, examAvg, course);
      const grade = getGrade(finalScore);
      
      studentSummaries.push({
        student,
        assignmentAvg: Math.round(assignmentAvg * 10) / 10,
        catAvg: Math.round(catAvg * 10) / 10,
        examAvg: Math.round(examAvg * 10) / 10,
        finalScore,
        grade,
        scores: studentScores
      });
    }
    
    const allFinalScores = studentSummaries.map(s => s.finalScore);
    
    const summary = {
      totalStudents: students.length,
      classAverage: allFinalScores.length > 0 ? Math.round(allFinalScores.reduce((a, b) => a + b, 0) / allFinalScores.length) : 0,
      passRate: allFinalScores.length > 0 ? Math.round((allFinalScores.filter(s => s >= 40).length / allFinalScores.length) * 100) : 0,
      highestScore: allFinalScores.length > 0 ? Math.max(...allFinalScores) : 0,
      lowestScore: allFinalScores.length > 0 ? Math.min(...allFinalScores) : 0
    };
    
    res.json({
      course,
      summary,
      studentSummaries
    });
    
  } catch (error) {
    console.error('Get course report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getClassReport,
  getStudentReport,
  getCourseReport
};