import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TopBar from './layout/TopBar';


export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();

  const isPortal = location.pathname.startsWith('/portal');

  return (
    <div className={isPortal ? "h-screen flex flex-col bg-gray-50 overflow-hidden" : "min-h-screen bg-gray-50 flex flex-col"}>
      <div className="sticky top-0 z-50 w-full shadow-sm">
        {/* Top Bar */}
        <TopBar linkTo={isPortal ? "/" : user ? "/portal/dashboard" : "/login"} linkLabel={user ? "Dashboard" : "Login"} />
      </div>

      <main className={isPortal ? "flex-grow flex flex-col overflow-hidden" : "flex-grow"}>
        <Outlet />
      </main>
    </div>
  );
}
