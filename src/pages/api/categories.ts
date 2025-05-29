import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../lib/database';
import { Category } from '../../lib/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const categories = await Category.find(
      {},
      {
        name: 1,
        slug: 1,
        attributeSchema: 1,
      }
    ).sort({ name: 1 });

    res.status(200).json({
      categories: categories.map((cat) => ({
        name: cat.name,
        slug: cat.slug,
        attributeSchema: cat.attributeSchema,
      })),
    });
  } catch (error) {
    console.error('Categories API Error:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
    });
  }
}
