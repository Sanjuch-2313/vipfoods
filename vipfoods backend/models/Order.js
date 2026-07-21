import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    variant: {
      weight: String,
      sku: String,
      price: Number,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    addressLine1: {
      type: String,
      required: true,
    },

    addressLine2: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    postalCode: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      default: "India",
    },

    latitude: Number,
    longitude: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },

    shippingAddress: shippingAddressSchema,

    paymentMethod: {
      type: String,
      enum: ["ONLINE", "COD"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PARTIALLY_PAID",
        "PAID",
        "FAILED",
        "REFUNDED",
      ],
      default: "PENDING",
    },

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Packing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    subtotal: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
    },

    codCharge: {
      type: Number,
      default: 0,
    },

    onlinePaidAmount: {
      type: Number,
      default: 0,
    },

    remainingAmount: {
      type: Number,
      default: 0,
    },

    distance: {
      type: Number,
      default: 0,
    },

    grandTotal: {
      type: Number,
      required: true,
    },

    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Order", orderSchema);