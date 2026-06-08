import { useCompany } from '../../context/CompanyContext';

interface TopBarProps {
    linkTo?: string;
    linkLabel?: string;
}

export default function TopBar({ linkTo = '/', linkLabel = 'Home' }: TopBarProps) {

    const { company } = useCompany() ?? null;

    const phone = company?.contactNumber || '';
    const email = company?.contactEmail || '';

    return (
        <div className="bg-gray-950 text-white text-sm py-2 z-50 shrink-0">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="flex space-x-4">
                    <span>📞{phone}</span>
                    <span>📥{email}</span>
                </div>
                <div className="ml-auto flex items-center space-x-6">
                    <span className="hidden sm:block">⏰ Mon - Sat : 8AM - 6PM</span>
                    {/* Cross-app link (login lives in booking-admin). Always a full
                        navigation so a relative path (subpath hosting) is handled by
                        the edge rewrite rather than the website's client router. */}
                    <a
                        href={linkTo}
                        className="hover:text-primary transition-colors underline uppercase font-bold tracking-wide"
                    >
                        {linkLabel}
                    </a>
                </div>
            </div>
        </div>
    );
}
