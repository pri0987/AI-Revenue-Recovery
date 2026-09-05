const mongoose = require("mongoose");

const recoveryCaseSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    issueType: {
      type: String,
      enum: [
        "payment_failed",
        "subscription_failed",
        "checkout_abandoned",
        "invoice_overdue",
      ],
      required: true,
    },

    amountAtRisk: {
      type: Number,
      required: true,
      min: 0,
    },

    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    aiRecommendation: {
      type: String,
      default: "",
    },

    action: {
      type: String,
      enum: [
        "retry_payment",
        "send_reminder",
        "recovery_message",
        "escalate",
        "stop",
      ],
      default: "stop",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "recovered",
        "failed",
        "stopped",
      ],
      default: "pending",
    },

    recoveredAmount: {
      type: Number,
      default: 0,
    },

    retryCount: {
      type: Number,
      default: 0,
    },

    reminderCount: {
      type: Number,
      default: 0,
    },

    stopReason: {
      type: String,
      default: "",
    },

    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const RecoveryCase = mongoose.model(
  "RecoveryCase",
  recoveryCaseSchema
);

module.exports = RecoveryCase;