import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { UsageLog } from './models/UsageLog';

dotenv.config();

const app = express();

// Helper function to get date in Istanbul timezone
const getIstanbulDate = (date: string): Date => {
  return new Date(new Date(date).toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
};

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lens-tracker');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

connectDB();

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'Server is running',
    endpoints: {
      logs: '/api/logs',
      logsForToken: '/api/logs/:token',
      latestLogForToken: '/api/logs/:token/latest',
      monthlyLogs: '/api/logs/:token/monthly/:year/:month',
      summary: '/api/logs/:token/summary'
    }
  });
});

// Routes
app.post('/api/logs', async (req, res) => {
  try {
    const { token, date, wearType, lensUsageDays, lastLensReplacementDate } = req.body;
    
    if (!token || !date || !wearType) {
      return res.status(400).json({ error: 'Missing required fields: token, date, and wearType are required' });
    }

    // Validate wearType
    if (!['glasses', 'lenses'].includes(wearType)) {
      return res.status(400).json({ error: 'wearType must be either "glasses" or "lenses"' });
    }

    // Upsert the log (update if exists, insert if doesn't)
    const log = await UsageLog.findOneAndUpdate(
      { token, date },
      { token, date, wearType, lensUsageDays, lastLensReplacementDate },
      { upsert: true, new: true }
    );
    
    res.json(log);
  } catch (error) {
    console.error('Error saving log:', error);
    res.status(500).json({ error: 'Failed to save log' });
  }
});

// Get all logs for a token
app.get('/api/logs/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const logs = await UsageLog.find({ token }).sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Delete a specific log
app.delete('/api/logs/:token/:date', async (req, res) => {
  try {
    const { token, date } = req.params;
    
    // Find and delete the log
    const log = await UsageLog.findOneAndDelete({ token, date });
    
    if (!log) {
      return res.status(404).json({ error: 'Log not found' });
    }
    
    // Get the latest log after deletion to update lens usage days
    const latestLog = await UsageLog.findOne({ token }).sort({ date: -1 });
    
    // If the deleted log was a lens day, update the lens usage days count
    if (log.wearType === 'lenses') {
      // Update all subsequent logs with decremented lens usage days
      await UsageLog.updateMany(
        { 
          token,
          date: { $gt: date }
        },
        { $inc: { lensUsageDays: -1 } }
      );
    }
    
    res.json({ message: 'Log deleted successfully', latestLog });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ error: 'Failed to delete log' });
  }
});

// Get latest log for a token
app.get('/api/logs/:token/latest', async (req, res) => {
  try {
    const { token } = req.params;
    const log = await UsageLog.findOne({ token }).sort({ date: -1 });
    res.json(log);
  } catch (error) {
    console.error('Error fetching latest log:', error);
    res.status(500).json({ error: 'Failed to fetch latest log' });
  }
});

// Get monthly logs for a token
app.get('/api/logs/:token/monthly/:year/:month', async (req, res) => {
  try {
    const { token, year, month } = req.params;
    
    // Create date range for the specified month in Istanbul timezone
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const nextMonth = (parseInt(month) % 12 + 1).toString().padStart(2, '0');
    const nextYear = parseInt(month) === 12 ? (parseInt(year) + 1).toString() : year;
    const endDate = `${nextYear}-${nextMonth}-01`;

    // Find logs within the date range
    const logs = await UsageLog.find({
      token,
      date: {
        $gte: startDate,
        $lt: endDate
      }
    }).sort({ date: 1 });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching monthly logs:', error);
    res.status(500).json({ error: 'Failed to fetch monthly logs' });
  }
});

// Get summary for a token
app.get('/api/logs/:token/summary', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Get all logs for the token
    const logs = await UsageLog.find({ token }).sort({ date: -1 });
    
    // Calculate summary
    const summary = {
      totalDays: logs.length,
      lensUsageDays: logs.filter(log => log.wearType === 'lenses').length,
      glassesUsageDays: logs.filter(log => log.wearType === 'glasses').length,
      lastLensReplacementDate: logs[0]?.lastLensReplacementDate || null,
      currentLensUsageDays: logs[0]?.lensUsageDays || 0,
      latestLog: logs[0] || null
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// Clear all logs (DELETE endpoint)
app.delete('/api/logs', async (req, res) => {
  try {
    await UsageLog.deleteMany({});
    res.json({ message: 'All logs cleared successfully' });
  } catch (error) {
    console.error('Error clearing logs:', error);
    res.status(500).json({ error: 'Failed to clear logs' });
  }
});

// Only start the server if we're not in a Vercel environment
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export the app for Vercel
export default app; 