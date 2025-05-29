import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from '../SearchBar';

const mockCategories = [
    {
        name: 'Televisions',
        slug: 'televisions',
        attributeSchema: {}
    },
    {
        name: 'Running Shoes',
        slug: 'running-shoes',
        attributeSchema: {}
    }
];

describe('SearchBar', () => {
    const defaultProps = {
        query: '',
        onSearchChange: jest.fn(),
        categories: mockCategories,
        selectedCategory: '',
        onCategoryChange: jest.fn(),
        loading: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders search input and categories', () => {
        render(<SearchBar {...defaultProps} />);

        expect(screen.getByPlaceholderText(/search for products/i)).toBeInTheDocument();
        expect(screen.getByText('All Categories')).toBeInTheDocument();
        expect(screen.getByText('Televisions')).toBeInTheDocument();
        expect(screen.getByText('Running Shoes')).toBeInTheDocument();
    });

    it('calls onSearchChange when typing in search input', async () => {
        render(<SearchBar {...defaultProps} />);

        const searchInput = screen.getByPlaceholderText(/search for products/i);
        fireEvent.change(searchInput, { target: { value: 'test query' } });

        expect(defaultProps.onSearchChange).toHaveBeenCalledWith('test query');
    });

    it('calls onCategoryChange when category is selected', () => {
        render(<SearchBar {...defaultProps} />);

        const tvCategory = screen.getByText('Televisions');
        fireEvent.click(tvCategory);

        expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('televisions');
    });

    it('shows clear button when query exists', () => {
        render(<SearchBar {...defaultProps} query="test" />);

        expect(screen.getByTitle('Clear search')).toBeInTheDocument();
    });

    it('clears search when clear button is clicked', () => {
        render(<SearchBar {...defaultProps} query="test" />);

        const clearButton = screen.getByTitle('Clear search');
        fireEvent.click(clearButton);

        expect(defaultProps.onSearchChange).toHaveBeenCalledWith('');
    });
});
