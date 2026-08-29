import express from 'express';
import { upload, compressImageBuffer } from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/validate.js';

const router = express.Router();

// POST /api/upload
router.post(
  '/',
  protect,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'कृपया फ़ाइल / फ़ोटो चुनें' });
    }

    const processed = await compressImageBuffer(req.file.buffer, req.file.mimetype);

    res.status(200).json({
      success: true,
      url: processed.url,
      message: 'फ़ोटो सफलतापूर्वक प्रोसेस हो गई!',
    });
  })
);

export default router;
