import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const tasks = await prisma.task.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return res.json(tasks);
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
      
      return res.status(201).json(task);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Tasks API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}