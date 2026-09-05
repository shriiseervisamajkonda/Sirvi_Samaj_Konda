const errorHandler = (err, _req, res, _next) => {
  let error = { ...err };
  error.message = err.message || 'Server Error';

  // Only log full stack for unexpected server errors (5xx); suppress noisy 4xx client errors
  const statusCode = err.statusCode || err.status || 500;
  if (statusCode >= 500) {
    console.error('[Error Handler]', err);
  } else {
    console.warn(`[Error Handler] ${statusCode} — ${err.message || err.type || 'Client Error'}`);
  }

  // Malformed JSON body (body-parser / express.json parse failure)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'अनुरोध का प्रारूप गलत है (Invalid or malformed JSON in request body)',
    });
  }

  // PostgreSQL / Supabase Unique Violation Error (23505)
  if (err.code === '23505') {
    error.message = 'यह रिकॉर्ड पहले से मौजूद है (Duplicate entry / record already exists)';
    error.statusCode = 400;
  }

  // PostgreSQL Foreign Key Violation (23503)
  if (err.code === '23503') {
    error.message = 'संबंधित रिकॉर्ड नहीं मिला (Referenced record not found)';
    error.statusCode = 400;
  }

  // PostgreSQL Not Null Violation (23502)
  if (err.code === '23502') {
    error.message = 'आवश्यक फ़ील्ड भरना अनिवार्य है (Required field is missing)';
    error.statusCode = 400;
  }

  // Supabase PGRST116 (No rows returned when expecting single)
  if (err.code === 'PGRST116') {
    error.message = 'रिकॉर्ड उपलब्ध नहीं है (Record not found)';
    error.statusCode = 404;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'अमान्य सुरक्षा टोकन (Invalid token)';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'सत्र समाप्त हो गया है, कृपया पुनः लॉगिन करें (Session expired, please login again)';
    error.statusCode = 401;
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'फ़ाइल का आकार निर्धारित सीमा से अधिक है (File size exceeds limit)';
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
