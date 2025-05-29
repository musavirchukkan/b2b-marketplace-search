import mongoose from "mongoose";
import { Category, Listing } from "../src/lib/models";
import { connectDB } from "../src/lib/database";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://admin:password123@localhost:27017/b2b_marketplace?authSource=admin";

const categories = [
  {
    name: "Televisions",
    slug: "televisions",
    attributeSchema: {
      screenSize: {
        type: "string" as const,
        label: "Screen Size",
        options: ['32"', '43"', '50"', '55"', '65"', '75"', '85"'],
        required: true,
        filterable: true,
      },
      technology: {
        type: "string" as const,
        label: "Display Technology",
        options: ["LED", "OLED", "QLED", "Neo QLED", "Mini LED"],
        required: true,
        filterable: true,
      },
      resolution: {
        type: "string" as const,
        label: "Resolution",
        options: ["HD Ready", "Full HD", "4K Ultra HD", "8K"],
        required: true,
        filterable: true,
      },
      brand: {
        type: "string" as const,
        label: "Brand",
        options: [
          "Samsung",
          "LG",
          "Sony",
          "TCL",
          "Xiaomi",
          "OnePlus",
          "Realme",
        ],
        required: true,
        filterable: true,
      },
      smartTV: {
        type: "boolean" as const,
        label: "Smart TV",
        required: false,
        filterable: true,
      },
      refreshRate: {
        type: "string" as const,
        label: "Refresh Rate",
        options: ["60Hz", "120Hz", "144Hz"],
        required: false,
        filterable: true,
      },
    },
  },
  {
    name: "Running Shoes",
    slug: "running-shoes",
    attributeSchema: {
      size: {
        type: "string" as const,
        label: "Size",
        options: ["6", "7", "8", "9", "10", "11", "12", "13"],
        required: true,
        filterable: true,
      },
      color: {
        type: "string" as const,
        label: "Color",
        options: [
          "Black",
          "White",
          "Red",
          "Blue",
          "Green",
          "Gray",
          "Navy",
          "Orange",
        ],
        required: true,
        filterable: true,
      },
      brand: {
        type: "string" as const,
        label: "Brand",
        options: [
          "Nike",
          "Adidas",
          "Puma",
          "Reebok",
          "New Balance",
          "ASICS",
          "Brooks",
        ],
        required: true,
        filterable: true,
      },
      gender: {
        type: "string" as const,
        label: "Gender",
        options: ["Men", "Women", "Unisex"],
        required: true,
        filterable: true,
      },
      category: {
        type: "string" as const,
        label: "Running Category",
        options: [
          "Road Running",
          "Trail Running",
          "Track & Field",
          "Casual Running",
        ],
        required: false,
        filterable: true,
      },
      cushioning: {
        type: "string" as const,
        label: "Cushioning Level",
        options: ["Minimal", "Moderate", "Maximum"],
        required: false,
        filterable: true,
      },
    },
  },
  {
    name: "Industrial Pumps",
    slug: "industrial-pumps",
    attributeSchema: {
      pumpType: {
        type: "string" as const,
        label: "Pump Type",
        options: [
          "Centrifugal",
          "Positive Displacement",
          "Submersible",
          "Self-Priming",
        ],
        required: true,
        filterable: true,
      },
      material: {
        type: "string" as const,
        label: "Material",
        options: [
          "Cast Iron",
          "Stainless Steel",
          "Bronze",
          "Plastic",
          "Carbon Steel",
        ],
        required: true,
        filterable: true,
      },
      flowRate: {
        type: "string" as const,
        label: "Flow Rate (LPM)",
        options: ["0-100", "100-500", "500-1000", "1000-5000", "5000+"],
        required: true,
        filterable: true,
      },
      horsepower: {
        type: "string" as const,
        label: "Horsepower",
        options: ["0.5 HP", "1 HP", "2 HP", "3 HP", "5 HP", "7.5 HP", "10 HP+"],
        required: true,
        filterable: true,
      },
      application: {
        type: "string" as const,
        label: "Application",
        options: [
          "Water Supply",
          "Chemical Processing",
          "Oil & Gas",
          "Agriculture",
          "Construction",
        ],
        required: false,
        filterable: true,
      },
    },
  },
];

const locations = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Kochi",
  "Thrissur",
  "Coimbatore",
];

const getRandomElement = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const getRandomPrice = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const tvListings = [
  {
    title: 'Samsung 55" 4K QLED Smart TV',
    description:
      "Premium QLED technology with vibrant colors and smart features. Perfect for home entertainment.",
    basePrice: 65000,
    attributes: {
      screenSize: '55"',
      technology: "QLED",
      resolution: "4K Ultra HD",
      brand: "Samsung",
      smartTV: true,
      refreshRate: "120Hz",
    },
  },
  {
    title: 'LG 43" OLED Full HD TV',
    description:
      "Stunning OLED display with perfect blacks and infinite contrast ratio.",
    basePrice: 45000,
    attributes: {
      screenSize: '43"',
      technology: "OLED",
      resolution: "Full HD",
      brand: "LG",
      smartTV: true,
      refreshRate: "60Hz",
    },
  },
  {
    title: 'Sony 65" 4K LED Android TV',
    description:
      "Large screen Sony TV with Android TV platform and superior picture quality.",
    basePrice: 85000,
    attributes: {
      screenSize: '65"',
      technology: "LED",
      resolution: "4K Ultra HD",
      brand: "Sony",
      smartTV: true,
      refreshRate: "60Hz",
    },
  },
  // Add more TV variations
];

const shoeListings = [
  {
    title: "Nike Air Max Running Shoes",
    description:
      "Comfortable running shoes with Air Max cushioning technology. Perfect for daily runs.",
    basePrice: 4500,
    attributes: {
      size: "9",
      color: "Black",
      brand: "Nike",
      gender: "Men",
      category: "Road Running",
      cushioning: "Maximum",
    },
  },
  {
    title: "Adidas Ultraboost Women's Running Shoes",
    description: "Premium running shoes with Boost midsole for energy return.",
    basePrice: 6500,
    attributes: {
      size: "8",
      color: "White",
      brand: "Adidas",
      gender: "Women",
      category: "Road Running",
      cushioning: "Moderate",
    },
  },
  {
    title: "ASICS Trail Running Shoes",
    description:
      "Durable trail running shoes with excellent grip and protection.",
    basePrice: 5200,
    attributes: {
      size: "10",
      color: "Gray",
      brand: "ASICS",
      gender: "Men",
      category: "Trail Running",
      cushioning: "Moderate",
    },
  },
];

const pumpListings = [
  {
    title: "Centrifugal Water Pump 5HP",
    description:
      "High-efficiency centrifugal pump suitable for water supply applications.",
    basePrice: 25000,
    attributes: {
      pumpType: "Centrifugal",
      material: "Cast Iron",
      flowRate: "500-1000",
      horsepower: "5 HP",
      application: "Water Supply",
    },
  },
  {
    title: "Submersible Pump Stainless Steel",
    description:
      "Corrosion-resistant submersible pump for deep well applications.",
    basePrice: 35000,
    attributes: {
      pumpType: "Submersible",
      material: "Stainless Steel",
      flowRate: "100-500",
      horsepower: "3 HP",
      application: "Agriculture",
    },
  },
];

async function generateListings(
  categoryDoc: any,
  baseListings: any[]
): Promise<any[]> {
  const listings = [];

  for (const baseListing of baseListings) {
    // Create multiple variations of each base listing
    for (let i = 0; i < 8; i++) {
      const listing = {
        title: `${baseListing.title} - Model ${i + 1}`,
        description: baseListing.description,
        price: getRandomPrice(
          baseListing.basePrice * 0.8,
          baseListing.basePrice * 1.2
        ),
        location: getRandomElement(locations),
        categoryId: categoryDoc._id,
        attributes: { ...baseListing.attributes },
        isActive: true,
        tags: [baseListing.attributes.brand?.toLowerCase(), categoryDoc.slug],
      };

      // Add some variation to attributes
      const attrKeys = Object.keys(categoryDoc.attributeSchema);
      attrKeys.forEach((key) => {
        const schema = categoryDoc.attributeSchema[key];
        if (schema.options && Math.random() > 0.7) {
          listing.attributes[key] = getRandomElement(schema.options);
        }
      });

      listings.push(listing);
    }
  }

  return listings;
}

async function seedDatabase() {
  try {
    // Set MongoDB URI
    process.env.MONGODB_URI = MONGODB_URI;

    // Connect to database
    await connectDB();

    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await Category.deleteMany({});
    await Listing.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Insert categories
    const categoryDocs = await Category.insertMany(categories);
    console.log(`✅ Inserted ${categoryDocs.length} categories`);

    // Generate and insert listings
    let totalListings = 0;

    for (const categoryDoc of categoryDocs) {
      let baseListings: any[] = [];

      switch (categoryDoc.slug) {
        case "televisions":
          baseListings = tvListings;
          break;
        case "running-shoes":
          baseListings = shoeListings;
          break;
        case "industrial-pumps":
          baseListings = pumpListings;
          break;
      }

      if (baseListings.length > 0) {
        const listings = await generateListings(categoryDoc, baseListings);
        await Listing.insertMany(listings);
        totalListings += listings.length;
        console.log(
          `✅ Inserted ${listings.length} listings for ${categoryDoc.name}`
        );
      }
    }

    console.log(
      `🎉 Seeding completed! Total: ${categoryDocs.length} categories, ${totalListings} listings`
    );

    // Create additional indexes for better performance
    await createAttributeIndexes();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

async function createAttributeIndexes() {
  try {
    // Create indexes for common attribute fields
    const attributeFields = [
      "attributes.brand",
      "attributes.size",
      "attributes.color",
      "attributes.screenSize",
      "attributes.technology",
      "attributes.resolution",
      "attributes.pumpType",
      "attributes.material",
      "attributes.flowRate",
    ];

    for (const field of attributeFields) {
      await Listing.collection.createIndex({ [field]: 1 });
    }

    console.log("✅ Created attribute indexes");
  } catch (error) {
    console.log("⚠️  Some indexes may already exist");
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
