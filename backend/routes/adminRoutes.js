import express from 'express';
import upload from '../config/multer.js';
import * as adminController from '../controllers/adminController.js';
import { requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(requireAdmin); // Bảo vệ toàn bộ admin routes

// Classes
router.get('/classes', adminController.getClasses);
router.post('/classes', adminController.createClass);
router.put('/classes/:id', adminController.updateClass);
router.delete('/classes/:id', adminController.deleteClass);
router.post('/classes/:id/students', adminController.assignStudentsToClass);
router.delete('/classes/:id/students/:student_id', adminController.removeStudentFromClass);

// Subjects
router.get('/subjects', adminController.getSubjects);
router.post('/subjects', adminController.createSubject);
router.put('/subjects/:id', adminController.updateSubject);
router.delete('/subjects/:id', adminController.deleteSubject);

// Students
router.get('/students', adminController.getStudents);
router.post('/students', adminController.createStudent);
router.post('/students/bulk-delete', adminController.deleteMultipleStudents);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);
router.post('/students/import', upload.single('file'), adminController.importStudents);
router.get('/students/export', adminController.exportStudents);

// Grades
router.get('/grades', adminController.getGrades);
router.post('/grades', adminController.createGrade);
router.post('/grades/import', upload.single('file'), adminController.importGrades);
router.get('/grades/export', adminController.exportGrades);

// Grade Settings
router.get('/grade-settings', adminController.getGradeSettings);
router.put('/grade-settings', adminController.updateGradeSettings);

// Grade Appeals
router.get('/grade-appeals', adminController.getGradeAppeals);
router.put('/grade-appeals/:id/status', adminController.updateGradeAppealStatus);

// Assignments
router.get('/assignments', adminController.getAssignments);
router.post('/assignments', adminController.createAssignment);
router.put('/assignments/:id', adminController.updateAssignment);
router.delete('/assignments/:id', adminController.deleteAssignment);
router.get('/assignments/:id/submissions', adminController.getSubmissions);
router.post('/assignments/grade', adminController.gradeSubmission);
router.put('/assignments/submissions/:id', adminController.updateSubmissionFile);
router.get('/assignments/grades/all', adminController.getAllAssignmentGrades);

// Tuition
router.get('/tuition', adminController.getTuitions);
router.get('/tuition/payments', adminController.getPaymentHistory);
router.post('/tuition', adminController.createTuition);
router.put('/tuition/:id', adminController.updateTuition);
router.delete('/tuition/:id', adminController.deleteTuition);
router.post('/tuition/bulk-delete', adminController.deleteMultipleTuitions);
router.post('/tuition/assign-class', adminController.assignClassTuition);
router.post('/tuition/assign-advanced', adminController.assignAdvancedTuition);
router.post('/tuition/unpay-manual', adminController.unpayManual);
router.post('/tuition/pay-manual', adminController.payManual);
router.post('/tuition/approve', adminController.approveTuitionPayment);
router.post('/tuition/reject', adminController.rejectTuitionPayment);

// Schedules
router.get('/schedules', adminController.getSchedules);
router.post('/schedules/batch', adminController.createScheduleBatch);
router.post('/schedules', adminController.createSchedule);
router.put('/schedules/:id', adminController.updateSchedule);
router.delete('/schedules/:id', adminController.deleteSchedule);
router.get('/schedules/:id/attendance', adminController.getScheduleAttendance);
router.post('/schedules/:id/attendance', adminController.saveScheduleAttendance);

// Notifications
router.get('/notifications', adminController.getNotifications);
router.post('/notifications', adminController.createNotification);
router.get('/logs', adminController.getActivityLogs);

// Stats
router.get('/stats', adminController.getStats);

// Templates
router.get('/templates/students', adminController.downloadStudentTemplate);
router.get('/templates/grades', adminController.downloadGradeTemplate);

// Leave Requests
router.get('/leave-requests', adminController.getAllLeaveRequests);
router.put('/leave-requests/:id/status', adminController.updateLeaveStatus);

export default router;
