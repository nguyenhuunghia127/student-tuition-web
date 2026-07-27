import express from 'express';
import upload from '../config/multer.js';
import { 
  getProfile, 
  getDashboard, 
  submitAssignment, 
  payTuition,
  submitGradeAppeal,
  getParentProfile,
  getParentDashboard,
  getLeaveRequests,
  submitLeaveRequest
} from '../controllers/studentController.js';

import { requireStudent, requireParent } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes cho học sinh
router.get('/profile', requireStudent, getProfile);
router.get('/dashboard', requireStudent, getDashboard);
router.post('/assignments/submit', requireStudent, submitAssignment);
router.post('/tuition/pay', requireStudent, payTuition);
router.post('/grade-appeals', requireStudent, submitGradeAppeal);

// Leave Requests (Học sinh)
router.get('/leave-requests', requireStudent, getLeaveRequests);
router.post('/leave-requests', requireStudent, submitLeaveRequest);

// Routes cho phụ huynh
router.get('/parent/profile', requireParent, getParentProfile);
router.get('/parent/dashboard', requireParent, getParentDashboard);

export default router;
