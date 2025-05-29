# B2B Marketplace Search Engine

A sophisticated full-stack B2B marketplace with intelligent search capabilities, dynamic filtering, and modern UI/UX. Built with Next.js, TypeScript, MongoDB, and advanced aggregation pipelines.

## 🚀 Features

### Core Functionality

- **Intelligent Search**: Full-text search with relevance scoring
- **Dynamic Faceted Filtering**: Category-aware filters that adapt to search context
- **Advanced Aggregation**: MongoDB aggregation pipelines for fast, accurate results
- **Real-time URL State**: Search parameters synced with URL for shareable links
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Technical Highlights

- **Type-Safe**: Full TypeScript implementation
- **Performance Optimized**: Efficient database indexing and query optimization
- **Error Boundaries**: Graceful error handling with React Error Boundaries
- **Testing**: Comprehensive unit and integration tests
- **SEO Ready**: Server-side rendering with Next.js

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS 3.4
- **Testing**: Jest, React Testing Library
- **Development**: Docker, ESLint, Prettier

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

## ⚡ Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd b2b-marketplace-search

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### 2. Start Database

```bash
# Start MongoDB with Docker
npm run docker:up

# Wait for MongoDB to be ready (check logs)
docker-compose logs -f mongodb
```

### 3. Seed Database

```bash
# Seed with sample data (30+ listings across 3 categories)
npm run seed
```

### 4. Start Development Server

```bash
# Start the development server
npm run dev
```

### 5. Access Application

- **Main App**: http://localhost:3000
- **Search Page**: http://localhost:3000/search

## 🗄️ Database Schema

### Categories Collection

```typescript
interface ICategory {
  name: string; // "Televisions"
  slug: string; // "televisions"
  attributeSchema: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'array';
      label: string; // Display name
      options?: string[]; // Predefined values
      required?: boolean; // Validation
      filterable?: boolean; // Enable faceting
    };
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Listings Collection

```typescript
interface IListing {
  title: string; // "Samsung 55\" QLED TV"
  description: string; // Product description
  price: number; // Price in INR
  location: string; // "Mumbai"
  categoryId: ObjectId; // Reference to category
  attributes: {
    // Dynamic attributes
    brand?: string; // "Samsung"
    screenSize?: string; // "55\""
    technology?: string; // "QLED"
    // ... other category-specific attributes
  };
  images?: string[]; // Image URLs
  tags?: string[]; // Search tags
  isActive: boolean; // Visibility flag
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔍 API Documentation

### GET /api/search

Advanced search endpoint with faceted filtering capabilities.

#### Query Parameters

| Parameter  | Type   | Description             | Example                                                        |
| ---------- | ------ | ----------------------- | -------------------------------------------------------------- |
| `q`        | string | Search query            | `"Samsung TV"`                                                 |
| `category` | string | Category filter         | `"televisions"`                                                |
| `filters`  | string | JSON-encoded filters    | `'{"brand":"Samsung","priceMax":50000}'`                       |
| `page`     | number | Page number (1-based)   | `1`                                                            |
| `limit`    | number | Items per page (max 50) | `12`                                                           |
| `sort`     | string | Sort option             | `"relevance"` \| `"price_asc"` \| `"price_desc"` \| `"newest"` |

#### Response Format

```typescript
interface SearchResponse {
  results: Array<{
    _id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    attributes: Record<string, any>;
    category: { name: string; slug: string };
    createdAt: string;
    score?: number; // Relevance score for text search
  }>;

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
```

#### Example Requests

**Basic Search:**

```bash
GET /api/search?q=Samsung%20TV&page=1&limit=12
```

**Category-Specific Search:**

```bash
GET /api/search?category=televisions&filters={"screenSize":"55\"","priceMax":60000}
```

**Advanced Filtering:**

```bash
GET /api/search?q=running%20shoes&filters={"brand":"Nike","size":"9","color":"Black"}&sort=price_asc
```

### GET /api/categories

Retrieve all available categories with their attribute schemas.

#### Response

```typescript
{
  categories: Array<{
    name: string;
    slug: string;
    attributeSchema: Record<string, AttributeConfig>;
  }>;
}
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage

- **Unit Tests**: Components, utilities, API handlers
- **Integration Tests**: Database operations, API endpoints
- **Error Handling**: Network failures, invalid data
- **Edge Cases**: Empty results, malformed queries

### Test Structure

```
src/
├── components/__tests__/
│   ├── SearchBar.test.tsx
│   ├── FilterPanel.test.tsx
│   └── ResultsGrid.test.tsx
├── pages/api/__tests__/
│   ├── search.test.ts
│   └── categories.test.ts
└── lib/__tests__/
    ├── database.test.ts
    └── models.test.ts
```

## 🏗️ Project Structure

```
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── SearchBar.tsx     # Search input with categories
│   │   ├── FilterPanel.tsx   # Dynamic faceted filters
│   │   ├── ResultsGrid.tsx   # Product listing grid
│   │   ├── Pagination.tsx    # Page navigation
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx
│   ├── lib/
│   │   ├── database.ts       # MongoDB connection
│   │   └── models/           # Mongoose schemas
│   │       └── index.ts
│   ├── pages/
│   │   ├── api/
│   │   │   ├── search.ts     # Main search API
│   │   │   └── categories.ts # Categories API
│   │   ├── index.tsx         # Home page
│   │   ├── search.tsx        # Search page
│   │   ├── _app.tsx
│   │   └── _document.tsx
│   └── styles/
│       └── globals.css       # Global styles & utilities
├── scripts/
│   ├── seed.ts              # Database seeding
│   └── mongo-init.js        # MongoDB initialization
├── __tests__/               # Additional test files
├── docker-compose.yml       # MongoDB service
├── tailwind.config.js       # Tailwind configuration
├── next.config.js          # Next.js configuration
├── jest.config.js          # Testing configuration
└── README.md
```

## 🎯 Architecture Decisions

### Search Implementation

- **Text Search**: MongoDB text indexes with relevance scoring
- **Faceted Search**: Aggregation pipeline with $facet stage
- **Performance**: Strategic indexing on searchable and filterable fields
- **Scalability**: Pagination and result limiting

### Data Modeling

- **Flexible Schema**: EAV pattern for category-specific attributes
- **Indexing Strategy**: Compound indexes for common query patterns
- **Validation**: Schema validation at both application and database levels

### Frontend Architecture

- **State Management**: URL-based state with React hooks
- **Performance**: Debounced search, lazy loading, memoization
- **UX**: Loading states, error boundaries, responsive design

## 🚀 Performance Optimizations

### Database

- Text indexes for full-text search
- Compound indexes for filtered queries
- Aggregation pipeline optimization
- Connection pooling with Mongoose

### Frontend

- Debounced search input (300ms)
- Pagination for large result sets
- Component memoization with React.memo
- Image lazy loading

### API

- Response compression
- Efficient MongoDB queries
- Error handling with proper HTTP status codes
- Input validation and sanitization

## 🧩 Advanced Features

### Dynamic Faceting

The system automatically generates filters based on:

1. **Category Schema**: Filterable attributes defined per category
2. **Data Distribution**: Only shows facets with available options
3. **Result Context**: Facet counts update based on current search

### Intelligent Search

- **Full-text Search**: Searches across title and description
- **Relevance Scoring**: MongoDB text score with recency boost
- **Category Filtering**: Context-aware search within categories
- **Attribute Filtering**: Multi-value filtering with AND/OR logic

### URL State Management

- **Shareable URLs**: All search state encoded in URL
- **Browser History**: Back/forward navigation support
- **Deep Linking**: Direct access to specific search results

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**

```bash
# Check if MongoDB is running
docker-compose ps

# View MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

**Seeding Fails**

```bash
# Ensure MongoDB is ready
docker-compose logs mongodb | grep "waiting for connections"

# Clear existing data and re-seed
npm run seed
```

**Tests Failing**

```bash
# Install test dependencies
npm install

# Clear Jest cache
npx jest --clearCache

# Run tests with verbose output
npm test -- --verbose
```

### Development Tips

**Enable Debug Logging**

```bash
# Add to .env.local
DEBUG=true
NODE_ENV=development
```

**Monitor Database Queries**

```javascript
// Add to mongoose connection
mongoose.set('debug', true);
```

**Performance Profiling**

```bash
# Run with profiling
npm run dev -- --profile
```

## 🚀 Deployment

### Production Build

```bash
# Create optimized build
npm run build

# Start production server
npm start
```

### Environment Variables

```bash
# Production environment
MONGODB_URI=mongodb://production-host:27017/b2b_marketplace
NEXT_PUBLIC_API_URL=https://your-domain.com
NODE_ENV=production
```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow existing code style
- Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- MongoDB team for powerful aggregation capabilities
- Tailwind CSS for the utility-first approach
- React Testing Library for testing utilities

---

## 📊 Sample Data

The seed script creates:

- **3 Categories**: Televisions, Running Shoes, Industrial Pumps
- **80+ Listings**: Realistic product data with variations
- **12 Locations**: Major Indian cities
- **Dynamic Attributes**: Category-specific product features

## 🔄 Updates & Maintenance

To keep the project updated:

```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Update database indexes
npm run seed
```

## 📈 Monitoring & Analytics

Consider integrating:

- **Performance**: Web Vitals, Lighthouse scores
- **Search Analytics**: Query patterns, conversion rates
- **Error Tracking**: Sentry, LogRocket
- **Database Monitoring**: MongoDB Atlas, Compass

---

**Happy Coding! 🎉**

For questions or support, please open an issue in the repository.
