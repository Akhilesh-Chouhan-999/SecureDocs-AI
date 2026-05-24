import mongoose from "mongoose";

const fraudReportSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
  },
  analyst: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  riskLevel: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    required: true,
  },
  anomalies: {
    type: [
      {
        type: {
          type: String,
          required: true,
        },
        severity: {
          type: String,
          enum: ["low", "medium", "high", "critical"],
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        affectedField: {
          type: String,
          default: "document",
        },
        confidence: {
          type: Number,
          min: 0,
          max: 1,
          default: 0.5,
        },
        suggestedAction: {
          type: String,
          default: "Review manually",
        },
      },
    ],
    default: [],
  },
  summary: {
    type: String,
    required: true,
  },
  recommendations: {
    type: [String],
    default: [],
  },
  decision: {
    type: String,
    enum: ["pending", "approved", "rejected", "manual_review"],
    default: "pending",
  },
  reviewNotes: {
    type: String,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reviewedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  fraudTypes: {
    type: [String],
    default: [],
  }
});

fraudReportSchema.index({ document: 1 });
fraudReportSchema.index({ analyst: 1 });
fraudReportSchema.index({ riskLevel: 1 });

const FraudReport = mongoose.model("FraudReport", fraudReportSchema);

export default FraudReport;
