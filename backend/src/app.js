import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import xss from 'xss-clean';

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


const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

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
app.use(xss());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Shri Seervi Samaj Konda API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/blood-donors', bloodDonorRoutes);
app.use('/api/marriage-profiles', marriageRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/committee', committeeRoutes);
app.use('/api/village', villageRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/lekha-jokha', lekhaJokhaRoutes);
app.use('/api/panch-settlements', panchSettlementRoutes);
app.use('/api/social-info', socialInfoRoutes);

app.use(errorHandler);

export default app;
