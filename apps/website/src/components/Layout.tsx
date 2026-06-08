import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';
import TopBar from './layout/TopBar';
import { useCompany } from '../context/CompanyContext';
import { loginUrl, bookingUrl } from '../config';


export default function Layout() {
  const { user } = useAuth();
  const {company} = useCompany() ?? null;

  const location = useLocation();

  const showFullNav = !user || location.pathname === '/';
  const isPortal = location.pathname.startsWith('/portal');

  return (
    <div className={isPortal ? "h-screen flex flex-col bg-surface overflow-hidden" : "min-h-screen bg-white flex flex-col"}>
      <div className="sticky top-0 z-50 w-full">
        {/* Top Bar */}
        <TopBar linkTo={loginUrl()} linkLabel="Login" />

        {/* Main Header */}
        {!isPortal && (
          <header className="glass border-b border-line">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
              <Link to="/" className="text-2xl font-extrabold tracking-tight text-primary" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                {company?.logoUrl ? <img src={company?.logoUrl} alt="Logo" className="h-12 w-auto max-w-[160px] object-contain shrink-0" /> : <span>{company?.name || ''}</span>}
              </Link>

              <div className="hidden md:flex items-center gap-8">
                <nav className="flex items-center gap-1 text-sm font-medium text-muted">
                  <Link to="/" className="rounded-full px-3 py-2 transition-colors hover:text-ink" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    Home
                  </Link>
                  {showFullNav && (
                    <>
                      <a href="/#about" className="rounded-full px-3 py-2 transition-colors hover:text-ink">About</a>
                      <a href="/#packages" className="rounded-full px-3 py-2 transition-colors hover:text-ink">Packages</a>
                      <a href="/#testimonial" className="rounded-full px-3 py-2 transition-colors hover:text-ink">Testimonials</a>
                      <a href="/#contact" className="rounded-full px-3 py-2 transition-colors hover:text-ink">Contact</a>
                    </>
                  )}
                </nav>
                {showFullNav && (
                  <a
                    href={bookingUrl()}
                    className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:opacity-95"
                  >
                    Book a Lesson
                  </a>
                )}
              </div>

              <div className="md:hidden">
                <a
                  href={bookingUrl()}
                  className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm"
                >
                  Book
                </a>
              </div>
            </div>
          </header>
        )}
      </div>

      <main className={isPortal ? "flex-grow flex flex-col overflow-hidden" : "flex-grow"}>
        <Outlet />
      </main>
      {!isPortal && <Footer />}
      {/* <ChatWidget /> */}
    </div>
  );
}
