import dotenv from 'dotenv';
import app from './src/app.js';
import { checkSupabaseConnection } from './src/config/supabase.js';

dotenv.config();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

const PORT = process.env.PORT || 5000;

// Initialize Supabase Connection
checkSupabaseConnection();

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Shri Seervi Samaj Konda API Server running on port ${PORT}`);
    console.log(`📡 Architecture: Express Strict MVC + Supabase PostgreSQL`);
  });
}

export default app;
