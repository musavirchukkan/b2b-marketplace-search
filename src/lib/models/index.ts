import mongoose, { Schema, Document, Model } from "mongoose";

// Category Schema Interface
export interface ICategory extends Document {
  name: string;
  slug: string;
  attributeSchema: {
    [key: string]: {
      type: "string" | "number" | "boolean" | "array";
      label: string;
      options?: string[];
      required?: boolean;
      filterable?: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Listing Schema Interface
export interface IListing extends Document {
  title: string;
  description: string;
  price: number;
  location: string;
  categoryId: mongoose.Types.ObjectId;
  category?: ICategory;
  attributes: Record<string, any>;
  images?: string[];
  tags?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Category Schema
const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    attributeSchema: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Listing Schema
const ListingSchema = new Schema<IListing>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: "text",
    },
    description: {
      type: String,
      required: true,
      trim: true,
      index: "text",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: 1,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      index: 1,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: 1,
    },
    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indexes for better query performance
ListingSchema.index({ title: "text", description: "text" });
ListingSchema.index({ categoryId: 1, isActive: 1 });
ListingSchema.index({ location: 1, price: 1 });
ListingSchema.index({ createdAt: -1 });

// Add dynamic indexes for attributes (these would be created by the seed script)
// Example: db.listings.createIndex({"attributes.brand": 1})
// Example: db.listings.createIndex({"attributes.size": 1})

// Prevent re-compilation of models in development
const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
const Listing: Model<IListing> =
  mongoose.models.Listing || mongoose.model<IListing>("Listing", ListingSchema);

export { Category, Listing };
