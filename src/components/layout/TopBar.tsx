import { Link } from 'react-router-dom';
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
        <div className="bg-gray-900 text-white text-sm py-2 z-50 shrink-0">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="flex space-x-4">
                    <span>📞{phone}</span>
                    <span>📥{email}</span>
                </div>
                <div className="ml-auto flex items-center space-x-6">
                    <span className="hidden sm:block">⏰ Mon - Sat : 8AM - 6PM</span>
                    <Link
                        to={linkTo}
                        className="hover:text-primary transition-colors underline uppercase font-bold tracking-wide"
                    >
                        {linkLabel}
                    </Link>
                </div>
            </div>
        </div>
    );
}
