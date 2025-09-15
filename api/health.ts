import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
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
}