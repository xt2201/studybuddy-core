import { IncomingMessage, ServerResponse } from 'http';
import app from '../src/backend/src/index';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // Import and use the Express app
  return app(req, res);
}