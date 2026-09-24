import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpires: {
      type: Date,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    // Wallet
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    walletTransactions: [
      {
        type: {
          type: String,
          enum: ["credit", "debit"],
        },
        amount: Number,
        description: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Referral
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    referralRewardClaimed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate referral code before saving if not set
userSchema.pre("save", function (next) {
  if (!this.referralCode) {
    this.referralCode =
      this.name
        .replace(/\s+/g, "")
        .toUpperCase()
        .slice(0, 4) +
      crypto.randomBytes(3).toString("hex").toUpperCase();
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
