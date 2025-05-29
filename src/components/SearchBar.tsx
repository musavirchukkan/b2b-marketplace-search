import { useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
    query: string;
    onSearchChange: (query: string) => void;
    categories: Array<{
        name: string;
        slug: string;
    }>;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    loading?: boolean;
}

export default function SearchBar({
    query,
    onSearchChange,
    categories,
    selectedCategory,
    onCategoryChange,
    loading = false
}: SearchBarProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle input change - simple and direct
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    // Clear search function
    const clearSearch = (e: React.MouseEvent) => {
        e.preventDefault();
        onSearchChange('');
        // Focus the input immediately
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Handle category change
    const handleCategoryChange = (categorySlug: string) => {
        onCategoryChange(categorySlug);
    };

    // Handle example click
    const handleExampleClick = (example: string) => {
        onSearchChange(example);
        // Focus input after setting example
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div className="space-y-4">
            {/* Category Selector */}
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => handleCategoryChange('')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCategory
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    All Categories
                </button>
                {categories.map((category) => (
                    <button
                        key={category.slug}
                        type="button"
                        onClick={() => handleCategoryChange(category.slug)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.slug
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center border-2 rounded-lg bg-white border-gray-200 hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20 shadow-sm transition-all">
                    <div className="pl-4 pr-2 flex items-center text-gray-400">
                        <Search
                            size={20}
                            className={loading ? 'animate-pulse text-blue-500' : ''}
                        />
                    </div>

                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        placeholder={
                            selectedCategory
                                ? `Search in ${categories.find(c => c.slug === selectedCategory)?.name || 'category'}...`
                                : 'Search for products, services, suppliers...'
                        }
                        className="flex-1 py-4 px-2 text-lg bg-transparent border-none outline-none placeholder-gray-400"
                        autoComplete="off"
                        spellCheck="false"
                    />

                    {query && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="pr-4 pl-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Clear search"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Loading indicator */}
                {loading && (
                    <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    </div>
                )}
            </form>

            {/* Search Examples */}
            {!query && (
                <div className="text-sm text-gray-500">
                    <span className="font-medium">Try searching:</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {[
                            'Samsung 55 inch',
                            'running shoes size 9',
                            'industrial pumps',
                            'under ₹10000'
                        ].map((example) => (
                            <button
                                key={example}
                                type="button"
                                onClick={() => handleExampleClick(example)}
                                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-xs transition-colors"
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Search Status */}
            {loading && query && (
                <div className="text-sm text-blue-600 flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent mr-2"></div>
                    Searching...
                </div>
            )}
        </div>
    );
}