import { LayoutDashboard, Users, CalendarDays, CarFront, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Archive } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (c: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed, mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
  const { user } = useAuth();
  const [bookingsOpen, setBookingsOpen] = useState(true);

  if (!user) return null;

  const role = user.role;
  const isAdmin = role === 'Admin';
  const isInstructor = role === 'Instructor';

  // Common styles
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
      ? 'bg-primary text-white'
      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  const handleMobileDismiss = () => {
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  };

  const subLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center pl-11 pr-4 py-2 text-sm rounded-lg transition-colors ${isActive
      ? 'text-white font-medium bg-gray-800'
      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
    }`;

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-40 md:hidden transition-opacity" onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)} />
      )}

      <aside
        className={`${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} ${collapsed ? "md:w-20 w-64" : "w-64"
          } fixed md:relative transition-all duration-300 flex-shrink-0 bg-gray-900 text-white border-r border-gray-800 top-0 h-full overflow-y-auto flex flex-col z-50`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="font-bold text-lg">D</span>
              </div>
              <span className="font-bold text-lg tracking-tight">DRIVING SCHOOL</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors ${collapsed ? "mx-auto" : ""}`}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          <NavLink to="/portal/dashboard" className={navLinkClass} onClick={handleMobileDismiss}>
            <LayoutDashboard size={20} className={collapsed ? "mx-auto" : ""} />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>

          {isAdmin && user && user.existMultipleInstructors ? (
            <div>
              <button
                onClick={() => setBookingsOpen(!bookingsOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${!collapsed && bookingsOpen ? "bg-gray-800/50" : ""}`}
              >
                <div className="flex items-center space-x-3">
                  <CarFront size={20} className={collapsed ? "mx-auto" : ""} />
                  {!collapsed && <span>Bookings</span>}
                </div>
                {!collapsed && (bookingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </button>

              {/* Sub Navigation */}
              {!collapsed && bookingsOpen && (
                <div className="mt-1 space-y-1">
                  <NavLink to="/portal/my-bookings" className={subLinkClass} end onClick={handleMobileDismiss}>
                    My Bookings
                  </NavLink>
                  <NavLink to="/portal/bookings" className={subLinkClass} end onClick={handleMobileDismiss}>
                    All Bookings
                  </NavLink>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/portal/my-bookings" className={navLinkClass} onClick={handleMobileDismiss}>
              <CarFront size={20} className={collapsed ? "mx-auto" : ""} />
              {!collapsed && <span>Booking</span>}
            </NavLink>
          )}

          {/* Admin Explicit Menus */}
          {isAdmin && (
            <>
              <NavLink to="/portal/instructors" className={navLinkClass} onClick={handleMobileDismiss}>
                <Users size={20} className={collapsed ? "mx-auto" : ""} />
                {!collapsed && <span>Instructors</span>}
              </NavLink>

              <NavLink to="/portal/packages" className={navLinkClass} onClick={handleMobileDismiss}>
                <Archive size={20} className={collapsed ? "mx-auto" : ""} />
                {!collapsed && <span>Packages</span>}
              </NavLink>
            </>
          )}

          {/* Holidays */}
          {(isAdmin || isInstructor) && (
            <NavLink to="/portal/holidays" className={navLinkClass} onClick={handleMobileDismiss}>
              <CalendarDays size={20} className={collapsed ? "mx-auto" : ""} />
              {!collapsed && <span>Leave / Blocks</span>}
            </NavLink>
          )}
        </nav>
      </aside>
    </>
  );
}
