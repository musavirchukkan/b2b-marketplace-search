import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    hasNext: boolean;
    hasPrev: boolean;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    hasNext,
    hasPrev
}: PaginationProps) {
    const getVisiblePages = (): number[] => {
        const pages: number[] = [];
        const maxVisible = 7;

        if (totalPages <= maxVisible) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show pages around current page
            const start = Math.max(1, currentPage - 2);
            const end = Math.min(totalPages, currentPage + 2);

            // Always show first page
            if (start > 1) {
                pages.push(1);
                if (start > 2) {
                    pages.push(-1); // Ellipsis
                }
            }

            // Show pages around current
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            // Always show last page
            if (end < totalPages) {
                if (end < totalPages - 1) {
                    pages.push(-1); // Ellipsis
                }
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const visiblePages = getVisiblePages();

    if (totalPages <= 1) {
        return null;
    }

    return (
        <nav className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
            {/* Mobile View */}
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!hasPrev}
                    className={`relative inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${hasPrev
                            ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    <ChevronLeft size={16} className="mr-1" />
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!hasNext}
                    className={`relative ml-3 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${hasNext
                            ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    Next
                    <ChevronRight size={16} className="ml-1" />
                </button>
            </div>

            {/* Desktop View */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        {/* Previous Button */}
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={!hasPrev}
                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-sm font-medium ring-1 ring-inset ${hasPrev
                                    ? 'text-gray-900 ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                    : 'text-gray-400 ring-gray-200 cursor-not-allowed'
                                }`}
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft size={16} />
                        </button>

                        {/* Page Numbers */}
                        {visiblePages.map((page, index) => {
                            if (page === -1) {
                                return (
                                    <span
                                        key={`ellipsis-${index}`}
                                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            const isCurrentPage = page === currentPage;

                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset focus:z-20 focus:outline-offset-0 ${isCurrentPage
                                            ? 'z-10 bg-blue-600 text-white ring-blue-600 focus:ring-blue-600'
                                            : 'text-gray-900 ring-gray-300 hover:bg-gray-50 focus:ring-gray-300'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        {/* Next Button */}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={!hasNext}
                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-sm font-medium ring-1 ring-inset ${hasNext
                                    ? 'text-gray-900 ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                    : 'text-gray-400 ring-gray-200 cursor-not-allowed'
                                }`}
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRight size={16} />
                        </button>
                    </nav>
                </div>
            </div>
        </nav>
    );
}