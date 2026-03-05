
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';
import { MasterDataProvider } from './context/MasterDataContext';
import { Toaster } from 'sonner';
import AdminPage from './pages/AdminPage';
import StudentBookingsPage from './pages/StudentBookingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import { Navigate } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <MasterDataProvider>
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="booking" element={<BookingPage />} />
              <Route element={<ProtectedRoute allowedRoles={['Student', 'Admin', 'Instructor']} />}>
                <Route path="portal" element={<DashboardLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="bookings" element={<AdminPage />} />
                  <Route path="my-bookings" element={<StudentBookingsPage />} />
                  <Route path="instructors" element={<AdminPage />} />
                  <Route path="holidays" element={<AdminPage />} />
                  <Route path="profile" element={<ProfilePage />} />
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
