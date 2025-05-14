import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { UsageLog } from './models/UsageLog';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lens-tracker')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.post('/api/logs', async (req, res) => {
  try {
    const { token, date, wearType, lensUsageDays, lastLensReplacementDate } = req.body;
    
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

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 