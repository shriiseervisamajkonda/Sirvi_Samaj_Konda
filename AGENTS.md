# Project Agents & Coding Standards

> **Repository**: [Sirvi Samaj Konda](https://github.com/shriiseervisamajkonda/Sirvi_Samaj_Konda.git)  
> **Official Email**: `shriseervisamajkonda@gmail.com`

---

## 1. Git & Workflow Guidelines

- **Git Author & Committer Email**:
  - Always use `shriseervisamajkonda@gmail.com` for all git commits.
  - Command: `git config user.email "shriseervisamajkonda@gmail.com"`
- **Commit & PR Workflow**:
  - Follow Conventional Commits: `feat:`, `fix:`, `refactor:`, `perf:`, `docs:`, `chore:`, `style:`, `test:`.
  - Always create a descriptive feature branch (`feat/...` or `fix/...`), push to origin, create a Pull Request with `gh pr create`, and merge via `gh pr merge --squash --delete-branch` unless explicitly instructed to push directly to main.

---

## 2. Database Schema & Supabase Consistency Rules

- **Primary Key Standard**:
  - In Supabase (PostgreSQL), all tables use `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
  - **NEVER** use MongoDB `_id` in Supabase schemas or query logic.
- **Name Breakdown Convention**:
  - In input forms, always capture `firstName` and `lastName` (Gotra) separately.
  - In backend controllers, compute `full_name = "${firstName} ${lastName}".trim()` and store in the database.
- **Family & Member Entity Mapping**:
  - **Families table (`families`)**: `id`, `panchayat_family_id` (numeric string "1", "2"...), `head_name`, `gotra`, `land_area_acres`, `land_details_text`, `faliya_or_ward`, `total_members`.
  - **Family Members table (`family_members`)**: `id`, `family_id` (UUID foreign key linking to `families.id`), `member_number`, `first_name`, `last_name`, `full_name`, `relationship_with_head`, `gender`, `marital_status`, `mobile_number`, `blood_group`, `education`, `occupation`.
- **Default Initial Credentials Formula**:
  - Initial member passwords are automatically generated using:
    $$\mathbf{Password} = \text{Last 4 digits of Mobile Number} + \text{"@"} + \text{Panchayat Family ID}$$
    *(Example: Mobile `7724878027`, Family ID `1` $\rightarrow$ Password: `8027@1`)*.

---

## 3. Authentication & Security Lifecycle

- **Mandatory First-Login Password Change**:
  - Every initial account or user created by an Admin in `UsersPage.jsx` has `must_change_password: true`.
  - The application root renders `<ForcePasswordChangeModal />` inside `AuthProvider`. Users with `must_change_password === true` are gated on first login and cannot access any page until they set their new private password.
  - Upon successful password update, `must_change_password` is set to `false`.
- **Restricted Google OAuth Linking**:
  - Direct Google Sign-In with an unknown or unlinked Gmail account is **strictly blocked** with HTTP 403 (`GOOGLE_NOT_LINKED`).
  - Users and Admins **MUST** log in first with their Phone Number + Password and link their verified Gmail in **Profile Settings** (`/admin/profile`).
  - Once linked, users can log in interchangeably via **Phone + Password** or **1-Click Google Sign-In**.
- **Backend Rate Limiting Safety Gate**:
  - Auth routes (`/api/auth/login`, `/api/auth/google-login`, `/api/auth/register`, `/api/auth/forgot-password`) are strictly rate-limited via `authLimiter` to protect against brute-force attacks.

---

## 4. Form UX & Google Password Manager Standards

- **Accidental Enter-Submit Prevention (`preventEnterSubmit`)**:
  - On **all multi-field admin and CRUD forms**, attach `onKeyDown={preventEnterSubmit}`:
    ```javascript
    const preventEnterSubmit = (e) => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };
    ```
  - This ensures records are committed to the database **only when the user explicitly clicks the "Save Changes" / "Submit" button**.
- **No Background Keystroke Auto-Save**:
  - Never auto-save incomplete form state on `onChange` keystrokes without explicit user confirmation.
- **HTML Autocomplete & Browser Autofill Attributes**:
  - Every `<label>` must have `htmlFor="..."` matching the `<input id="...">`.
  - Use standard `autoComplete` tokens:
    - Login Identifier: `autoComplete="username"`
    - Existing Password: `autoComplete="current-password"`
    - New / Confirm Password: `autoComplete="new-password"`
    - First / Last Name: `autoComplete="given-name"` and `autoComplete="family-name"`
    - Mobile Phone: `autoComplete="tel"`, `inputMode="tel"`, `maxLength={10}`
    - Email: `autoComplete="email"`, `inputMode="email"`
    - PIN Code: `autoComplete="postal-code"`, `inputMode="numeric"`, `maxLength={6}`
- **Double-Submit / Debounce Lock**:
  - Submit buttons must be disabled during active API requests (`disabled={loading || isSubmitting}`) with loading spinners to eliminate duplicate database writes.

---

## 5. Frontend & Backend Architecture

- **Frontend**:
  - Lazy loading on all routes (`React.lazy()`) with Suspense fallbacks.
  - Reusable components in `frontend/src/components/common/` (`DataTable`, `Modal`, `ConfirmDialog`, `Badge`, `Pagination`, etc.).
  - Centralized API endpoints in `frontend/src/services/api.js`.
  - Frontend visual UI design is handled by the dedicated UI team; backend and full-stack agents must focus strictly on UX integrity, schema correctness, and security.
- **Backend**:
  - Strict MVC architecture (`models/`, `controllers/`, `routes/`, `middleware/`, `services/`, `utils/`).
  - Centralized error handling via `asyncHandler` and `errorHandler.js`.
  - Always use parameterized queries or Supabase client helpers to eliminate SQL/NoSQL injection risks.

---

## 6. Mock Data & Fallback Standards

- **No Inlined Mock Data in Component Files**:
  - **NEVER** write inline mock arrays or large hardcoded dummy data objects directly inside component files (`.jsx`/`.js`).
  - All mock or fallback data **MUST** be stored in clean, structured `.json` files inside the centralized directory:
    ```
    frontend/src/data/mock/
    ```
- **Mandatory TODO Note on Mock Data Usage**:
  - Whenever mock data is imported or used as a fallback in any frontend file, **MUST** include an explicit comment:
    ```javascript
    // TODO: This is mock/fallback data. Remove when actual data is filled in the database.
    ```
- **Live Database Precedence**:
  - Always prioritize querying live Supabase/backend APIs first.
  - Fallback to mock JSON files only when the backend database table is empty during development/demonstrations.
