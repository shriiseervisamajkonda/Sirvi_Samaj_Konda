# Dead & Duplicate Code Inventory

> **Status**: Documented for review & cleanup  
> **Date**: August 2026

This document lists all redundant, duplicated, or orphaned files identified across the frontend and backend.

---

## 1. Frontend Dead & Duplicate Code

| File Path | Nature | Reason & Findings | Action Plan |
| :--- | :--- | :--- | :--- |
| [`frontend/src/App.jsx`](file:///d:/Project/Sirvi_Samaj_Konda/frontend/src/App.jsx) | **Dead Code** | A 3-line dummy placeholder (`const App = () => null`). Not imported anywhere; [`main.jsx`](file:///d:/Project/Sirvi_Samaj_Konda/frontend/src/main.jsx) handles routing and context providers directly. | Delete file |
| [`frontend/src/components/common/createAdminPage.jsx`](file:///d:/Project/Sirvi_Samaj_Konda/frontend/src/components/common/createAdminPage.jsx) | **Unused Abstraction** | An unused factory wrapper for creating admin pages. All 20+ admin pages in `pages/admin/*` are built as standalone components with customized forms and tables. | Delete file |
| [`frontend/src/components/common/PaymentModal.jsx`](file:///d:/Project/Sirvi_Samaj_Konda/frontend/src/components/common/PaymentModal.jsx) | **Orphaned Component** | A mock/simulated payment modal not linked into any live donation workflow. | Delete file (or archive until actual payment gateway integration) |

---

## 2. Backend Duplicate & Redundant Code

| File Path | Nature | Reason & Findings | Action Plan |
| :--- | :--- | :--- | :--- |
| [`backend/supabase_schema.sql`](file:///d:/Project/Sirvi_Samaj_Konda/backend/supabase_schema.sql) | **Duplicate SQL Schema** | 177-line partial schema copy. [`backend/src/config/supabase_schema.sql`](file:///d:/Project/Sirvi_Samaj_Konda/backend/src/config/supabase_schema.sql) contains the complete 594-line schema with full relational constraints and indexes. | Delete root copy and keep canonical schema in `config/` |
| [`backend/src/services/supabaseDb.js`](file:///d:/Project/Sirvi_Samaj_Konda/backend/src/services/supabaseDb.js) | **Draft Helper** | 170 lines of generic Supabase CRUD functions with zero active references. | Consolidate or replace when implementing the unified Supabase MVC repository/controller layer |
| [`backend/src/scripts/migrate_mongo_to_supabase.js`](file:///d:/Project/Sirvi_Samaj_Konda/backend/src/scripts/migrate_mongo_to_supabase.js) | **Legacy Migration Script** | Data migration script from Mongo to Supabase. | Remove once Supabase is the primary fresh database |
| `backend/src/models/` (All 27 Mongoose Models) | **Legacy ORM Layer** | Once migrated to Supabase PostgreSQL, all Mongoose models will become redundant. | Remove Mongoose dependencies after Supabase models/services are operational |

---

## 3. Environment Variables Redundancy

| Variable | Location | Issue | Action Plan |
| :--- | :--- | :--- | :--- |
| `SUPER_ADMIN_PASSWORD` | `backend/.env` | Plaintext master password in environment file (security risk). | Remove from `.env`; use interactive setup script / first-login wizard |
| Commented `MONGODB_URI` lines | `backend/.env` | Outdated cluster strings leftover from earlier setups. | Clean and remove |
| Duplicate `.env.example` files | Root, Backend, Frontend | Redundant cross-definitions between root and child folders. | Align `.env.example` to only reflect active services |
