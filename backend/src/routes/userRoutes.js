import express from 'express';
import { createSupabaseCRUDController } from '../controllers/baseSupabaseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
const ctrl = createSupabaseCRUDController('users', {
  searchFields: ['name', 'phone', 'email', 'role'],
  select: 'id, name, phone, email, role, photo_url, is_active, panchayat_family_id, created_at, last_login',
});

router.use(protect);
router.use(authorize('developer', 'super_admin', 'admin'));

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
