import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    weight: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
    },

    mrp: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    sold: {
      type: Number,
      default: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 10,
    },

    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true,
  }
);

const nutritionSchema = new mongoose.Schema(
  {
    servingSize: String,
    calories: String,
    protein: String,
    carbohydrates: String,
    fat: String,
    fiber: String,
    sugar: String,
    sodium: String,
  },
  {
    _id: false,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      required: true,
      maxlength: 300,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    brand: {
      type: String,
      default: "VIP Foods",
    },

    images: [
      {
        type: String,
      },
    ],

    variants: [variantSchema],

    ingredients: {
      type: String,
      default: "",
    },

    shelfLife: {
      type: String,
      default: "",
    },

    storageInstructions: {
      type: String,
      default: "",
    },

    manufacturer: {
      type: String,
      default: "VIP Foods",
    },

    countryOfOrigin: {
      type: String,
      default: "India",
    },

    nutrition: nutritionSchema,

    badges: [
      {
        type: String,
      },
    ],

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    freeDelivery: {
      type: Boolean,
      default: false,
    },

    deliveryCharge: {
      type: Number,
      default: 0,
    },

    estimatedDelivery: {
      type: String,
      default: "2-4 Days",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    active: {
      type: Boolean,
      default: true,
    },

    published: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
  type: Boolean,
  default: false,
},

deletedAt: {
  type: Date,
  default: null,
},

    metaTitle: {
      type: String,
      default: "",
    },

    metaDescription: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Product", productSchema);