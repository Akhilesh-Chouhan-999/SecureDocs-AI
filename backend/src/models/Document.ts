import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  ocrText: {
    type: String,
  },
  ocrConfidence: {
    type: Number,
    min: 0,
    max: 1,
  },
  structuredData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
  statusMessage: {
    type: String,
  },
  documentCategory: {
    type: String,
    enum: ["w2", "paystub", "id", "bank_statement", "tax_return", "other"],
    default: "other",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

documentSchema.index({ user: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ createdAt: -1 });

documentSchema.pre("save", function (this: any, next: Function) {
  this.updatedAt = new Date();
  next();
});

const Document = mongoose.model("Document", documentSchema);

export default Document;
