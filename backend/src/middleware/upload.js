import multer from 'multer';
import sharp from 'sharp';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Supported: JPG, PNG, WEBP, GIF, PDF'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter,
});

// Compress and convert image buffer to lightweight WebP data URL
export const compressImageBuffer = async (buffer, mimetype, maxWidth = 800, quality = 80) => {
  if (!mimetype.startsWith('image/')) {
    return {
      url: `data:${mimetype};base64,${buffer.toString('base64')}`,
      mimetype,
    };
  }

  try {
    const compressed = await sharp(buffer)
      .resize(maxWidth, maxWidth, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    return {
      url: `data:image/webp;base64,${compressed.toString('base64')}`,
      mimetype: 'image/webp',
      size: compressed.length,
    };
  } catch (err) {
    return {
      url: `data:${mimetype};base64,${buffer.toString('base64')}`,
      mimetype,
    };
  }
};
