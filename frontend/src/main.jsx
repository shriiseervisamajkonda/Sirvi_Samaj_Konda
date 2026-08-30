import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Common
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Loading fallback component
const PageFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF8EC]">
    <div className="w-12 h-12 border-4 border-[#E8DCC8] border-t-[#C85A17] rounded-full animate-spin"></div>
  </div>
);

// Auth Pages (Lazy)
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));

// Public Pages (Lazy)
const HomePage = lazy(() => import('./pages/public/HomePage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const CommitteePage = lazy(() => import('./pages/public/CommitteePage'));
const WomenCommitteePage = lazy(() => import('./pages/public/WomenCommitteePage'));
const VillagePage = lazy(() => import('./pages/public/VillagePage'));
const FamilyDirectoryPage = lazy(() => import('./pages/public/FamilyDirectoryPage'));
const MemberDirectoryPage = lazy(() => import('./pages/public/MemberDirectoryPage'));
const StudentPage = lazy(() => import('./pages/public/StudentPage'));
const BusinessDirectoryPage = lazy(() => import('./pages/public/BusinessDirectoryPage'));
const BloodDonorPage = lazy(() => import('./pages/public/BloodDonorPage'));
const MarriageBiodataPage = lazy(() => import('./pages/public/MarriageBiodataPage'));
const EventsPage = lazy(() => import('./pages/public/EventsPage'));
const NewsPage = lazy(() => import('./pages/public/NewsPage'));
const GalleryPage = lazy(() => import('./pages/public/GalleryPage'));
const DocumentsPage = lazy(() => import('./pages/public/DocumentsPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const LekhaJokhaPage = lazy(() => import('./pages/public/LekhaJokhaPage'));
const PanchSettlementsPage = lazy(() => import('./pages/public/PanchSettlementsPage'));
const SocialInfoPage = lazy(() => import('./pages/public/SocialInfoPage'));
const KondaGramUnitPage = lazy(() => import('./pages/public/KondaGramUnitPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/public/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/public/TermsPage'));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'));

// Admin Pages (Lazy - Isolated in separate bundles)
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const AdminFamiliesPage = lazy(() => import('./pages/admin/FamiliesPage'));
const AdminMembersPage = lazy(() => import('./pages/admin/MembersPage'));
const AdminStudentsPage = lazy(() => import('./pages/admin/StudentsPage'));
const AdminBusinessesPage = lazy(() => import('./pages/admin/BusinessesPage'));
const AdminBloodDonorsPage = lazy(() => import('./pages/admin/BloodDonorsPage'));
const AdminMarriagePage = lazy(() => import('./pages/admin/MarriagePage'));
const AdminEventsPage = lazy(() => import('./pages/admin/EventsPage'));
const AdminGalleryPage = lazy(() => import('./pages/admin/GalleryPage'));
const AdminNewsPage = lazy(() => import('./pages/admin/NewsPage'));
const AdminDocumentsPage = lazy(() => import('./pages/admin/DocumentsPage'));
const AdminCommitteePage = lazy(() => import('./pages/admin/CommitteePage'));
const AdminWomenCommitteePage = lazy(() => import('./pages/admin/WomenCommitteeAdminPage'));
const AdminGramUnitsPage = lazy(() => import('./pages/admin/GramUnitsPage'));
const AdminVillagePage = lazy(() => import('./pages/admin/VillagePage'));
const AdminLekhaJokhaPage = lazy(() => import('./pages/admin/LekhaJokhaPage'));
const AdminPanchSettlementsPage = lazy(() => import('./pages/admin/PanchSettlementsPage'));
const AdminSocialInfoPage = lazy(() => import('./pages/admin/SocialInfoPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/UsersPage'));
const AdminActivityLogsPage = lazy(() => import('./pages/admin/ActivityLogsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const AdminProfilePage = lazy(() => import('./pages/admin/ProfilePage'));
const AdminContactsPage = lazy(() => import('./pages/admin/ContactsPage'));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--toast-bg, #fff)',
                  color: 'var(--toast-color, #1e293b)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                },
              }}
            />
            <ErrorBoundary>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  {/* Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                  <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

                  {/* Public Routes */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/committee" element={<CommitteePage />} />
                    <Route path="/women-committee" element={<WomenCommitteePage />} />
                    <Route path="/shri-ii-g-women-committee" element={<WomenCommitteePage />} />
                    <Route path="/village" element={<VillagePage />} />
                    <Route path="/families" element={<FamilyDirectoryPage />} />
                    <Route path="/members" element={<MemberDirectoryPage />} />
                    <Route path="/students" element={<StudentPage />} />
                    <Route path="/businesses" element={<BusinessDirectoryPage />} />
                    <Route path="/blood-donors" element={<BloodDonorPage />} />
                    <Route path="/marriage" element={<MarriageBiodataPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/documents" element={<DocumentsPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/lekha-jokha" element={<LekhaJokhaPage />} />
                    <Route path="/panch-settlements" element={<PanchSettlementsPage />} />
                    <Route path="/social-info" element={<SocialInfoPage />} />
                    <Route path="/konda-gram-unit" element={<KondaGramUnitPage />} />
                    <Route path="/gram-unit" element={<KondaGramUnitPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['developer', 'super_admin', 'admin', 'editor', 'treasurer']}>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<DashboardPage />} />
                    <Route path="families" element={<AdminFamiliesPage />} />
                    <Route path="members" element={<AdminMembersPage />} />
                    <Route path="students" element={<AdminStudentsPage />} />
                    <Route path="businesses" element={<AdminBusinessesPage />} />
                    <Route path="blood-donors" element={<AdminBloodDonorsPage />} />
                    <Route path="marriage" element={<AdminMarriagePage />} />
                    <Route path="events" element={<AdminEventsPage />} />
                    <Route path="gallery" element={<AdminGalleryPage />} />
                    <Route path="news" element={<AdminNewsPage />} />
                    <Route path="documents" element={<AdminDocumentsPage />} />
                    <Route path="committee" element={<AdminCommitteePage />} />
                    <Route path="women-committee" element={<AdminWomenCommitteePage />} />
                    <Route path="gram-units" element={<AdminGramUnitsPage />} />
                    <Route path="konda-gram-unit" element={<AdminGramUnitsPage />} />
                    <Route path="village" element={<AdminVillagePage />} />
                    <Route path="lekha-jokha" element={<AdminLekhaJokhaPage />} />
                    <Route path="panch-settlements" element={<AdminPanchSettlementsPage />} />
                    <Route path="social-info" element={<AdminSocialInfoPage />} />
                    <Route path="contacts" element={<AdminContactsPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="activity-logs" element={<AdminActivityLogsPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                    <Route path="profile" element={<AdminProfilePage />} />
                  </Route>

                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
