
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
// import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';
import { MasterDataProvider } from './context/MasterDataContext';
import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <MasterDataProvider>
        <Toaster position="top-center" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="booking" element={<BookingPage />} />
              {/* <Route path="admin" element={<AdminPage />} /> */}
            </Route>
          </Routes>
        </BrowserRouter>
      </MasterDataProvider>
    </AuthProvider>
  );
}

export default App;
