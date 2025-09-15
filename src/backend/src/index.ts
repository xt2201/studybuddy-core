import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { tasksRouter } from './routes/tasks.js';
import { analyticsRouter } from './routes/analytics.js';
import aiRouter from './routes/ai.js';
import { googleCalendarRouter } from './routes/google-calendar.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.use('/api/tasks', tasksRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/google-calendar', googleCalendarRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'StudyBuddy Backend is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 StudyBuddy Backend server is running on port ${PORT}`);
});