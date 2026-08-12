# Shri Sirvi Samaj Konda — Frontend Client

This is the client-side single-page application (SPA) for the **Shri Seervi Samaj Konda Portal**, built using React, Vite, and TailwindCSS.

---

## 🛠️ Technology Stack

- **Framework**: [ReactJS 19](https://react.dev/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **API Client**: [Axios](https://axios-http.com/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

---

## 📦 Navigation & Public Directories

The client application includes public directories and admin controls:
- **Directory**: View Family list, Members, Student directory, Business listing, and Blood donors.
- **समिती एवं संकल पंच**: Toggle views for Executive Committee, Sangathan, and traditional Sankal Panch.
- **न्यायिक समझौते**: View arbitration agreements signed by local Panchs.
- **लेखा-जोखा (Accounts Ledger)**: Inspect Aaiji Relief Fund, Annapurna Bhawan, Temple Construction, and Talent Honor accounts.
- **Donation Gateway**: Pay securely online using Razorpay checkout (or simulator mode in local testing).

---

## 🚀 Commands

In the `frontend` folder, run:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Local Dev Server**:
   ```bash
   npm run dev
   ```
   *By default, this launches at [http://localhost:5173](http://localhost:5173) and proxies `/api` calls to port `5000`.*

3. **Build for Production**:
   ```bash
   npm run build
   ```
   *Compiles clean static HTML/CSS/JS assets inside the `/dist` output folder.*
