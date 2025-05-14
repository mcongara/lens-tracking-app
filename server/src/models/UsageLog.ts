import mongoose from 'mongoose';

const usageLogSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true
  },
  wearType: {
    type: String,
    enum: ['glasses', 'lenses'],
    required: true
  },
  lensUsageDays: {
    type: Number,
    default: 0
  },
  lastLensReplacementDate: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for token and date to ensure unique entries per day per user
usageLogSchema.index({ token: 1, date: 1 }, { unique: true });

export const UsageLog = mongoose.model('UsageLog', usageLogSchema); 