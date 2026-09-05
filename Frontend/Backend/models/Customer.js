const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
    },

    subscription: {
      type: String,
      enum: ["active", "failed", "cancelled", "expired"],
      default: "active",
    },

    paymentStatus: {
      type: String,
      enum: ["paid", "failed", "pending", "overdue"],
      default: "paid",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    failureReason: {
      type: String,
      enum: [
        "insufficient_funds",
        "expired_card",
        "gateway_error",
        "bank_declined",
        "unknown",
        "",
      ],
      default: "",
    },

    failedAttempts: {
      type: Number,
      default: 0,
    },

    lastPaymentAttempt: {
      type: Date,
      default: null,
    },

    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    revenueAtRisk: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;