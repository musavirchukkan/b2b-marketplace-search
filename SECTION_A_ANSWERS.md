# Section A: Architecture and Problem Solving

## Question 1: Intent Extraction Strategy

### a) Pragmatic and Scalable Pipeline

**Pipeline Architecture:**

1. **Preprocessing**: Tokenize and normalize using spaCy, handle currency symbols (₹)
2. **Entity Recognition**: NER models for locations, prices, brands, sizes
3. **Rule-based Extraction**: Regex patterns for structured data:
   - Price: "under ₹X", "below X", "< X"
   - Size: numerical + size indicators
   - Location: fuzzy matching against location database
4. **ML Classification**: Fine-tuned BERT for product categorization + TF-IDF for attributes
5. **Structured Output**: Map to filters with confidence scoring

**Example Processing:**

```json
Query: "running shoes size 9 red under ₹2000 in Mumbai"
Output: {
  "category": "footwear",
  "filters": {
    "subcategory": "running shoes",
    "size": "9",
    "color": "red",
    "priceMax": 2000,
    "location": "Mumbai"
  },
  "confidence": 0.89
}
```

### b) Fallback Strategy

**When confidence < 70%:**

- **Partial extraction** - Use high-confidence components
- **Fuzzy search** - Elasticsearch with broad matching
- **Query suggestions** - "Did you mean?" using Levenshtein distance
- **Graceful degradation** - Fall back to keyword search with highlighted unmatched terms
- **Learning loop** - Log ambiguous queries for model retraining

---

## Question 2: Flexible Schema for Category-Specific Attributes

### a) Data Model Choice: **Hybrid Document-Relational**

**Recommended Architecture:**

- **Core fields** (RDBMS pattern): id, title, price, categoryId
- **Dynamic attributes** (Document pattern): JSON/JSONB column for category-specific properties
- **Schema validation** through category definitions

**Implementation:**

**Categories Collection:**

```javascript
{
  name: "Televisions",
  slug: "televisions",
  attributeSchema: {
    "screenSize": {
      type: "enum",
      options: ["32\"", "55\"", "65\""],
      filterable: true
    },
    "technology": {
      type: "select",
      options: ["LED", "OLED", "QLED"],
      filterable: true
    }
  }
}
```

**Listings Collection:**

```javascript
{
  title: "Samsung 55\" QLED TV",
  price: 65000,
  categoryId: ObjectId,
  attributes: {
    "screenSize": "55\"",
    "technology": "QLED",
    "energyRating": "5-star"  // New attribute - zero migration
  }
}
```

**Benefits:** Zero-migration attribute addition, type safety, query flexibility.

### b) Fast Multi-Attribute Filtering

**Performance Strategy:**

- **Compound indexes**: `{categoryId: 1, "attributes.brand": 1, price: 1}`
- **Sparse indexes**: Only on documents with specific attributes
- **MongoDB aggregation**:

```javascript
db.listings.aggregate([
  { $match: { 'attributes.brand': 'Samsung' } },
  {
    $facet: {
      results: [{ $skip: 0 }, { $limit: 20 }],
      brandFacets: [{ $group: { _id: '$attributes.brand', count: { $sum: 1 } } }],
    },
  },
]);
```

**Attribute existence**: Use `$exists` operator with indexed attribute paths.

---

## Question 3: Dynamic Facet API Design

### API Contract

**Endpoint:** `GET /api/search/facets`

**Request:**

```
?category=televisions&query=samsung&filters={"brand":"Samsung"}
```

**Response:**

```json
{
  "facets": {
    "brand": {
      "type": "multi-select",
      "label": "Brand",
      "options": [
        { "value": "samsung", "label": "Samsung", "count": 45 },
        { "value": "lg", "label": "LG", "count": 32 }
      ]
    },
    "screenSize": {
      "type": "single-select",
      "label": "Screen Size",
      "options": [
        { "value": "55", "label": "55 inches", "count": 28 },
        { "value": "65", "label": "65 inches", "count": 15 }
      ]
    },
    "priceRange": {
      "type": "range",
      "label": "Price Range",
      "buckets": [
        { "range": "30000-60000", "label": "₹30K - ₹60K", "count": 23 },
        { "range": "60000-100000", "label": "₹60K - ₹1L", "count": 18 }
      ]
    }
  },
  "appliedFilters": { "brand": ["Samsung"] },
  "total": 98
}
```

**Implementation Features:**

- **Real-time aggregation** using MongoDB `$facet` stage
- **Context-aware counts** - exclude current facet to avoid zeros
- **Caching layer** for popular category combinations
- **Mobile optimization** - progressive loading for large facet sets
- **Relevance ordering** - most popular options first
