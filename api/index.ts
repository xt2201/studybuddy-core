// This file is specifically for Vercel serverless deployment
// It imports the Express app and exports it for Vercel to handle

import app from '../src/backend/src/index';

export default app;