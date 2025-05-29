import { MapPin, Tag, Clock } from 'lucide-react';

interface ResultItem {
    _id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    attributes: Record<string, any>;
    images?: string[];
    tags?: string[];
    category: {
        name: string;
        slug: string;
    };
    createdAt: string;
    score?: number;
}

interface ResultsGridProps {
    results: ResultItem[];
    loading?: boolean;
}

export default function ResultsGrid({ results, loading = false }: ResultsGridProps) {
    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays <= 7) return `${diffDays} days ago`;
        if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getHighlightedAttributes = (attributes: Record<string, any>): Array<{ key: string, value: string }> => {
        const priority = ['brand', 'size', 'color', 'screenSize', 'technology', 'material', 'pumpType'];
        const highlighted: Array<{ key: string, value: string }> = [];

        // Add priority attributes first
        priority.forEach(key => {
            if (attributes[key]) {
                highlighted.push({ key, value: String(attributes[key]) });
            }
        });

        // Add other attributes up to 4 total
        Object.entries(attributes).forEach(([key, value]) => {
            if (highlighted.length < 4 && !priority.includes(key) && value) {
                highlighted.push({ key, value: String(value) });
            }
        });

        return highlighted;
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border animate-pulse">
                        <div className="p-6">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="flex justify-between items-center">
                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
                <div className="text-gray-400 mb-4">
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m0 0V3" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => {
                const highlightedAttrs = getHighlightedAttributes(result.attributes);

                return (
                    <div
                        key={result._id}
                        className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 cursor-pointer group"
                        onClick={() => {
                            // Handle product click - could navigate to detail page
                            console.log('Product clicked:', result._id);
                        }}
                    >
                        {/* Image Placeholder */}
                        <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center">
                            {result.images && result.images.length > 0 ? (
                                <img
                                    src={result.images[0]}
                                    alt={result.title}
                                    className="w-full h-full object-cover rounded-t-lg"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="text-gray-400 text-center">
                                    <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm">No Image</span>
                                </div>
                            )}
                        </div>

                        <div className="p-6">
                            {/* Title */}
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {result.title}
                            </h3>

                            {/* Description */}
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {result.description}
                            </p>

                            {/* Price */}
                            <div className="text-2xl font-bold text-green-600 mb-3">
                                {formatPrice(result.price)}
                            </div>

                            {/* Attributes */}
                            {highlightedAttrs.length > 0 && (
                                <div className="mb-3">
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {highlightedAttrs.map((attr, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                            >
                                                {attr.value}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center">
                                    <MapPin size={14} className="mr-1" />
                                    <span>{result.location}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock size={14} className="mr-1" />
                                    <span>{formatDate(result.createdAt)}</span>
                                </div>
                            </div>

                            {/* Category Badge */}
                            <div className="mt-3 flex items-center justify-between">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <Tag size={12} className="mr-1" />
                                    {result.category.name}
                                </span>

                                {/* Search Score (for debugging) */}
                                {result.score && (
                                    <span className="text-xs text-gray-400">
                                        Score: {result.score.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {/* Tags */}
                            {result.tags && result.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {result.tags.slice(0, 3).map((tag, index) => (
                                        <span
                                            key={index}
                                            className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}