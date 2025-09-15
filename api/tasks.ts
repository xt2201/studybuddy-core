import { IncomingMessage, ServerResponse } from 'http';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: IncomingMessage & { body?: any, method?: string, url?: string }, res: ServerResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const tasks = await prisma.task.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(tasks));
      return;
    }

    if (req.method === 'POST') {
      const { title, description, deadline, priority = 'medium', estimateMinutes } = req.body;
      
      const task = await prisma.task.create({
        data: {
          title,
          description,
          deadline: new Date(deadline),
          priority,
          estimateMinutes: parseInt(estimateMinutes)
        }
      });
      
      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(task));
      return;
    }

    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  } catch (error) {
    console.error('Tasks API error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  } finally {
    await prisma.$disconnect();
  }
}