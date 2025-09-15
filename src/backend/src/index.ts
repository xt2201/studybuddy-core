// Type declarations for Node.js globals and require function
declare const require: any;
declare const process: {
  env: {
    [key: string]: string | undefined;
    PORT?: string;
    NODE_ENV?: string;
    DATABASE_URL?: string;
    OPENAI_API_KEY?: string;
    GOOGLE_CREDENTIALS_CONTENT?: string;
  };
};

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

// Node.js and external library imports with require for better compatibility
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import route modules
const { tasksRouter } = require('./routes/tasks.js');
const { analyticsRouter } = require('./routes/analytics.js');
const aiRouter = require('./routes/ai.js');
const { googleCalendarRouter } = require('./routes/google-calendar.js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'https://frontend-hy0rsbvk8-nguyen-xuan-thanhs-projects.vercel.app',
    'https://frontend-2mbgqo0kr-nguyen-xuan-thanhs-projects.vercel.app',
    /^https:\/\/.*-nguyen-xuan-thanhs-projects\.vercel\.app$/
  ],
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

// Health check with environment validation
app.get('/health', (req: any, res: any) => {
  const requiredEnvVars = ['DATABASE_URL', 'OPENAI_API_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    return res.status(500).json({ 
      status: 'ERROR', 
      message: 'Missing environment variables', 
      missing: missingVars 
    });
  }
  
  res.json({ 
    status: 'OK', 
    message: 'StudyBuddy Backend is running',
    env: {
      hasDatabase: !!process.env.DATABASE_URL,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasGoogleCreds: !!process.env.GOOGLE_CREDENTIALS_CONTENT,
    }
  });
});

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    status: 'ERROR', 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 StudyBuddy Backend server is running on port ${PORT}`);
});