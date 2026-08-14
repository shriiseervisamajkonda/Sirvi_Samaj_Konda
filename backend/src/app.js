import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';

import compression from 'compression';

import { ensureDbConnected } from './config/db.js';
import { setCacheHeaders, memoryCacheMiddleware } from './middleware/cache.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import bloodDonorRoutes from './routes/bloodDonorRoutes.js';
import marriageRoutes from './routes/marriageRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import committeeRoutes from './routes/committeeRoutes.js';
import villageRoutes from './routes/villageRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import activityLogRoutes from './routes/activityLogRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import lekhaJokhaRoutes from './routes/lekhaJokhaRoutes.js';
import panchSettlementRoutes from './routes/panchSettlementRoutes.js';
import socialInfoRoutes from './routes/socialInfoRoutes.js';
import gramUnitRoutes from './routes/gramUnitRoutes.js';
import gramUnitMemberRoutes from './routes/gramUnitMemberRoutes.js';
import formationEventRoutes from './routes/formationEventRoutes.js';


const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

app.set('trust proxy', 1);

const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://sirvi-samaj-konda.vercel.app',
  'https://sirvi-samaj-konda-zhv7.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: 'Too many authentication attempts, please try again after 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

app.get(['/', '/api', '/api/'], (_req, res) => {
  res.json({ success: true, message: 'Shri Seervi Samaj Konda API Root' });
});

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Shri Seervi Samaj Konda API is running' });
});

app.use('/api', ensureDbConnected);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/blood-donors', bloodDonorRoutes);
app.use('/api/marriage-profiles', marriageRoutes);

app.use('/api/village', setCacheHeaders(60, 300), memoryCacheMiddleware(60), villageRoutes);
app.use('/api/social-info', setCacheHeaders(60, 300), memoryCacheMiddleware(60), socialInfoRoutes);
app.use('/api/committee', setCacheHeaders(60, 300), memoryCacheMiddleware(60), committeeRoutes);
app.use('/api/news', setCacheHeaders(30, 120), memoryCacheMiddleware(30), newsRoutes);
app.use('/api/events', setCacheHeaders(30, 120), memoryCacheMiddleware(30), eventRoutes);
app.use('/api/gallery', setCacheHeaders(60, 300), memoryCacheMiddleware(60), galleryRoutes);
app.use('/api/documents', setCacheHeaders(60, 300), memoryCacheMiddleware(60), documentRoutes);
app.use('/api/donations', setCacheHeaders(30, 120), donationRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/settings', memoryCacheMiddleware(60), settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/lekha-jokha', lekhaJokhaRoutes);
app.use('/api/panch-settlements', memoryCacheMiddleware(30), panchSettlementRoutes);
app.use('/api/gram-units', memoryCacheMiddleware(60), gramUnitRoutes);
app.use('/api/gram-unit-members', memoryCacheMiddleware(60), gramUnitMemberRoutes);
app.use('/api/formation-events', memoryCacheMiddleware(60), formationEventRoutes);

app.use(errorHandler);

export default app;
