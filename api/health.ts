import { IncomingMessage, ServerResponse } from 'http';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const requiredEnvVars = ['DATABASE_URL', 'OPENAI_API_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      status: 'ERROR', 
      message: 'Missing environment variables', 
      missing: missingVars 
    }));
    return;
  }
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ 
    status: 'OK', 
    message: 'StudyBuddy Backend is running',
    env: {
      hasDatabase: !!process.env.DATABASE_URL,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasGoogleCreds: !!process.env.GOOGLE_CREDENTIALS_CONTENT,
    }
  }));
}