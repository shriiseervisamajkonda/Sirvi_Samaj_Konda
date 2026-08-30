import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import { setCacheHeaders, memoryCacheMiddleware } from './middleware/cache.js';
import errorHandler from './middleware/errorHandler.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import committeeRoutes from './routes/committeeRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import lekhaJokhaRoutes from './routes/lekhaJokhaRoutes.js';
import villageRoutes from './routes/villageRoutes.js';
import bloodDonorRoutes from './routes/bloodDonorRoutes.js';
import marriageRoutes from './routes/marriageRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import panchSettlementRoutes from './routes/panchSettlementRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import activityLogRoutes from './routes/activityLogRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

app.set('trust proxy', 1);

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(new Error('CORS not allowed for this origin'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);
app.options('*', cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Auth Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// Root & Health Endpoints
app.get(['/', '/api', '/api/'], (_req, res) => {
  res.json({
    success: true,
    message: 'Shri Seervi Samaj Konda API Root (Supabase PostgreSQL MVC)',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Shri Seervi Samaj Konda API is healthy',
    database: 'Supabase PostgreSQL',
  });
});

// Primary Business Modules
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/committees', setCacheHeaders(60, 300), memoryCacheMiddleware(60), committeeRoutes);
app.use('/api/news', setCacheHeaders(30, 120), memoryCacheMiddleware(30), newsRoutes);
app.use('/api/events', setCacheHeaders(30, 120), memoryCacheMiddleware(30), eventRoutes);
app.use('/api/village', setCacheHeaders(120, 600), memoryCacheMiddleware(120), villageRoutes);
app.use('/api/blood-donors', setCacheHeaders(30, 120), bloodDonorRoutes);
app.use('/api/marriage-profiles', marriageRoutes);
app.use('/api/documents', setCacheHeaders(60, 300), memoryCacheMiddleware(60), documentRoutes);
app.use('/api/gallery', setCacheHeaders(60, 300), memoryCacheMiddleware(60), galleryRoutes);
app.use('/api/lekha-jokha', lekhaJokhaRoutes);
app.use('/api/panch-settlements', memoryCacheMiddleware(30), panchSettlementRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/upload', uploadRoutes);

// Centralized Error Handler
app.use(errorHandler);

export default app;
