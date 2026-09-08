const Score = require('../models/Score');
const Course = require('../models/Course');
const Student = require('../models/Student');

const getScoresByCourse = async (req, res) => {
  try {
    const scores = await Score.find({ courseId: req.params.courseId })
      .populate('studentId', 'fullName admissionNumber')
      .sort({ assessmentIndex: 1 });
    
    res.json(scores);
    
  } catch (error) {
    console.error('Get scores by course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getScoresByStudent = async (req, res) => {
  try {
    const scores = await Score.find({ studentId: req.params.studentId })
      .populate('courseId', 'courseCode courseName')
      .sort({ createdAt: -1 });
    
    res.json(scores);
    
  } catch (error) {
    console.error('Get scores by student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createScore = async (req, res) => {
  try {
    const { studentId, courseId, assessmentIndex, score } = req.body;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (assessmentIndex < 0 || assessmentIndex >= course.assessments.length) {
      return res.status(400).json({ message: 'Invalid assessment index' });
    }
    
    const maxScore = course.assessments[assessmentIndex].maxScore;
    if (score < 0 || score > maxScore) {
      return res.status(400).json({ message: `Score must be between 0 and ${maxScore}` });
    }
    
    let existingScore = await Score.findOne({ studentId, courseId, assessmentIndex });
    
    if (existingScore) {
      existingScore.score = score;
      await existingScore.save();
      return res.json(existingScore);
    }
    
    const newScore = new Score({
      studentId,
      courseId,
      assessmentIndex,
      score
    });
    
    await newScore.save();
    
    res.status(201).json(newScore);
    
  } catch (error) {
    console.error('Create score error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createBulkScores = async (req, res) => {
  try {
    const { courseId, scores } = req.body;
    
    if (!scores || !Array.isArray(scores) || scores.length === 0) {
      return res.status(400).json({ message: 'No scores provided' });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const results = [];
    const errors = [];
    
    for (const scoreData of scores) {
      try {
        const { studentId, assessmentIndex, score } = scoreData;
        
        if (assessmentIndex < 0 || assessmentIndex >= course.assessments.length) {
          errors.push({ studentId, message: 'Invalid assessment index' });
          continue;
        }
        
        const maxScore = course.assessments[assessmentIndex].maxScore;
        if (score < 0 || score > maxScore) {
          errors.push({ studentId, message: `Score must be between 0 and ${maxScore}` });
          continue;
        }
        
        let existingScore = await Score.findOne({ studentId, courseId, assessmentIndex });
        
        if (existingScore) {
          existingScore.score = score;
          await existingScore.save();
          results.push(existingScore);
        } else {
          const newScore = new Score({
            studentId,
            courseId,
            assessmentIndex,
            score
          });
          await newScore.save();
          results.push(newScore);
        }
        
      } catch (error) {
        errors.push({ scoreData, message: error.message });
      }
    }
    
    res.status(201).json({
      saved: results,
      errors,
      totalSaved: results.length,
      totalErrors: errors.length
    });
    
  } catch (error) {
    console.error('Bulk create scores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateScore = async (req, res) => {
  try {
    const { score } = req.body;
    
    const existingScore = await Score.findById(req.params.id);
    
    if (!existingScore) {
      return res.status(404).json({ message: 'Score not found' });
    }
    
    const course = await Course.findById(existingScore.courseId);
    const maxScore = course.assessments[existingScore.assessmentIndex].maxScore;
    
    if (score < 0 || score > maxScore) {
      return res.status(400).json({ message: `Score must be between 0 and ${maxScore}` });
    }
    
    existingScore.score = score;
    await existingScore.save();
    
    res.json(existingScore);
    
  } catch (error) {
    console.error('Update score error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteScore = async (req, res) => {
  try {
    const score = await Score.findByIdAndDelete(req.params.id);
    
    if (!score) {
      return res.status(404).json({ message: 'Score not found' });
    }
    
    res.json({ message: 'Score deleted successfully' });
    
  } catch (error) {
    console.error('Delete score error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getScoresByCourse,
  getScoresByStudent,
  createScore,
  createBulkScores,
  updateScore,
  deleteScore
};