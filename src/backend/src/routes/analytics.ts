import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export const analyticsRouter = Router();
const prisma = new PrismaClient();

// Define Task interface based on Prisma schema
interface Task {
  id: string;
  title: string;
  description?: string | null;
  deadline: Date;
  status: 'todo' | 'doing' | 'done';
  priority: 'low' | 'medium' | 'high';
  estimateMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/analytics - Get analytics data
analyticsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const tasks: Task[] = await prisma.task.findMany();
    
    const total: number = tasks.length;
    const completed: number = tasks.filter((task: Task) => task.status === 'done').length;
    const pending: number = tasks.filter((task: Task) => task.status !== 'done').length;
    
    // Calculate overdue tasks
    const now: Date = new Date();
    const overdue: number = tasks.filter((task: Task) => 
      task.status !== 'done' && new Date(task.deadline) < now
    ).length;
    
    // Calculate completion rate
    const completionRate: number = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Calculate average completion time (estimate vs actual - simplified)
    const completedTasks: Task[] = tasks.filter((task: Task) => task.status === 'done');
    const averageCompletionTime: number = completedTasks.length > 0 
      ? Math.round(completedTasks.reduce((sum: number, task: Task) => sum + task.estimateMinutes, 0) / completedTasks.length)
      : 0;

    // Weekly completion trend (last 7 days)
    interface WeeklyData {
      date: string;
      completed: number;
    }
    
    const weeklyData: WeeklyData[] = [];
    for (let i = 6; i >= 0; i--) {
      const date: Date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart: Date = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd: Date = new Date(date.setHours(23, 59, 59, 999));
      
      const completedOnDay: number = tasks.filter((task: Task) => 
        task.status === 'done' && 
        new Date(task.updatedAt) >= dayStart && 
        new Date(task.updatedAt) <= dayEnd
      ).length;
      
      weeklyData.push({
        date: dayStart.toISOString().split('T')[0],
        completed: completedOnDay
      });
    }

    // Priority distribution
    interface PriorityStats {
      low: number;
      medium: number;
      high: number;
    }
    
    const priorityStats: PriorityStats = {
      low: tasks.filter((task: Task) => task.priority === 'low').length,
      medium: tasks.filter((task: Task) => task.priority === 'medium').length,
      high: tasks.filter((task: Task) => task.priority === 'high').length,
    };

    interface AnalyticsResponse {
      total: number;
      completed: number;
      pending: number;
      overdue: number;
      completionRate: number;
      averageCompletionTime: number;
      weeklyData: WeeklyData[];
      priorityStats: PriorityStats;
      success: boolean;
    }

    const analytics: AnalyticsResponse = {
      total,
      completed,
      pending,
      overdue,
      completionRate,
      averageCompletionTime,
      weeklyData,
      priorityStats,
      success: true
    };

    res.json(analytics);
  } catch (error: unknown) {
    console.error('Error fetching analytics:', error);
    
    interface ErrorResponse {
      error: string;
      success: boolean;
    }
    
    const errorResponse: ErrorResponse = {
      error: 'Không thể tải dữ liệu phân tích',
      success: false
    };
    
    res.status(500).json(errorResponse);
  }
});