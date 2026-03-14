
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { AuthProvider } from './context/AuthContext';
import { MasterDataProvider } from './context/MasterDataContext';
import { Toaster } from 'sonner';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import { Navigate, Outlet } from 'react-router-dom';
import MyBookingsPage from './pages/MyBookingsPage';
import { CompanyProvider } from './context/CompanyContext';

const CompanyLayout = () => {
  return (
    <CompanyProvider>
      <Outlet />
    </CompanyProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <MasterDataProvider>
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            {/* Public routes wrapped with Company Context for branding */}
            <Route element={<CompanyLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* main web page & booking page routes */}
              <Route element={<Layout />}>
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/" element={<HomePage />} />
              </Route>

            </Route>

            <Route element={<CompanyLayout />}>
              <Route element={<ProtectedRoute allowedRoles={['Student', 'Admin', 'Instructor']} />}>
                <Route path="/portal" element={<DashboardLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="my-bookings" element={<MyBookingsPage />} />
                  <Route path="profile" element={<ProfilePage />} />

                  {/* Admin & Instructor only */}
                  <Route element={<ProtectedRoute allowedRoles={['Admin', 'Instructor']} />}>
                    <Route path="holidays" element={<AdminPage />} />
                  </Route>

                  {/* Admin-only routes */}
                  <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                    <Route path="bookings" element={<AdminPage />} />
                    <Route path="instructors" element={<AdminPage />} />
                    <Route path="packages" element={<AdminPage />} />
                    <Route path="reviews" element={<AdminPage />} />
                    <Route path="settings" element={<AdminPage />} />
                  </Route>
                </Route>
              </Route>
            </Route>

            {/* Catch-all route for pages not found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </MasterDataProvider>
    </AuthProvider>
  );
}

export default App;
