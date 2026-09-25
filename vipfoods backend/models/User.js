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

// Auto-generate a unique referral code before saving if not set
userSchema.pre("save", function (next) {
  if (!this.referralCode) {
    const baseName = (this.name || "VIP")
      .trim()
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase()
      .slice(0, 4);

    const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
    this.referralCode = `${baseName || "VIP"}${randomPart}`;
  }
  next();
});

userSchema.statics.generateUniqueReferralCode = async function (name) {
  const baseName = (name || "VIP")
    .trim()
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 4) || "VIP";

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
    const candidate = `${baseName}${randomPart}`;

    const exists = await this.exists({ referralCode: candidate });
    if (!exists) {
      return candidate;
    }
  }

  const fallback = `${baseName}${Date.now().toString().slice(-6)}`.toUpperCase();
  const fallbackExists = await this.exists({ referralCode: fallback });
  if (fallbackExists) {
    return `${baseName}${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  }

  return fallback;
};

const User = mongoose.model("User", userSchema);

export default User;
