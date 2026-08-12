# Shri Sirvi Samaj Konda — Community Portal

A modern, comprehensive web application designed for the **Shri Seervi Samaj of Konda village (Tehsil Kukshi, Dhar, Madhya Pradesh)**. This portal connects community families, lists businesses, blood donors, and students, manages local events, maintains financial ledger transparency, and logs local Panch arbitration settlements.

---

## 🌟 Key Features

### 1. 📋 Community Directory
- **Family Directory**: Detailed records of community families with tree views.
- **Member Directory**: Detailed directory of all community members.
- **Student Profile**: Directory of students showcasing cgpa, achievements, and scholarships.
- **Business Profiles**: Local business listing directory for community trade networking.
- **Blood Donors**: Searchable directory of blood donors.

### 2. 🏛️ Leadership & Organization (समिती एवं पंच)
- **Executive Committee (कार्यकारिणी समिति)**: Key leadership and coordinators.
- **Sangathan (संगठन)**: Sub-committee members and organizational bodies.
- **Sankal Panch (संकल पंच)**: Traditional council of village elders and arbitrators.

### 3. ⚖️ Judicial Settlements (न्यायिक समझौते)
- **Arbitration Log**: Database of local disputes resolved by the Panch council.
- **Transcripts & Attachments**: Case titles, parties involved, detailed decision logs, and attachments of signed settlement documents.

### 4. 📒 Accounts Ledger (पारदर्शी लेखा-जोखा)
Transparent income and expense bookkeeping for specific Samaj funds:
- **आईजी सहायता कोष** (Aaiji Relief/Help Fund)
- **अन्नपूर्णा भवन** (Annapurna Bhawan Accounts)
- **मन्दिर निर्माण** (Temple Construction Fund)
- **धार्मिक कार्य** (Religious Events Ledger)
- **प्रतिभा सम्मान** (Talent recognition expense logs)

### 5. 💳 Payment Gateway Integration
- **Online Donations**: Integrated checkout via **Razorpay Payment Gateway**.
- **Simulator Mode fallback**: Automated simulation wrapper that runs on local development setups if merchant keys are not set up.

---

## 📂 Project Structure

```text
Sirvi_Samaj_Konda/
├── backend/            # Express, Mongoose, NodeJS Server API
│   ├── src/
│   │   ├── config/     # DB & Cloudinary configs
│   │   ├── controllers/# Business logic
│   │   ├── models/     # Mongoose Schemas (LekhaJokha, PanchSettlement, SocialInfo, etc.)
│   │   ├── routes/     # Express REST APIs
│   │   ├── seed/       # Seeding files
│   │   └── app.js      # Routes registration & Middlewares
│   └── server.js       # Entry point
└── frontend/           # ReactJS, Vite, TailwindCSS client
    ├── src/
    │   ├── components/ # Shared layouts & Modal components
    │   ├── context/    # Theme and Translation (English/Hindi) Contexts
    │   ├── pages/      # Public views & Admin CRUD dashboards
    │   └── services/   # Axios API integrations
    └── vite.config.js  # Vite dev server configuration
```

---

## 🚀 Setup & Installation

### Prerequisite
- **NodeJS** (v18 or above)
- **MongoDB Database** (Local instance or MongoDB Atlas cluster URI)

---

### Step 1: Configure Backend

1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file based on `.env.example` and populate your secrets:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/seervi_samaj_konda
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:5173
   
   # Razorpay Credentials (leave empty to use Simulator Mode)
   RAZORPAY_KEY_ID=
   RAZORPAY_KEY_SECRET=
   ```

3. Seed initial database records (roles, settings, and create default Super Admin):
   ```bash
   npm run seed
   ```
   *Note: This creates the default admin user:*
   - **Email**: `admin@seervisamajkonda.org`
   - **Password**: `Admin@123456`

4. Start the backend development server:
   ```bash
   npm run dev
   ```

---

### Step 2: Configure Frontend

1. Navigate to the frontend directory and install dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

2. Start the Vite React client:
   ```bash
   npm run dev
   ```
   Open your browser to [http://localhost:5173](http://localhost:5173).

3. To bundle the application for production deployment:
   ```bash
   npm run build
   ```
