# Project Task List & Implementation Roadmap

> **Status Tracking**: Ongoing  
> **Last Updated**: August 2026

---

## 1. Pending & Upcoming Features

- [ ] **Notification System (`Notification.js`)**:
  - [ ] Implement backend `notificationController.js` and `notificationRoutes.js`.
  - [ ] Support notification types: `event_alert`, `announcement`, `blood_donation_urgent`, `panch_decision`, `system`.
  - [ ] Implement in-app notification dropdown & badge in frontend Navbar.
  - [ ] Add real-time push/toast alerts for new announcements.

- [ ] **Supabase PostgreSQL Migration (Fresh Architecture)**:
  - [ ] Run and verify complete schema from [`backend/src/config/supabase_schema.sql`](file:///d:/Project/Sirvi_Samaj_Konda/backend/src/config/supabase_schema.sql) in Supabase SQL Editor.
  - [ ] Implement unified Supabase base controller / repository service adhering to MVC.
  - [ ] Transition Auth system to Supabase Auth / JWT while maintaining role-based access control (`super_admin`, `admin`, `editor`, `member`).
  - [ ] Update controllers for: Families, Members, Blood Donors, Events, News, Gallery, Documents, Village, Committees, Gram Units, Panch Settlements, Lekha Jokha, Businesses, Students.
  - [ ] Decommission Mongoose models and MongoDB connection layer cleanly.

- [ ] **Secure Admin Initialization (`npm run create-admin`)**:
  - [ ] Create interactive CLI setup script for creating/updating admin without plaintext passwords in `.env`.
  - [ ] Implement one-time password prompt / password change enforcement on first login.

- [ ] **Multi-User Role & Cashier System (See [future_plan.md](file:///d:/Project/Sirvi_Samaj_Konda/docs/future_plan.md))**:
  - [ ] Implement distinct roles: `developer` (super admin), `admin` (executive), `cashier` / `treasurer` (donations & chanda entry from remote devices), and `member`.
  - [ ] Cashier mobile/desktop quick payment entry interface with family search by Panchayat ID.
  - [ ] Detailed member records with explicit Father/Husband's name display (`पिता / पति का नाम`).

- [ ] **Zero-Cost Direct WhatsApp Receipt Share (Active Mode)**:
  - [ ] 1-click WhatsApp link pre-filled with formatted receipt and live verification link (`https://wa.me/91XXXXXXXXXX?text=...`).
  - [ ] Triggered only on Treasurer's explicit action ("Share on WhatsApp").

- [ ] **Family Head Member Login (Password: Last 4 digits of phone + @ + Family ID)**:
  - [ ] Self-service authentication: Username = Mobile No, Password = `XXXX@<FamilyID>` (e.g. `8027@1`).
  - [ ] Member portal to view past yearly contributions and generate on-demand dynamic PDF receipts.

- [ ] **Automated WhatsApp Cloud API (Deferred until API is secured)**:
  - [ ] Meta WhatsApp Cloud API background webhook & automated template dispatcher.

- [ ] **Live Payment Gateway (Razorpay - Phase 2)**:
  - [ ] Integrate server-side Razorpay order creation and signature verification.
  - [ ] Connect donation flow with automated receipt generation.

---

## 2. Implemented Features

- [x] **Core Frontend Layout & Navigation**: Responsive bilingual Navbar, Footer, Mobile Drawer, Theme and Language switchers.
- [x] **Lazy Loading on all Route Pages**: 30+ public and admin routes code-split with `React.lazy()` and `<Suspense>`.
- [x] **Searchable Select Component**: Real-time searchable dropdown with remote API search and local filtering.
- [x] **Admin Management Dashboards**: Full CRUD interfaces for 20+ modules with `DataTable`, `Modal`, `ConfirmDialog`, `FormComponents`.
- [x] **Clean MVC Routing**: REST API endpoints with middleware caching, rate limiting, and input sanitization.
