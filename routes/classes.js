const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const adminAuth = require('../middleware/adminAuth');

router.get('/', adminAuth, classController.getClasses);
router.get('/:id', adminAuth, classController.getClassById);
router.post('/', adminAuth, classController.createClass);
router.put('/:id', adminAuth, classController.updateClass);
router.delete('/:id', adminAuth, classController.deleteClass);

module.exports = router;