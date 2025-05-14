import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { UsageLog } from '../../src/models/UsageLog';

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();

    if (req.method === 'POST') {
      const { token, date, wearType, lensUsageDays, lastLensReplacementDate } = req.body;
      
      // Upsert the log (update if exists, insert if doesn't)
      const log = await UsageLog.findOneAndUpdate(
        { token, date },
        { token, date, wearType, lensUsageDays, lastLensReplacementDate },
        { upsert: true, new: true }
      );
      
      return res.status(200).json(log);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in API route:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 