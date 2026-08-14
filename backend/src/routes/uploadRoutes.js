import express from 'express';
import { upload, uploadToCloudinary } from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/validate.js';

const router = express.Router();

// Direct secure image/file upload endpoint
router.post(
  '/',
  protect,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'कृपया फ़ाइल / फ़ोटो चुनें' });
    }

    const folder = req.body.folder || 'seervi-samaj';
    const result = await uploadToCloudinary(req.file.buffer, folder, req.file.mimetype);

    res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      message: 'फ़ोटो सफलतापूर्वक अपलोड हो गई!',
    });
  })
);

export default router;
