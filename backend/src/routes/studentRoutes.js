import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getStudents);
router.get('/:id', optionalAuth, getStudentById);

router.use(protect);
router.post('/', authorize('developer', 'super_admin', 'admin'), createStudent);
router.put('/:id', authorize('developer', 'super_admin', 'admin'), updateStudent);
router.delete('/:id', authorize('developer', 'super_admin', 'admin'), deleteStudent);

export default router;
