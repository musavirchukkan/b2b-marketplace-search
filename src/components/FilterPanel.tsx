import { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';

interface FacetOption {
    value: string;
    label: string;
    count: number;
}

interface Facet {
    label: string;
    type: string;
    options: FacetOption[];
}

interface FilterPanelProps {
    facets: Record<string, Facet>;
    filters: Record<string, any>;
    onFilterChange: (key: string, value: any) => void;
    onClearFilters: () => void;
    hasFilters: boolean;
    loading?: boolean;
    categorySchema?: Record<string, any>;
}

export default function FilterPanel({
    facets,
    filters,
    onFilterChange,
    onClearFilters,
    hasFilters,
    loading = false,
    categorySchema = {}
}: FilterPanelProps) {
    const [expandedFacets, setExpandedFacets] = useState<Set<string>>(
        new Set(Object.keys(facets))
    );

    const toggleFacet = (facetKey: string) => {
        const newExpanded = new Set(expandedFacets);
        if (newExpanded.has(facetKey)) {
            newExpanded.delete(facetKey);
        } else {
            newExpanded.add(facetKey);
        }
        setExpandedFacets(newExpanded);
    };

    const handleCheckboxChange = (facetKey: string, value: string, checked: boolean) => {
        const currentValues = filters[facetKey];

        if (Array.isArray(currentValues)) {
            if (checked) {
                onFilterChange(facetKey, [...currentValues, value]);
            } else {
                onFilterChange(facetKey, currentValues.filter(v => v !== value));
            }
        } else {
            if (checked) {
                onFilterChange(facetKey, [value]);
            } else {
                onFilterChange(facetKey, null);
            }
        }
    };

    const isValueSelected = (facetKey: string, value: string): boolean => {
        const currentValues = filters[facetKey];
        if (Array.isArray(currentValues)) {
            return currentValues.includes(value);
        }
        return currentValues === value;
    };

    const renderFacetOptions = (facetKey: string, facet: Facet) => {
        const isExpanded = expandedFacets.has(facetKey);
        const visibleOptions = isExpanded ? facet.options : facet.options.slice(0, 5);
        const hasMore = facet.options.length > 5;

        return (
            <div className="space-y-2">
                {visibleOptions.map((option) => (
                    <label
                        key={option.value}
                        className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={isValueSelected(facetKey, option.value)}
                                onChange={(e) => handleCheckboxChange(facetKey, option.value, e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700 truncate">
                                {option.label}
                            </span>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                            {option.count}
                        </span>
                    </label>
                ))}

                {hasMore && (
                    <button
                        onClick={() => toggleFacet(facetKey)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 mt-2"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp size={16} className="mr-1" />
                                Show Less
                            </>
                        ) : (
                            <>
                                <ChevronDown size={16} className="mr-1" />
                                Show More ({facet.options.length - 5} more)
                            </>
                        )}
                    </button>
                )}
            </div>
        );
    };

    const renderPriceRangeFilter = (facet: Facet) => {
        return (
            <div className="space-y-2">
                {facet.options.map((option) => (
                    <label
                        key={option.value}
                        className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                        <div className="flex items-center">
                            <input
                                type="radio"
                                name="priceRange"
                                checked={filters.priceRange === option.value}
                                onChange={() => onFilterChange('priceRange', option.value)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                {option.label}
                            </span>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                            {option.count}
                        </span>
                    </label>
                ))}
            </div>
        );
    };

    const renderCustomPriceFilter = () => {
        return (
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label htmlFor="priceMin" className="block text-xs font-medium text-gray-700 mb-1">
                            Min Price
                        </label>
                        <input
                            type="number"
                            id="priceMin"
                            placeholder="₹0"
                            value={filters.priceMin || ''}
                            onChange={(e) => onFilterChange('priceMin', e.target.value ? Number(e.target.value) : null)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="priceMax" className="block text-xs font-medium text-gray-700 mb-1">
                            Max Price
                        </label>
                        <input
                            type="number"
                            id="priceMax"
                            placeholder="₹10,000"
                            value={filters.priceMax || ''}
                            onChange={(e) => onFilterChange('priceMax', e.target.value ? Number(e.target.value) : null)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                            <div className="space-y-2">
                                {[1, 2, 3].map((j) => (
                                    <div key={j} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                                            <div className="h-3 bg-gray-200 rounded w-20 ml-2 animate-pulse"></div>
                                        </div>
                                        <div className="h-3 bg-gray-200 rounded w-6 animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const facetEntries = Object.entries(facets);
    const hasFacets = facetEntries.length > 0;

    return (
        <div className="bg-white rounded-lg shadow-sm border">
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Filter size={18} className="text-gray-600 mr-2" />
                        <h3 className="font-semibold text-gray-900">Filters</h3>
                    </div>
                    {hasFilters && (
                        <button
                            onClick={onClearFilters}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                            <X size={16} className="mr-1" />
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Active Filters */}
            {hasFilters && (
                <div className="p-4 border-b bg-gray-50">
                    <div className="text-sm font-medium text-gray-700 mb-2">Active Filters:</div>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(filters).map(([key, value]) => {
                            if (!value || (Array.isArray(value) && value.length === 0)) return null;

                            const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
                            const facetLabel = facets[key]?.label || key;

                            return (
                                <span
                                    key={key}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                    {facetLabel}: {displayValue}
                                    <button
                                        onClick={() => onFilterChange(key, null)}
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Filter Options */}
            <div className="p-4">
                {!hasFacets ? (
                    <div className="text-sm text-gray-500 text-center py-4">
                        No filters available. Try searching for products first.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Custom Price Range */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                            {renderCustomPriceFilter()}
                        </div>

                        {/* Dynamic Facets */}
                        {facetEntries.map(([facetKey, facet]) => (
                            <div key={facetKey}>
                                <h4 className="font-medium text-gray-900 mb-3">
                                    {facet.label}
                                </h4>
                                {facetKey === 'priceRange' ?
                                    renderPriceRangeFilter(facet) :
                                    renderFacetOptions(facetKey, facet)
                                }
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}