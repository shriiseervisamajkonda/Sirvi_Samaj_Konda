# Project Agents & Coding Standards

> **Repository**: [Sirvi Samaj Konda](https://github.com/shriiseervisamajkonda/Sirvi_Samaj_Konda.git)  
> **Official Email**: `shriiseervisamajkonda@gmail.com`

---

## 1. Git & Commit Guidelines

- **Git Author & Committer Email**:
  - Always use `shriiseervisamajkonda@gmail.com` for all git commits.
  - Command: `git config user.email "shriiseervisamajkonda@gmail.com"`
- **Commit Conventions**:
  - Follow Conventional Commits: `feat:`, `fix:`, `refactor:`, `perf:`, `docs:`, `chore:`, `style:`, `test:`.
  - Write concise, descriptive commit messages.

---

## 2. Frontend Architecture Guidelines

- **Lazy Loading on All Routes & Pages**:
  - Every page component in `frontend/src/pages/` (public, auth, and admin) **must be loaded via `React.lazy()`** and wrapped in `<Suspense fallback={...}>` in routing definitions (e.g. `main.jsx`).
  - Heavy components (charts, modals, dynamic rich editors) should also be code-split and loaded on demand.
- **Reusable UI Components**:
  - Reusable components must reside in `frontend/src/components/common/` (e.g., `DataTable`, `Modal`, `ConfirmDialog`, `FormComponents`, `SearchableSelect`, `Pagination`, `Badge`, `PageHeader`, `EmptyState`, `Skeleton`, `LoadingSpinner`, `LazyImage`).
  - Do not duplicate modal, table, form input, or dropdown logic across pages.
- **Layouts & Routing**:
  - Keep route layouts modular (`PublicLayout.jsx`, `AdminLayout.jsx`).
  - Route protection must be managed declaratively using `ProtectedRoute.jsx` with role-based permissions (`super_admin`, `admin`, `editor`, `member`).
- **State & Context Management**:
  - Global states are managed through contexts: `AuthContext`, `ThemeContext`, `LanguageContext`.
  - API communication is centralized in `frontend/src/services/api.js` with Axios interceptors for auth tokens and error handling.
- **Styling & UI Aesthetics**:
  - Use Tailwind CSS and theme design tokens.
  - Ensure full responsiveness (mobile, tablet, desktop) and bilingual Hindi/English typography.

---

## 3. Backend Architecture Guidelines (Strict MVC)

- **Model-View-Controller (MVC) Structure**:
  - **Models (`backend/src/models/`)**: Mongoose schemas and Supabase entity definitions. Include indexes, field validation, and timestamps.
  - **Controllers (`backend/src/controllers/`)**: Encapsulate all business logic, query handling, and response formatting. Utilize `baseController.js` for generic CRUD actions (pagination, filtering, sorting, search).
  - **Routes (`backend/src/routes/`)**: Clean endpoint declarations linking HTTP methods to controller functions. Apply validation and auth middleware at the route level.
- **Middlewares (`backend/src/middleware/`)**:
  - `auth.js`: JWT verification and role-based authorization (`protect`, `authorize`).
  - `cache.js`: Memory caching and HTTP cache headers.
  - `errorHandler.js`: Centralized error handling and standardized JSON error responses.
  - `upload.js`: Cloudinary/Multer file upload handlers.
  - `validate.js`: Request payload validation.
- **Services & Utilities (`backend/src/services/`, `backend/src/utils/`)**:
  - Centralize third-party API integrations (Cloudinary, Supabase, Email service, QR Code generator).

---

## 4. Code Hygiene & Maintenance

- **Zero Dead / Redundant Code Policy**:
  - Never retain orphaned components, unreferenced files, redundant duplicate schema copies, or abandoned code.
  - Periodically audit imports and unused dependencies.
- **Security & Environment**:
  - Never commit `.env` files containing sensitive secrets.
  - Sanitize user input (e.g., `express-mongo-sanitize`, parameterized Supabase queries).
