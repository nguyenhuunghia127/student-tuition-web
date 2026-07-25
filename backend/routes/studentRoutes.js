import express from 'express';
import upload from '../config/multer.js';
import { 
  getProfile, 
  getDashboard, 
  submitAssignment, 
  payTuition,
  submitGradeAppeal,
  getParentProfile,
  getParentDashboard
} from '../controllers/studentController.js';

const router = express.Router();

router.get('/profile', getProfile);
router.get('/dashboard', getDashboard);
router.post('/assignments/submit', submitAssignment);
router.post('/tuition/pay', payTuition);
router.post('/grade-appeals', submitGradeAppeal);

router.get('/parent/profile', getParentProfile);
router.get('/parent/dashboard', getParentDashboard);

export default router;
