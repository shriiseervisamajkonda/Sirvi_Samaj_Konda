import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetDefaultPassword,
  toggleExportPermission,
  toggleUserPermission,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('developer', 'super_admin', 'admin'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id/role', updateUser);
router.put('/:id', updateUser);
router.post('/:id/reset-default-password', resetDefaultPassword);
router.put('/:id/toggle-export-permission', authorize('developer', 'super_admin'), toggleExportPermission);
router.put('/:id/toggle-permission', authorize('developer', 'super_admin', 'admin'), toggleUserPermission);
router.delete('/:id', deleteUser);

export default router;
