const mongoose = require("mongoose");

const historicalRecordSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  source: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const HistoricalRecord = mongoose.model(
  "HistoricalRecord",
  historicalRecordSchema,
);

module.exports = HistoricalRecord;
