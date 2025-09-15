import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export const tasksRouter = Router();
const prisma = new PrismaClient();

interface TaskFormData {
  title: string;
  description?: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  estimateMinutes: number;
  status: 'todo' | 'doing' | 'done';
}

// GET /api/tasks - Fetch all tasks
tasksRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { status, priority } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    
    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { deadline: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({ tasks, success: true });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      error: 'Không thể tải danh sách nhiệm vụ',
      success: false
    });
  }
});

// POST /api/tasks - Create new task
tasksRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body: TaskFormData = req.body;
    
    // Validate required fields
    if (!body.title?.trim()) {
      return res.status(400).json({
        error: 'Tiêu đề là bắt buộc',
        success: false
      });
    }
    
    if (!body.deadline) {
      return res.status(400).json({
        error: 'Hạn chót là bắt buộc',
        success: false
      });
    }
    
    if (!body.estimateMinutes || body.estimateMinutes <= 0) {
      return res.status(400).json({
        error: 'Thời gian ước tính phải lớn hơn 0',
        success: false
      });
    }

    const task = await prisma.task.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        deadline: new Date(body.deadline),
        priority: body.priority || 'medium',
        estimateMinutes: body.estimateMinutes,
        status: body.status || 'todo'
      }
    });

    res.status(201).json({ task, success: true });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      error: 'Không thể tạo nhiệm vụ mới',
      success: false
    });
  }
});

// GET /api/tasks/:id - Get single task
tasksRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      return res.status(404).json({
        error: 'Không tìm thấy nhiệm vụ',
        success: false
      });
    }

    res.json({ task, success: true });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      error: 'Không thể tải nhiệm vụ',
      success: false
    });
  }
});

// PUT /api/tasks/:id - Update task
tasksRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body: Partial<TaskFormData> = req.body;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return res.status(404).json({
        error: 'Không tìm thấy nhiệm vụ',
        success: false
      });
    }

    // Update task
    const updateData: any = {};
    
    if (body.title !== undefined) {
      if (!body.title.trim()) {
        return res.status(400).json({
          error: 'Tiêu đề là bắt buộc',
          success: false
        });
      }
      updateData.title = body.title.trim();
    }
    
    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null;
    }
    
    if (body.deadline !== undefined) {
      updateData.deadline = new Date(body.deadline);
    }
    
    if (body.priority !== undefined) {
      updateData.priority = body.priority;
    }
    
    if (body.estimateMinutes !== undefined) {
      if (body.estimateMinutes <= 0) {
        return res.status(400).json({
          error: 'Thời gian ước tính phải lớn hơn 0',
          success: false
        });
      }
      updateData.estimateMinutes = body.estimateMinutes;
    }
    
    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData
    });

    res.json({ task, success: true });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      error: 'Không thể cập nhật nhiệm vụ',
      success: false
    });
  }
});

// DELETE /api/tasks/:id - Delete task
tasksRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return res.status(404).json({
        error: 'Không tìm thấy nhiệm vụ',
        success: false
      });
    }

    await prisma.task.delete({
      where: { id }
    });

    res.json({
      message: 'Xóa nhiệm vụ thành công',
      success: true
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      error: 'Không thể xóa nhiệm vụ',
      success: false
    });
  }
});