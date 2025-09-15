import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleCalendarService } from '../services/google-calendar.js';

export const googleCalendarRouter = Router();
const prisma = new PrismaClient();

// Initialize Google Calendar service
const calendarService = new GoogleCalendarService({
  credentialsPath: process.env.GOOGLE_CREDENTIALS_PATH || 'credentials.json',
  tokenPath: process.env.GOOGLE_TOKEN_PATH || 'token.json',
  calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
  scopes: [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar'
  ]
}, prisma);

// Initialize service on startup
let serviceInitialized = false;
const initializeService = async () => {
  if (!serviceInitialized) {
    try {
      await calendarService.initialize();
      serviceInitialized = true;
      console.log('Google Calendar service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Calendar service:', error);
      serviceInitialized = false;
    }
  }
  return serviceInitialized;
};

// GET /api/google-calendar/auth-url - Get authorization URL for manual setup
googleCalendarRouter.get('/auth-url', async (req: Request, res: Response) => {
  try {
    const authUrl = calendarService.getAuthUrl();
    res.json({ 
      success: true, 
      authUrl,
      message: 'Visit this URL to authorize the application'
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({
      error: 'Không thể tạo URL xác thực',
      success: false
    });
  }
});

// POST /api/google-calendar/auth-code - Handle authorization code
googleCalendarRouter.post('/auth-code', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        error: 'Mã xác thực là bắt buộc',
        success: false
      });
    }

    await calendarService.handleAuthCode(code);
    serviceInitialized = true;
    
    res.json({ 
      success: true,
      message: 'Xác thực thành công. Google Calendar đã được kết nối.'
    });
  } catch (error) {
    console.error('Error handling auth code:', error);
    res.status(500).json({
      error: 'Không thể xử lý mã xác thực',
      success: false
    });
  }
});

// POST /api/google-calendar/sync - Manual sync with Google Calendar
googleCalendarRouter.post('/sync', async (req: Request, res: Response) => {
  try {
    const initialized = await initializeService();
    if (!initialized) {
      return res.status(503).json({
        error: 'Dịch vụ Google Calendar chưa được khởi tạo. Vui lòng xác thực trước.',
        success: false
      });
    }

    const stats = await calendarService.syncOnce();
    
    res.json({ 
      success: true,
      stats,
      message: 'Đồng bộ thành công với Google Calendar'
    });
  } catch (error) {
    console.error('Error syncing with Google Calendar:', error);
    res.status(500).json({
      error: 'Không thể đồng bộ với Google Calendar',
      success: false
    });
  }
});

// POST /api/google-calendar/sync-task/:id - Sync specific task to Google Calendar
googleCalendarRouter.post('/sync-task/:id', async (req: Request, res: Response) => {
  try {
    const initialized = await initializeService();
    if (!initialized) {
      return res.status(503).json({
        error: 'Dịch vụ Google Calendar chưa được khởi tạo. Vui lòng xác thực trước.',
        success: false
      });
    }

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

    const taskWithGoogleFields = task as typeof task & { googleEventId?: string | null };
    let eventId: string;
    
    if (taskWithGoogleFields.googleEventId) {
      // Update existing event
      await calendarService.updateEvent(task);
      eventId = taskWithGoogleFields.googleEventId;
    } else {
      // Create new event
      eventId = await calendarService.createEvent(task);
    }
    
    res.json({ 
      success: true,
      eventId,
      message: 'Đồng bộ nhiệm vụ thành công với Google Calendar'
    });
  } catch (error) {
    console.error('Error syncing task to Google Calendar:', error);
    res.status(500).json({
      error: 'Không thể đồng bộ nhiệm vụ với Google Calendar',
      success: false
    });
  }
});

// DELETE /api/google-calendar/sync-task/:id - Remove task from Google Calendar
googleCalendarRouter.delete('/sync-task/:id', async (req: Request, res: Response) => {
  try {
    const initialized = await initializeService();
    if (!initialized) {
      return res.status(503).json({
        error: 'Dịch vụ Google Calendar chưa được khởi tạo. Vui lòng xác thực trước.',
        success: false
      });
    }

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

    await calendarService.deleteEvent(task);
    
    res.json({ 
      success: true,
      message: 'Xóa nhiệm vụ khỏi Google Calendar thành công'
    });
  } catch (error) {
    console.error('Error removing task from Google Calendar:', error);
    res.status(500).json({
      error: 'Không thể xóa nhiệm vụ khỏi Google Calendar',
      success: false
    });
  }
});

// GET /api/google-calendar/status - Check service status
googleCalendarRouter.get('/status', async (req: Request, res: Response) => {
  try {
    const initialized = await initializeService();
    
    res.json({ 
      success: true,
      initialized,
      message: initialized 
        ? 'Google Calendar service đã sẵn sàng'
        : 'Google Calendar service chưa được khởi tạo'
    });
  } catch (error) {
    console.error('Error checking service status:', error);
    res.status(500).json({
      error: 'Không thể kiểm tra trạng thái dịch vụ',
      success: false
    });
  }
});

export { calendarService };