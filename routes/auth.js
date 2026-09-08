const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { adminLimiter } = require('../middleware/rateLimiter');
const adminAuth = require('../middleware/adminAuth');

router.post('/hidden-admin-register', adminLimiter, authController.hiddenAdminRegister);
router.post('/hidden-admin-login', adminLimiter, authController.hiddenAdminLogin);
router.post('/verify-admin-hash', adminLimiter, authController.verifyAdminHash);
router.get('/admin-info', adminAuth, authController.getAdminInfo);
router.post('/register-teacher', adminAuth, authController.registerTeacher);
router.post('/teacher-login', authController.loginTeacher);

router.get('/admins', adminAuth, authController.getAllAdmins);
router.post('/create-admin', adminAuth, authController.createAdminUser);
router.put('/admins/:id', adminAuth, authController.updateAdminUser);
router.put('/admins/:id/toggle', adminAuth, authController.toggleAdminStatus);
router.put('/admins/:id/reset-password', adminAuth, authController.resetAdminPassword);
router.put('/admins/:id/reset-attempts', adminAuth, authController.resetAdminAttempts);
router.delete('/admins/:id', adminAuth, authController.deleteAdminUser);

module.exports = router;