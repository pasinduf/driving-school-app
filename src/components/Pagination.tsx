import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <button
                        key={i}
                        onClick={() => onPageChange(i)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-colors duration-200 ${currentPage === i
                                ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
                                : 'text-gray-900 bg-white hover:bg-gray-100'
                            }`}
                    >
                        {i}
                    </button>
                );
            }
        } else {
            // Always show first, last, and window around current
            const leftBoundary = Math.max(2, currentPage - 1);
            const rightBoundary = Math.min(totalPages - 1, currentPage + 1);

            pages.push(
                <button
                    key={1}
                    onClick={() => onPageChange(1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-colors duration-200 ${currentPage === 1
                            ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
                            : 'text-gray-900 bg-white hover:bg-gray-100'
                        }`}
                >
                    1
                </button>
            );

            if (leftBoundary > 2) {
                pages.push(
                    <span key="left-ellipsis" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white cursor-default">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </span>
                );
            }

            for (let i = leftBoundary; i <= rightBoundary; i++) {
                pages.push(
                    <button
                        key={i}
                        onClick={() => onPageChange(i)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-colors duration-200 ${currentPage === i
                                ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
                                : 'text-gray-900 bg-white hover:bg-gray-100'
                            }`}
                    >
                        {i}
                    </button>
                );
            }

            if (rightBoundary < totalPages - 1) {
                pages.push(
                    <span key="right-ellipsis" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white cursor-default">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </span>
                );
            }

            pages.push(
                <button
                    key={totalPages}
                    onClick={() => onPageChange(totalPages)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-colors duration-200 ${currentPage === totalPages
                            ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
                            : 'text-gray-900 bg-white hover:bg-gray-100'
                        }`}
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg mt-1 shadow-sm">
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-500">
                        Showing page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm ring-1 ring-inset ring-gray-300" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 focus:z-20 hover:bg-gray-100 hover:text-gray-600 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>

                        {/* Page Numbers */}
                        {renderPageNumbers()}

                        <button
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 focus:z-20 hover:bg-gray-100 hover:text-gray-600 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}
