import { createMocks } from 'node-mocks-http';
import handler from '../search';
import { connectDB } from '../../../lib/database';
import { Category, Listing } from '../../../lib/models';

// Mock the database connection and models
jest.mock('../../../lib/database');
jest.mock('../../../lib/models');

const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>;
const mockCategory = Category as jest.Mocked<typeof Category>;
const mockListing = Listing as jest.Mocked<typeof Listing>;

describe('/api/search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectDB.mockResolvedValue();
  });

  it('returns 405 for non-GET requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it('handles search with query parameter', async () => {
    const mockResults = [
      {
        _id: '507f1f77bcf86cd799439011',
        title: 'Samsung TV',
        description: 'Great TV',
        price: 50000,
        location: 'Mumbai',
        attributes: {},
        category: { name: 'Televisions', slug: 'televisions' },
        createdAt: new Date(),
        isActive: true,
      },
    ];

    const mockAggregateResult = [
      {
        results: mockResults,
        totalCount: [{ count: 1 }],
        facet_location: [{ _id: 'Mumbai', count: 1 }],
        facet_priceRanges: [{ _id: 50000, count: 1 }],
      },
    ];

    mockListing.aggregate = jest.fn().mockResolvedValue(mockAggregateResult);
    mockCategory.findOne = jest.fn().mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        q: 'Samsung TV',
        page: '1',
        limit: '12',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.results).toHaveLength(1);
    expect(data.results[0].title).toBe('Samsung TV');
    expect(data.pagination.total).toBe(1);
  });

  it('handles search with category filter', async () => {
    const mockCategory = {
      _id: '507f1f77bcf86cd799439012',
      name: 'Televisions',
      slug: 'televisions',
      attributeSchema: {
        brand: {
          type: 'string',
          label: 'Brand',
          options: ['Samsung', 'LG'],
          filterable: true,
        },
      },
    };

    const mockAggregateResult = [
      {
        results: [],
        totalCount: [{ count: 0 }],
        facet_brand: [{ _id: 'Samsung', count: 5 }],
        facet_location: [],
        facet_priceRanges: [],
      },
    ];

    mockCategory.findOne = jest.fn().mockResolvedValue(mockCategory);
    mockListing.aggregate = jest.fn().mockResolvedValue(mockAggregateResult);

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        category: 'televisions',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.facets.brand).toBeDefined();
    expect(data.facets.brand.options).toHaveLength(1);
  });

  it('handles search with filters', async () => {
    const mockAggregateResult = [
      {
        results: [],
        totalCount: [{ count: 0 }],
        facet_location: [],
        facet_priceRanges: [],
      },
    ];

    mockListing.aggregate = jest.fn().mockResolvedValue(mockAggregateResult);
    mockCategory.findOne = jest.fn().mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        filters: JSON.stringify({ brand: 'Samsung', priceMin: 1000 }),
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockListing.aggregate).toHaveBeenCalled();

    // Check that the aggregation pipeline includes the filters
    const aggregateCall = mockListing.aggregate.mock.calls[0][0];
    const matchStage = aggregateCall.find((stage: any) => stage.$match);
    expect(matchStage.$match['attributes.brand']).toBe('Samsung');
    expect(matchStage.$match.price.$gte).toBe(1000);
  });

  it('handles pagination parameters', async () => {
    const mockAggregateResult = [
      {
        results: [],
        totalCount: [{ count: 100 }],
        facet_location: [],
        facet_priceRanges: [],
      },
    ];

    mockListing.aggregate = jest.fn().mockResolvedValue(mockAggregateResult);

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        page: '2',
        limit: '10',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.limit).toBe(10);
    expect(data.pagination.total).toBe(100);
    expect(data.pagination.totalPages).toBe(10);
  });

  it('handles database errors gracefully', async () => {
    mockConnectDB.mockRejectedValue(new Error('Database connection failed'));

    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Internal server error during search operation');
  });
});
