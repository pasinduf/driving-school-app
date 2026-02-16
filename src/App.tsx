
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

              <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
                <Route path="my-bookings" element={<StudentBookingsPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['Admin', 'Instructor']} />}>
                <Route path="portal" element={<AdminPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </MasterDataProvider>
    </AuthProvider>
  );
}

export default App;
