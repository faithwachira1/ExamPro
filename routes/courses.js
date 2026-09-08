const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const adminAuth = require('../middleware/adminAuth');

router.get('/', adminAuth, courseController.getCourses);
router.get('/:id', adminAuth, courseController.getCourseById);
router.post('/', adminAuth, courseController.createCourse);
router.put('/:id', adminAuth, courseController.updateCourse);
router.delete('/:id', adminAuth, courseController.deleteCourse);

router.post('/:id/assessments', adminAuth, courseController.addAssessment);
router.delete('/:id/assessments/:assessmentIndex', adminAuth, courseController.deleteAssessment);

router.post('/:id/manual-students', adminAuth, courseController.addManualStudent);
router.delete('/:id/manual-students/:studentIndex', adminAuth, courseController.deleteManualStudent);

router.get('/:id/summary', adminAuth, courseController.getCourseSummary);

module.exports = router;