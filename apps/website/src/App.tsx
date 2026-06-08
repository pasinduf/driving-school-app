import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import { AuthProvider } from './context/AuthContext';
import { MasterDataProvider } from './context/MasterDataContext';
import { CompanyProvider } from './context/CompanyContext';
import { Toaster } from 'sonner';

// Wraps public marketing pages with the company branding/theme context.
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
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{ className: 'rounded-xl border border-line shadow-card' }}
        />
        <BrowserRouter>
          <Routes>
            {/* Public marketing / company website */}
            <Route element={<CompanyLayout />}>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </MasterDataProvider>
    </AuthProvider>
  );
}

export default App;
