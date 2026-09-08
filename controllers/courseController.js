const Course = require('../models/Course');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Score = require('../models/Score');
const { calculateFinalScore, calculateAverage } = require('../utils/calculations');

const getCourses = async (req, res) => {
  try {
    const { classId } = req.query;
    
    let query = { isActive: true };
    
    if (classId) {
      query.classId = classId;
    }
    
    const courses = await Course.find(query)
      .populate('classId', 'className')
      .sort({ courseName: 1 });
    
    res.json(courses);
    
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('classId', 'className');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const students = await Student.find({ 
      classId: course.classId._id, 
      isActive: true 
    }).sort({ fullName: 1 });
    
    const scores = await Score.find({ courseId: course._id });
    
    res.json({
      ...course.toObject(),
      students,
      scores
    });
    
  } catch (error) {
    console.error('Get course by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { 
      courseCode, 
      courseName, 
      classId, 
      examType, 
      weights 
    } = req.body;
    
    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    const course = new Course({
      courseCode,
      courseName,
      classId,
      examType: examType || 'assignment_cat_exam',
      weights: weights || { assignment: 10, cat: 20, exam: 70 }
    });
    
    await course.save();
    
    res.status(201).json(course);
    
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { courseCode, courseName, classId, examType, weights } = req.body;
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    course.courseCode = courseCode || course.courseCode;
    course.courseName = courseName || course.courseName;
    course.classId = classId || course.classId;
    course.examType = examType || course.examType;
    course.weights = weights || course.weights;
    
    await course.save();
    
    res.json(course);
    
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    course.isActive = false;
    await course.save();
    
    await Score.deleteMany({ courseId: course._id });
    
    res.json({ message: 'Course deleted successfully' });
    
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addAssessment = async (req, res) => {
  try {
    const { type, number, title, maxScore } = req.body;
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (!['assignment', 'cat', 'exam'].includes(type)) {
      return res.status(400).json({ message: 'Invalid assessment type' });
    }
    
    course.assessments.push({
      type,
      number: number || 1,
      title: title || `${type.toUpperCase()} ${number || 1}`,
      maxScore: maxScore || 100
    });
    
    await course.save();
    
    res.status(201).json(course);
    
  } catch (error) {
    console.error('Add assessment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteAssessment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const assessmentIndex = parseInt(req.params.assessmentIndex);
    
    if (isNaN(assessmentIndex) || assessmentIndex < 0 || assessmentIndex >= course.assessments.length) {
      return res.status(400).json({ message: 'Invalid assessment index' });
    }
    
    course.assessments.splice(assessmentIndex, 1);
    await course.save();
    
    await Score.deleteMany({ 
      courseId: course._id, 
      assessmentIndex: assessmentIndex 
    });
    
    const remainingScores = await Score.find({ 
      courseId: course._id,
      assessmentIndex: { $gt: assessmentIndex }
    });
    
    for (const score of remainingScores) {
      score.assessmentIndex -= 1;
      await score.save();
    }
    
    res.json(course);
    
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addManualStudent = async (req, res) => {
  try {
    const { studentName, admissionNumber } = req.body;
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (!studentName) {
      return res.status(400).json({ message: 'Student name is required' });
    }
    
    course.manualStudents.push({
      studentName,
      admissionNumber,
      scores: []
    });
    
    await course.save();
    
    res.status(201).json(course);
    
  } catch (error) {
    console.error('Add manual student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteManualStudent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const studentIndex = parseInt(req.params.studentIndex);
    
    if (isNaN(studentIndex) || studentIndex < 0 || studentIndex >= course.manualStudents.length) {
      return res.status(400).json({ message: 'Invalid student index' });
    }
    
    course.manualStudents.splice(studentIndex, 1);
    await course.save();
    
    res.json(course);
    
  } catch (error) {
    console.error('Delete manual student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCourseSummary = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
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
            assignmentScores.push(score.score);
          } else if (assessment.type === 'cat') {
            catScores.push(score.score);
          } else if (assessment.type === 'exam') {
            examScores.push(score.score);
          }
        }
      });
      
      const assignmentAvg = calculateAverage(assignmentScores);
      const catAvg = calculateAverage(catScores);
      const examAvg = calculateAverage(examScores);
      
      const finalScore = calculateFinalScore(
        assignmentAvg, 
        catAvg, 
        examAvg, 
        course.weights, 
        course.examType
      );
      
      studentSummaries.push({
        student,
        assignmentAvg,
        catAvg,
        examAvg,
        finalScore,
        scores: studentScores
      });
    }
    
    res.json({
      course,
      studentSummaries
    });
    
  } catch (error) {
    console.error('Get course summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addAssessment,
  deleteAssessment,
  addManualStudent,
  deleteManualStudent,
  getCourseSummary
};