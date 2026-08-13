import multer from 'multer';
import sharp from 'sharp';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

export const compressAndResizeImage = async (buffer, mimetype, maxWidth = 600, maxHeight = 600, quality = 80) => {
  if (!mimetype.startsWith('image/')) {
    return { buffer, mimetype };
  }
  try {
    const compressedBuffer = await sharp(buffer)
      .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();
    return { buffer: compressedBuffer, mimetype: 'image/jpeg' };
  } catch {
    return { buffer, mimetype };
  }
};

export const uploadToCloudinary = async (buffer, folder = 'seervi-samaj', mimetype = 'image/jpeg') => {
  // Automatically compress & resize images before saving
  const processed = await compressAndResizeImage(buffer, mimetype);
  const finalBuffer = processed.buffer;
  const finalMime = processed.mimetype;

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    return {
      secure_url: `data:${finalMime};base64,${finalBuffer.toString('base64')}`,
      public_id: `b64_${Date.now()}`,
    };
  }
  try {
    const cloudinary = (await import('../config/cloudinary.js')).default;
    return await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(finalBuffer);
    });
  } catch {
    return {
      secure_url: `data:${finalMime};base64,${finalBuffer.toString('base64')}`,
      public_id: `b64_${Date.now()}`,
    };
  }
};
