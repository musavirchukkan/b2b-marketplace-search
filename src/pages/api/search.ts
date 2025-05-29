import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../lib/database';
import { Category, Listing } from '../../lib/models';
import mongoose from 'mongoose';

export interface SearchResponse {
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
  query: {
    q?: string;
    category?: string;
    filters?: Record<string, any>;
  };
}

interface SearchFilters {
  [key: string]: string | string[] | number | boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Parse query parameters
    const {
      q = '',
      category = '',
      filters: filtersParam = '{}',
      page = '1',
      limit = '12',
      sort = 'relevance',
    } = req.query;

    const searchQuery = typeof q === 'string' ? q.trim() : '';
    const categorySlug = typeof category === 'string' ? category.trim() : '';
    const currentPage = Math.max(1, parseInt(typeof page === 'string' ? page : '1'));
    const pageLimit = Math.min(50, Math.max(1, parseInt(typeof limit === 'string' ? limit : '12')));

    let filters: SearchFilters = {};
    try {
      filters = JSON.parse(typeof filtersParam === 'string' ? filtersParam : '{}');
    } catch (e) {
      console.warn('Invalid filters JSON:', filtersParam);
    }

    // Build MongoDB aggregation pipeline
    const pipeline: any[] = [];

    // Match active listings
    const matchStage: any = { isActive: true };

    // Add text search if query provided
    if (searchQuery) {
      matchStage.$text = { $search: searchQuery };
    }

    // Add category filter if provided
    if (categorySlug) {
      const categoryDoc = await Category.findOne({ slug: categorySlug });
      if (categoryDoc) {
        matchStage.categoryId = categoryDoc._id;
      }
    }

    // Add attribute filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'priceMin' || key === 'priceMax') {
          if (!matchStage.price) matchStage.price = {};
          if (key === 'priceMin') matchStage.price.$gte = Number(value);
          if (key === 'priceMax') matchStage.price.$lte = Number(value);
        } else if (key === 'location') {
          matchStage.location = new RegExp(String(value), 'i');
        } else if (key === 'priceRange') {
          // Handle predefined price ranges
          const priceRanges: Record<string, { min: number; max?: number }> = {
            '0': { min: 0, max: 1000 },
            '1000': { min: 1000, max: 5000 },
            '5000': { min: 5000, max: 10000 },
            '10000': { min: 10000, max: 25000 },
            '25000': { min: 25000, max: 50000 },
            '50000': { min: 50000, max: 100000 },
            '100000': { min: 100000 },
          };

          const range = priceRanges[String(value)];
          if (range) {
            if (!matchStage.price) matchStage.price = {};
            matchStage.price.$gte = range.min;
            if (range.max) matchStage.price.$lt = range.max;
          }
        } else {
          // Handle attribute filters
          const attributeKey = `attributes.${key}`;
          if (Array.isArray(value)) {
            matchStage[attributeKey] = { $in: value };
          } else {
            matchStage[attributeKey] = String(value);
          }
        }
      }
    });

    pipeline.push({ $match: matchStage });

    // Add lookup for category information
    pipeline.push({
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category',
      },
    });

    pipeline.push({
      $unwind: '$category',
    });

    // Add sorting
    let sortStage: any = {};
    switch (sort) {
      case 'price_asc':
        sortStage = { price: 1 };
        break;
      case 'price_desc':
        sortStage = { price: -1 };
        break;
      case 'newest':
        sortStage = { createdAt: -1 };
        break;
      case 'oldest':
        sortStage = { createdAt: 1 };
        break;
      case 'relevance':
      default:
        if (searchQuery) {
          sortStage = { score: { $meta: 'textScore' }, createdAt: -1 };
        } else {
          sortStage = { createdAt: -1 };
        }
    }

    // Create facets pipeline for counting
    const facetPipeline = [...pipeline];

    // Add facet aggregation
    const facetStage: any = {
      results: [
        { $sort: sortStage },
        { $skip: (currentPage - 1) * pageLimit },
        { $limit: pageLimit },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            price: 1,
            location: 1,
            attributes: 1,
            images: 1,
            tags: 1,
            createdAt: 1,
            'category.name': 1,
            'category.slug': 1,
            score: searchQuery ? { $meta: 'textScore' } : '$$REMOVE',
          },
        },
      ],
      totalCount: [{ $count: 'count' }],
    };

    // Get category for facet generation
    let categoryDoc = null;
    if (categorySlug) {
      categoryDoc = await Category.findOne({ slug: categorySlug });
    }

    // Add facet calculations for filterable attributes
    if (categoryDoc) {
      Object.entries(categoryDoc.attributeSchema).forEach(([attrKey, attrConfig]) => {
        if (attrConfig.filterable && attrConfig.options) {
          facetStage[`facet_${attrKey}`] = [
            {
              $group: {
                _id: `$attributes.${attrKey}`,
                count: { $sum: 1 },
              },
            },
            { $match: { _id: { $ne: null, $exists: true } } },
            { $sort: { count: -1 } },
          ];
        }
      });
    }

    // Add price range facet
    facetStage.facet_priceRanges = [
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 1000, 5000, 10000, 25000, 50000, 100000, Infinity],
          default: 'Other',
          output: { count: { $sum: 1 } },
        },
      },
    ];

    // Add location facet
    facetStage.facet_location = [
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 },
        },
      },
      { $match: { _id: { $ne: null, $exists: true } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ];

    // Add brand facet (common across categories)
    facetStage.facet_brand = [
      {
        $group: {
          _id: '$attributes.brand',
          count: { $sum: 1 },
        },
      },
      { $match: { _id: { $ne: null, $exists: true } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ];

    pipeline.push({ $facet: facetStage });

    // Execute aggregation
    const [aggregationResult] = await Listing.aggregate(pipeline);

    const results = aggregationResult.results || [];
    const totalCount = aggregationResult.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / pageLimit);

    // Build facets response
    const facets: SearchResponse['facets'] = {};

    // Add category-specific facets
    if (categoryDoc) {
      Object.entries(categoryDoc.attributeSchema).forEach(([attrKey, attrConfig]) => {
        if (attrConfig.filterable && aggregationResult[`facet_${attrKey}`]) {
          facets[attrKey] = {
            label: attrConfig.label,
            type: attrConfig.type,
            options: aggregationResult[`facet_${attrKey}`]
              .filter((item: any) => item._id)
              .map((item: any) => ({
                value: item._id,
                label: item._id,
                count: item.count,
              })),
          };
        }
      });
    }

    // Add brand facet (common across all categories)
    if (aggregationResult.facet_brand && aggregationResult.facet_brand.length > 0) {
      facets.brand = {
        label: 'Brand',
        type: 'string',
        options: aggregationResult.facet_brand
          .filter((item: any) => item._id)
          .map((item: any) => ({
            value: item._id,
            label: item._id,
            count: item.count,
          })),
      };
    }

    // Add price range facet
    if (aggregationResult.facet_priceRanges) {
      const priceRangeLabels: Record<string, string> = {
        '0': 'Under ₹1,000',
        '1000': '₹1,000 - ₹5,000',
        '5000': '₹5,000 - ₹10,000',
        '10000': '₹10,000 - ₹25,000',
        '25000': '₹25,000 - ₹50,000',
        '50000': '₹50,000 - ₹1,00,000',
        '100000': 'Above ₹1,00,000',
      };

      facets.priceRange = {
        label: 'Price Range',
        type: 'string',
        options: aggregationResult.facet_priceRanges
          .filter((item: any) => item.count > 0)
          .map((item: any) => ({
            value: String(item._id),
            label: priceRangeLabels[String(item._id)] || `₹${item._id}+`,
            count: item.count,
          })),
      };
    }

    // Add location facet
    if (aggregationResult.facet_location) {
      facets.location = {
        label: 'Location',
        type: 'string',
        options: aggregationResult.facet_location.map((item: any) => ({
          value: item._id,
          label: item._id,
          count: item.count,
        })),
      };
    }

    // Build response
    const response: SearchResponse = {
      results: results.map((listing: any) => ({
        _id: listing._id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        location: listing.location,
        attributes: listing.attributes,
        images: listing.images || [],
        tags: listing.tags || [],
        category: {
          name: listing.category.name,
          slug: listing.category.slug,
        },
        createdAt: listing.createdAt,
        score: listing.score,
      })),
      facets,
      pagination: {
        page: currentPage,
        limit: pageLimit,
        total: totalCount,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
      },
      query: {
        q: searchQuery || undefined,
        category: categorySlug || undefined,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({
      error: 'Internal server error during search operation',
    });
  }
}
