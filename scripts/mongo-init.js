// MongoDB initialization script
// This script runs when the MongoDB container starts

// Switch to the application database
db = db.getSiblingDB('b2b_marketplace');

// Create collections with validation (optional)
db.createCollection('categories', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'slug'],
            properties: {
                name: {
                    bsonType: 'string',
                    description: 'Category name must be a string and is required'
                },
                slug: {
                    bsonType: 'string',
                    description: 'Category slug must be a string and is required'
                },
                attributeSchema: {
                    bsonType: 'object',
                    description: 'Attribute schema must be an object'
                }
            }
        }
    }
});

db.createCollection('listings', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['title', 'description', 'price', 'location', 'categoryId'],
            properties: {
                title: {
                    bsonType: 'string',
                    description: 'Title must be a string and is required'
                },
                description: {
                    bsonType: 'string',
                    description: 'Description must be a string and is required'
                },
                price: {
                    bsonType: 'number',
                    minimum: 0,
                    description: 'Price must be a positive number and is required'
                },
                location: {
                    bsonType: 'string',
                    description: 'Location must be a string and is required'
                },
                categoryId: {
                    bsonType: 'objectId',
                    description: 'Category ID must be an ObjectId and is required'
                },
                attributes: {
                    bsonType: 'object',
                    description: 'Attributes must be an object'
                },
                isActive: {
                    bsonType: 'bool',
                    description: 'isActive must be a boolean'
                }
            }
        }
    }
});

// Create indexes for better performance
db.categories.createIndex({ slug: 1 }, { unique: true });
db.categories.createIndex({ name: 1 });

db.listings.createIndex({ title: 'text', description: 'text' });
db.listings.createIndex({ categoryId: 1, isActive: 1 });
db.listings.createIndex({ location: 1 });
db.listings.createIndex({ price: 1 });
db.listings.createIndex({ createdAt: -1 });
db.listings.createIndex({ isActive: 1 });

// Create compound indexes
db.listings.createIndex({ categoryId: 1, price: 1 });
db.listings.createIndex({ location: 1, categoryId: 1 });

print('✅ MongoDB initialization completed successfully');
print('📊 Collections created: categories, listings');
print('🔍 Indexes created for optimal search performance');