import mongoose, { Schema } from "mongoose";

const historicalRecordSchema = new Schema(
  {
    documentId: { 
              type: Schema.Types.ObjectId, 
              ref: "Document", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ocrConfidence: { type: Number, min: 0, max: 1 },
    structuredData: { type: Schema.Types.Mixed },
    anomalies: [{ type: Schema.Types.Mixed }],
    riskScore: { type: Number },
    source: { type: String, default: "system" }
  },
  { timestamps: true }
);

// Indexes for faster querying
historicalRecordSchema.index({ documentId: 1 });
historicalRecordSchema.index({ userId: 1 });
historicalRecordSchema.index({ riskScore: -1 });

export const HistoricalRecord = mongoose.model(
  "HistoricalRecord",
  historicalRecordSchema
);

export default HistoricalRecord;
