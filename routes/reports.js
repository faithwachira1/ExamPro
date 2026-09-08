const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const adminAuth = require('../middleware/adminAuth');

router.get('/class/:classId', adminAuth, reportController.getClassReport);
router.get('/student/:studentId', adminAuth, reportController.getStudentReport);
router.get('/course/:courseId', adminAuth, reportController.getCourseReport);

module.exports = router;