import { Phone, Mail, MapPin } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

export default function Footer() {

  const { company } = useCompany() ?? null;

  const companyName = company?.name || '';
  const phone = company?.contactNumber || '';
  const email = company?.contactEmail || '';
  const address = company?.address || '';

  // Always render all four platforms; only the ones with a configured URL link out.
  const socials = [
    { label: 'Facebook', url: company?.facebookUrl, Icon: FacebookIcon },
    { label: 'Instagram', url: company?.instagramUrl, Icon: InstagramIcon },
    { label: 'Twitter / X', url: company?.twitterUrl, Icon: XIcon },
    { label: 'TikTok', url: company?.tiktokUrl, Icon: TikTokIcon },
  ];

  return (
    <footer id="contact" className="border-t-4 border-primary bg-gray-900 text-white pt-12 pb-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-12 mb-8">
          {/* Brand Column */}
          <div className="max-w-sm">
            <span className="text-3xl font-bold text-white tracking-tight inline-block mb-6">
              {companyName}
            </span>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Empowering new drivers with confidence and safety skills for a lifetime of journey. Join us today.
            </p>
            <div className="flex space-x-3">
              {socials.map(({ label, url, Icon }) =>
                url ? (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="grid h-10 w-10 place-items-center rounded-full bg-gray-800 text-white transition-all hover:-translate-y-0.5 hover:bg-primary"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                ) : (
                  <span
                    key={label}
                    aria-label={`${label} (not configured)`}
                    title={`${label} not configured`}
                    aria-disabled="true"
                    className="grid h-10 w-10 cursor-default place-items-center rounded-full bg-gray-800 text-white opacity-40"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Quick Links (Hidden) */}
          {/* 
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider border-l-4 border-primary pl-4">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block flex items-center">
                                    <ArrowRight size={14} className="mr-2 text-primary" /> Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/booking" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block flex items-center">
                                    <ArrowRight size={14} className="mr-2 text-primary" /> Book Lesson
                                </Link>
                            </li>
                        </ul>
                    </div>
                    */}

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider border-l-4 border-primary pl-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="text-primary mt-1 mr-4 shrink-0" size={20} />
                <span className="text-gray-400">{address}</span>
              </li>
              <li className="flex items-center">
                <Phone className="text-primary mr-4 shrink-0" size={20} />
                <span className="text-gray-400">{phone}</span>
              </li>
              <li className="flex items-center">
                <Mail className="text-primary mr-4 shrink-0" size={20} />
                <span className="text-gray-400">{email}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          {/* <div>
                        <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider border-l-4 border-primary pl-4">Newsletter</h3>
                        <p className="text-gray-400 mb-4">Subscribe to get latest updates and offers.</p>
                        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Your Email Address"
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-primary text-gray-300 placeholder-gray-500"
                            />
                            <button className="w-full px-4 py-3 bg-primary text-white font-bold rounded hover:opacity-90 transition-colors uppercase tracking-widest">
                                Subscribe
                            </button>
                        </form>
                    </div> */}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} {companyName} . All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* Inline brand SVGs (lucide's brand icons are deprecated). currentColor-driven. */
type IconProps = { className?: string };

function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.49 17.52 2 12 2S2 6.49 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817-5.967 6.817H1.68l7.73-8.835L1.254 2.25h6.83l4.713 6.231 5.447-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function TikTokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.6 5.82a4.28 4.28 0 0 1-1.05-2.82h-3.2v12.86a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.78.12V8.1a5.94 5.94 0 0 0-.78-.05A5.83 5.83 0 1 0 15.4 13.9V8.34a7.45 7.45 0 0 0 4.36 1.4V6.54a4.28 4.28 0 0 1-3.16-.72Z" />
    </svg>
  );
}
