import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import { UsageLog } from '../../../src/models/UsageLog';

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
    const { token } = req.query;

    if (req.method === 'GET') {
      const log = await UsageLog.findOne({ token }).sort({ date: -1 });
      return res.status(200).json(log);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in API route:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 