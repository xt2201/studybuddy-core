import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/backend/src/index';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Import and use the Express app
  return app(req, res);
}