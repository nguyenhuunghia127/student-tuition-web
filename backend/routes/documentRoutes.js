import express from 'express';
import * as documentController from '../controllers/documentController.js';
import { requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(requireAdmin); // Bảo vệ toàn bộ document routes

// Categories
router.get('/categories', documentController.getCategories);
router.post('/categories', documentController.createCategory);
router.put('/categories/:id', documentController.updateCategory);
router.delete('/categories/:id', documentController.deleteCategory);

// Documents
router.get('/', documentController.getDocuments);
router.post('/', documentController.createDocument);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

// Assignment Documents (Gán tài liệu vào bài tập)
router.post('/assign', documentController.assignDocument);
router.delete('/assign/:assignment_id/:document_id', documentController.removeAssignedDocument);
router.get('/assignment/:assignment_id', documentController.getAssignmentDocuments);

export default router;
