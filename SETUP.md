# Setup & Deployment Guide: Shri Seervi Samaj Konda

This document provides step-by-step instructions for running the Shri Seervi Samaj Konda Community Portal locally and deploying it to Vercel production.

---

## Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **MongoDB Atlas Account**: Database URI string
- **Vercel Account**: Deployment platform for frontend and backend

---

## Environment Variables

### Backend (`backend/.env`)

| Variable Name | Description | Example / Recommended Value |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/seervi_samaj_konda` |
| `CLIENT_URL` | Deployed Frontend Origin for CORS | `https://sirvi-samaj-konda.vercel.app` |
| `JWT_SECRET` | Secret key for access token signing | `seervi_samaj_konda_jwt_secret_2026_key` |
| `JWT_REFRESH_SECRET` | Secret key for refresh token signing | `seervi_samaj_konda_refresh_secret_2026_key` |

---

## Local Development Setup

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The backend server runs on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend app runs on `http://localhost:5173`.

---

## Production Deployment on Vercel

### Backend Deployment
1. Import `backend` folder into a Vercel project.
2. In Vercel Project Settings → **Environment Variables**, add:
   - `MONGODB_URI`
   - `CLIENT_URL`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
3. Deploy to production.

### Frontend Deployment
1. Import `frontend` folder into a Vercel project.
2. Build settings: Framework Preset **Vite**, Output Directory **dist**.
3. Deploy to production.
