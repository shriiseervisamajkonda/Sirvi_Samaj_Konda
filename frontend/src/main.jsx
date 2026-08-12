import { StrictMode } from 'react';
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

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import CommitteePage from './pages/public/CommitteePage';
import VillagePage from './pages/public/VillagePage';
import FamilyDirectoryPage from './pages/public/FamilyDirectoryPage';
import MemberDirectoryPage from './pages/public/MemberDirectoryPage';
import StudentPage from './pages/public/StudentPage';
import BusinessDirectoryPage from './pages/public/BusinessDirectoryPage';
import BloodDonorPage from './pages/public/BloodDonorPage';
import MarriageBiodataPage from './pages/public/MarriageBiodataPage';
import EventsPage from './pages/public/EventsPage';
import NewsPage from './pages/public/NewsPage';
import GalleryPage from './pages/public/GalleryPage';
import DocumentsPage from './pages/public/DocumentsPage';
import DonationPage from './pages/public/DonationPage';
import ContactPage from './pages/public/ContactPage';
import LekhaJokhaPage from './pages/public/LekhaJokhaPage';
import PanchSettlementsPage from './pages/public/PanchSettlementsPage';
import SocialInfoPage from './pages/public/SocialInfoPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import TermsPage from './pages/public/TermsPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import AdminFamiliesPage from './pages/admin/FamiliesPage';
import AdminMembersPage from './pages/admin/MembersPage';
import AdminStudentsPage from './pages/admin/StudentsPage';
import AdminBusinessesPage from './pages/admin/BusinessesPage';
import AdminBloodDonorsPage from './pages/admin/BloodDonorsPage';
import AdminMarriagePage from './pages/admin/MarriagePage';
import AdminEventsPage from './pages/admin/EventsPage';
import AdminGalleryPage from './pages/admin/GalleryPage';
import AdminNewsPage from './pages/admin/NewsPage';
import AdminDocumentsPage from './pages/admin/DocumentsPage';
import AdminDonationsPage from './pages/admin/DonationsPage';
import AdminCommitteePage from './pages/admin/CommitteePage';
import AdminVillagePage from './pages/admin/VillagePage';
import AdminLekhaJokhaPage from './pages/admin/LekhaJokhaPage';
import AdminPanchSettlementsPage from './pages/admin/PanchSettlementsPage';
import AdminSocialInfoPage from './pages/admin/SocialInfoPage';
import AdminUsersPage from './pages/admin/UsersPage';
import AdminActivityLogsPage from './pages/admin/ActivityLogsPage';
import AdminSettingsPage from './pages/admin/SettingsPage';

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
                <Route path="/donations" element={<DonationPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/lekha-jokha" element={<LekhaJokhaPage />} />
                <Route path="/panch-settlements" element={<PanchSettlementsPage />} />
                <Route path="/social-info" element={<SocialInfoPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
              </Route>

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'editor']}>
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
                <Route path="donations" element={<AdminDonationsPage />} />
                <Route path="committee" element={<AdminCommitteePage />} />
                <Route path="village" element={<AdminVillagePage />} />
                <Route path="lekha-jokha" element={<AdminLekhaJokhaPage />} />
                <Route path="panch-settlements" element={<AdminPanchSettlementsPage />} />
                <Route path="social-info" element={<AdminSocialInfoPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="activity-logs" element={<AdminActivityLogsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
