import Head from 'next/head';
import Link from 'next/link';
import { Search, Zap, Shield, TrendingUp } from 'lucide-react';

export default function Home() {
    return (
        <>
            <Head>
                <title>B2B Marketplace - Find Business Products & Services</title>
                <meta name="description" content="Discover thousands of business products and services." />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">B2B Marketplace</h1>
                            <nav className="flex space-x-4">
                                <Link href="/search" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                    Search
                                </Link>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                            Find Business Solutions
                            <span className="block text-blue-600">With Smart Search</span>
                        </h2>
                        <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
                            Discover thousands of business products and services with our advanced search engine.
                        </p>

                        <div className="mt-8">
                            <Link
                                href="/search"
                                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
                            >
                                <Search className="mr-2" size={20} />
                                Start Searching
                            </Link>
                        </div>

                        {/* Quick Search Examples */}
                        <div className="mt-8">
                            <p className="text-sm text-gray-500 mb-4">Popular searches:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {['Samsung TVs', 'Running Shoes', 'Industrial Pumps', 'Under ₹10,000'].map((term) => (
                                    <Link
                                        key={term}
                                        href={`/search?q=${encodeURIComponent(term)}`}
                                        className="bg-white bg-opacity-50 hover:bg-opacity-75 px-4 py-2 rounded-full text-sm text-gray-700 transition-colors"
                                    >
                                        {term}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="mt-24">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white mx-auto mb-4">
                                    <Zap size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Smart Search</h3>
                                <p className="text-gray-600">Natural language search with intelligent intent extraction.</p>
                            </div>

                            <div className="text-center">
                                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-green-500 text-white mx-auto mb-4">
                                    <Shield size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Dynamic Filters</h3>
                                <p className="text-gray-600">Context-aware filtering that adapts to each product category.</p>
                            </div>

                            <div className="text-center">
                                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-purple-500 text-white mx-auto mb-4">
                                    <TrendingUp size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Best Results</h3>
                                <p className="text-gray-600">Advanced ranking algorithm delivers the most relevant products.</p>
                            </div>
                        </div>
                    </div>

                    {/* Category Preview */}
                    <div className="mt-24">
                        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Browse by Category</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { name: 'Televisions', slug: 'televisions', description: 'Smart TVs, LEDs, OLEDs and more', count: '200+ products' },
                                { name: 'Running Shoes', slug: 'running-shoes', description: 'Athletic footwear for all activities', count: '150+ products' },
                                { name: 'Industrial Pumps', slug: 'industrial-pumps', description: 'Commercial and industrial pump solutions', count: '100+ products' }
                            ].map((category) => (
                                <Link
                                    key={category.slug}
                                    href={`/search?category=${category.slug}`}
                                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                                >
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h4>
                                    <p className="text-gray-600 mb-2">{category.description}</p>
                                    <p className="text-sm text-blue-600 font-medium">{category.count}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}