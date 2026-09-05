# Project Task List & Implementation Roadmap

> **Status Tracking**: Ongoing  
> **Last Updated**: September 2026

---

## 1. Implemented & Verified Features

- [x] **Supabase PostgreSQL Migration (Complete Architecture)**:
  - [x] Complete schema initialized with PostgreSQL tables, foreign keys, and indexes.
  - [x] Implemented unified Supabase base controller / repository service adhering to MVC (`backend/src/controllers/baseSupabaseController.js`).
  - [x] Transition Auth system to Supabase Auth / JWT while maintaining role-based access control (`developer`, `admin`, `editor`, `cashier`, `member`).
  - [x] Controllers updated for: Families, Members, Blood Donors, Events, News, Gallery, Documents, Village, Committees, Gram Units, Panch Settlements, Lekha Jokha, Businesses, Students.
  - [x] Decommissioned Mongoose models and MongoDB connection layer cleanly.

- [x] **Secure Admin & User Authentication Lifecycle**:
  - [x] CLI script `npm run create-admin` for initializing admin credentials securely.
  - [x] Mandatory First-Login Password Change enforcement (`must_change_password: true`) gated by `<ForcePasswordChangeModal />`.
  - [x] Restricted Google OAuth linking: unlinked accounts rejected with `GOOGLE_NOT_LINKED`; verified Gmail linkable from `/admin/profile`.
  - [x] Family Head Member Login with default formula (Last 4 digits of Phone + `@` + Panchayat Family ID).

- [x] **Frontend Architecture & Zero Hardcoding Policy**:
  - [x] Eliminated all raw inlined dummy arrays in component JSX/JS files.
  - [x] Centralized structured fallback data into `frontend/src/data/mock/*.json` with standard `// TODO:` fallback annotations.
  - [x] Real-time Supabase subscriptions with 300ms debounce across public and admin committee / gram unit pages.
  - [x] Lazy loading on all route pages (`React.lazy()` + `<Suspense>`).
  - [x] Reusable common components (`DataTable`, `Modal`, `ConfirmDialog`, `Badge`, `Pagination`, `FormComponents`).
  - [x] Single query fetch model with client-side in-memory filtering to protect backend & database load.

- [x] **Zero-Cost Direct WhatsApp Receipt Share**:
  - [x] 1-click WhatsApp link pre-filled with formatted receipt and live verification details (`https://wa.me/91XXXXXXXXXX?text=...`).
  - [x] Triggered on Treasurer's explicit action ("Share on WhatsApp").

---

## 2. Pending & Upcoming Features

- [ ] **Notification System (`Notification.js`)**:
  - [ ] Implement backend `notificationController.js` and `notificationRoutes.js`.
  - [ ] Support notification types: `event_alert`, `announcement`, `blood_donation_urgent`, `panch_decision`, `system`.
  - [ ] Implement in-app notification dropdown & badge in frontend Navbar.
  - [ ] Add real-time push/toast alerts for new announcements.

- [ ] **Multi-User Role & Cashier System Enhancements (See [future_plan.md](file:///d:/Project/Sirvi_Samaj_Konda/docs/future_plan.md))**:
  - [ ] Cashier mobile/desktop quick payment entry interface with family search by Panchayat ID.
  - [ ] Detailed member records with explicit Father/Husband's name display (`पिता / पति का नाम`).

- [ ] **Automated WhatsApp Cloud API (Deferred until official API keys are provisioned)**:
  - [ ] Meta WhatsApp Cloud API background webhook & automated template dispatcher.

- [ ] **Live Payment Gateway (Razorpay - Phase 2)**:
  - [ ] Integrate server-side Razorpay order creation and signature verification.
  - [ ] Connect donation flow with automated receipt generation.
