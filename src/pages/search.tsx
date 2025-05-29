import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useDebounce } from 'use-debounce';
import Head from 'next/head';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ResultsGrid from '../components/ResultsGrid';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';

interface SearchResponse {
    results: any[];
    facets: {
        [key: string]: {
            label: string;
            type: string;
            options: Array<{
                value: string;
                label: string;
                count: number;
            }>;
        };
    };
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

interface SearchPageProps {
    categories: Array<{
        name: string;
        slug: string;
        attributeSchema: Record<string, any>;
    }>;
}

export default function SearchPage({ categories }: SearchPageProps) {
    const router = useRouter();
    const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Search state - keep these simple
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('relevance');

    // Debounced search query - only debounce the query
    const [debouncedQuery] = useDebounce(query, 300);

    // Initialize from URL on mount
    useEffect(() => {
        const { q, category: cat, filters: filtersParam, page: pageParam, sort } = router.query;

        if (q && typeof q === 'string') setQuery(q);
        if (cat && typeof cat === 'string') setCategory(cat);
        if (pageParam && typeof pageParam === 'string') setPage(parseInt(pageParam) || 1);
        if (sort && typeof sort === 'string') setSortBy(sort);

        if (filtersParam && typeof filtersParam === 'string') {
            try {
                setFilters(JSON.parse(filtersParam));
            } catch (e) {
                console.warn('Invalid filters in URL');
                setFilters({});
            }
        }
    }, [router.query]);

    // Memoize search parameters to prevent unnecessary re-renders
    const searchParams = useMemo(() => ({
        q: debouncedQuery,
        category,
        filters,
        page,
        sort: sortBy
    }), [debouncedQuery, category, filters, page, sortBy]);

    // Perform search function
    const performSearch = useCallback(async (params: typeof searchParams) => {
        setLoading(true);
        setError(null);

        try {
            const urlParams = new URLSearchParams();

            if (params.q) urlParams.set('q', params.q);
            if (params.category) urlParams.set('category', params.category);
            if (Object.keys(params.filters).length > 0) {
                urlParams.set('filters', JSON.stringify(params.filters));
            }
            urlParams.set('page', params.page.toString());
            urlParams.set('sort', params.sort);

            const response = await fetch(`/api/search?${urlParams.toString()}`);

            if (!response.ok) {
                throw new Error(`Search failed: ${response.statusText}`);
            }

            const data: SearchResponse = await response.json();
            setSearchResults(data);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Trigger search when parameters change
    useEffect(() => {
        performSearch(searchParams);
    }, [searchParams, performSearch]);

    // Update URL without causing re-render
    const updateUrl = useCallback((newParams: Record<string, any>) => {
        const updatedQuery = { ...router.query, ...newParams };

        Object.keys(updatedQuery).forEach(key => {
            if (!updatedQuery[key] || updatedQuery[key] === '') {
                delete updatedQuery[key];
            }
        });

        router.replace(
            {
                pathname: '/search',
                query: updatedQuery
            },
            undefined,
            { shallow: true }
        );
    }, [router]);

    // Event handlers - these update state immediately for responsive UI
    const handleSearchChange = useCallback((newQuery: string) => {
        setQuery(newQuery);
        setPage(1);
        updateUrl({ q: newQuery || undefined, page: 1 });
    }, [updateUrl]);

    const handleCategoryChange = useCallback((newCategory: string) => {
        setCategory(newCategory);
        setFilters({});
        setPage(1);
        updateUrl({
            category: newCategory || undefined,
            filters: undefined,
            page: 1
        });
    }, [updateUrl]);

    const handleFilterChange = useCallback((key: string, value: any) => {
        const newFilters = { ...filters };

        if (value === null || value === undefined || value === '') {
            delete newFilters[key];
        } else {
            newFilters[key] = value;
        }

        setFilters(newFilters);
        setPage(1);
        updateUrl({
            filters: Object.keys(newFilters).length > 0 ? JSON.stringify(newFilters) : undefined,
            page: 1
        });
    }, [filters, updateUrl]);

    const handleClearFilters = useCallback(() => {
        setFilters({});
        setPage(1);
        updateUrl({ filters: undefined, page: 1 });
    }, [updateUrl]);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        updateUrl({ page: newPage });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [updateUrl]);

    const handleSortChange = useCallback((newSort: string) => {
        setSortBy(newSort);
        setPage(1);
        updateUrl({ sort: newSort, page: 1 });
    }, [updateUrl]);

    const selectedCategory = categories.find(cat => cat.slug === category);
    const hasFilters = Object.keys(filters).length > 0;

    return (
        <ErrorBoundary>
            <Head>
                <title>Search B2B Marketplace | Find Business Products & Services</title>
                <meta name="description" content="Search through thousands of business products and services." />
            </Head>

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">
                                B2B Marketplace
                            </h1>
                            <div className="text-sm text-gray-500">
                                {searchResults && `${searchResults.pagination.total} results`}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Search Section */}
                <section className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <SearchBar
                            query={query}
                            onSearchChange={handleSearchChange}
                            categories={categories}
                            selectedCategory={category}
                            onCategoryChange={handleCategoryChange}
                            loading={loading}
                        />
                    </div>
                </section>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filters Sidebar */}
                        <div className="lg:w-64 flex-shrink-0">
                            <div className="sticky top-4">
                                <FilterPanel
                                    facets={searchResults?.facets || {}}
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                    onClearFilters={handleClearFilters}
                                    hasFilters={hasFilters}
                                    loading={loading}
                                />
                            </div>
                        </div>

                        {/* Results Section */}
                        <div className="flex-1">
                            {/* Results Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {debouncedQuery ? `Results for "${debouncedQuery}"` : 'All Products'}
                                    </h2>
                                    {selectedCategory && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {selectedCategory.name}
                                        </span>
                                    )}
                                </div>

                                {/* Sort Options */}
                                <div className="flex items-center gap-2">
                                    <label htmlFor="sort" className="text-sm text-gray-600">
                                        Sort by:
                                    </label>
                                    <select
                                        id="sort"
                                        value={sortBy}
                                        onChange={(e) => handleSortChange(e.target.value)}
                                        className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="relevance">Relevance</option>
                                        <option value="newest">Newest First</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                    </select>
                                </div>
                            </div>

                            {/* Error State */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                                    <div className="text-red-800">
                                        <h3 className="text-sm font-medium">Search Error</h3>
                                        <p className="text-sm mt-1">{error}</p>
                                    </div>
                                    <button
                                        onClick={() => performSearch(searchParams)}
                                        className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}

                            {/* Loading State */}
                            {loading && (
                                <div className="flex justify-center items-center py-12">
                                    <LoadingSpinner size="large" />
                                </div>
                            )}

                            {/* Results Grid */}
                            {!loading && searchResults && (
                                <>
                                    <ResultsGrid
                                        results={searchResults.results}
                                        loading={false}
                                    />

                                    {/* Pagination */}
                                    {searchResults.pagination.totalPages > 1 && (
                                        <div className="mt-8">
                                            <Pagination
                                                currentPage={searchResults.pagination.page}
                                                totalPages={searchResults.pagination.totalPages}
                                                onPageChange={handlePageChange}
                                                hasNext={searchResults.pagination.hasNext}
                                                hasPrev={searchResults.pagination.hasPrev}
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            {/* No Results */}
                            {!loading && searchResults && searchResults.results.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 mb-4">
                                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                                    <p className="text-gray-600 mb-4">
                                        Try adjusting your search terms or filters
                                    </p>
                                    {hasFilters && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                                        >
                                            Clear All Filters
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </ErrorBoundary>
    );
}

// Server-side props to fetch categories
export async function getServerSideProps() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/categories`);

        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }

        const data = await response.json();

        return {
            props: {
                categories: data.categories || []
            }
        };
    } catch (error) {
        console.error('Error fetching categories:', error);
        return {
            props: {
                categories: []
            }
        };
    }
}