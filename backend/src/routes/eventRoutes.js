import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getEvents);
router.get('/:id', optionalAuth, getEventById);

router.use(protect);
router.post('/', authorize('developer', 'super_admin', 'admin', 'events:write'), createEvent);
router.put('/:id', authorize('developer', 'super_admin', 'admin', 'events:write'), updateEvent);
router.delete('/:id', authorize('developer', 'super_admin', 'admin', 'events:write'), deleteEvent);

export default router;
