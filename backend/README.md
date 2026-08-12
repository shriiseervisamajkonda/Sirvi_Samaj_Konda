# Shri Sirvi Samaj Konda — Backend REST API Server

This is the server-side API application for the **Shri Seervi Samaj Konda Portal**, built using Node.js, Express, and MongoDB.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (ES Modules syntax)
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **Auth**: JWT (JSON Web Tokens) & BcryptJS (for password hashing)
- **Payment SDK**: Razorpay Node.js SDK
- **File Uploads**: Cloudinary integration (via Multer)
- **SMTP Service**: Nodemailer (sending verification OTPs)
- **Security Middlewares**: Helmet, Rate Limiting, MongoSanitize, XSS filters

---

## ⚙️ Configuration & Environment Variables

Create a `.env` file in the root of the `backend` directory:

```env
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/seervi_samaj_konda

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRE=7d

# Clients
CLIENT_URL=http://localhost:5173

# Cloudinary (Media storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay (Leave empty to use test simulator fallback mode)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## 🚀 Commands

In the `backend` folder, run:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Seed Database**:
   ```bash
   npm run seed
   ```
   *WARNING: This clears existing database records and inserts default user roles, village settings, sample families, and creates the Super Admin:*
   - **Email**: `admin@seervisamajkonda.org`
   - **Password**: `Admin@123456`

3. **Start Development Server (with hot reloading)**:
   ```bash
   npm run dev
   ```

4. **Start Production Server**:
   ```bash
   npm start
   ```
