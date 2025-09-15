import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient, Task, Priority, Status } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

interface GoogleCalendarConfig {
  credentialsPath: string;
  tokenPath: string;
  calendarId: string;
  scopes: string[];
}

interface TaskEventMapping {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  colorId?: string;
  extendedProperties?: {
    private?: {
      studyBuddyTaskId: string;
      priority: string;
      status: string;
    };
  };
}

export class GoogleCalendarService {
  private auth: OAuth2Client | null = null;
  private calendar: calendar_v3.Calendar | null = null;
  private config: GoogleCalendarConfig;
  private prisma: PrismaClient;

  constructor(config: GoogleCalendarConfig, prisma: PrismaClient) {
    this.config = config;
    this.prisma = prisma;
  }

  /**
   * Initialize Google Calendar client with authentication
   */
  async initialize(): Promise<void> {
    try {
      // Read credentials
      const credentialsContent = await fs.readFile(this.config.credentialsPath, 'utf8');
      const credentials = JSON.parse(credentialsContent);

      // Create OAuth2 client
      const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
      this.auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

      // Load existing token if available
      try {
        const tokenContent = await fs.readFile(this.config.tokenPath, 'utf8');
        const token = JSON.parse(tokenContent);
        this.auth.setCredentials(token);

        // Refresh token if expired
        const { credentials: refreshedCredentials } = await this.auth.refreshAccessToken();
        if (refreshedCredentials.access_token !== token.access_token) {
          await this.saveToken(refreshedCredentials);
        }
      } catch (error) {
        console.warn('No existing token found. Manual authorization required.');
        throw new Error('Token not found. Please run manual authorization first.');
      }

      // Initialize Calendar API
      this.calendar = google.calendar({ version: 'v3', auth: this.auth });

      console.log('Google Calendar service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Calendar service:', error);
      throw error;
    }
  }

  /**
   * Generate authorization URL for manual setup (development helper)
   */
  getAuthUrl(): string {
    if (!this.auth) {
      throw new Error('Auth client not initialized');
    }
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: this.config.scopes,
    });
  }

  /**
   * Save authorization code and get token (development helper)
   */
  async handleAuthCode(code: string): Promise<void> {
    if (!this.auth) {
      throw new Error('Auth client not initialized');
    }

    const { tokens } = await this.auth.getToken(code);
    this.auth.setCredentials(tokens);
    await this.saveToken(tokens);
  }

  /**
   * Save token to file
   */
  private async saveToken(token: any): Promise<void> {
    await fs.writeFile(this.config.tokenPath, JSON.stringify(token, null, 2));
  }

  /**
   * Create a Google Calendar event from a Task
   */
  async createEvent(task: Task): Promise<string> {
    if (!this.calendar) {
      throw new Error('Calendar service not initialized');
    }

    try {
      const eventResource = this.taskToEventResource(task);
      
      const response = await this.calendar.events.insert({
        calendarId: this.config.calendarId,
        requestBody: eventResource,
      });

      const eventId = response.data.id;
      if (!eventId) {
        throw new Error('Failed to create event - no ID returned');
      }

      // Update task with Google Event ID
      await this.prisma.task.update({
        where: { id: task.id },
        data: {
          googleEventId: eventId,
          googleCalendarId: this.config.calendarId,
          lastSyncedAt: new Date(),
        } as any,
      });

      console.log(`Created Google Calendar event: ${eventId} for task: ${task.id}`);
      return eventId;
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      await this.handleRateLimit(error);
      throw error;
    }
  }

  /**
   * Update a Google Calendar event
   */
  async updateEvent(task: Task): Promise<void> {
    const taskWithGoogleFields = task as Task & { googleEventId?: string | null };
    
    if (!this.calendar || !taskWithGoogleFields.googleEventId) {
      throw new Error('Calendar service not initialized or task has no Google Event ID');
    }

    try {
      const eventResource = this.taskToEventResource(task);
      
      await this.calendar.events.update({
        calendarId: this.config.calendarId,
        eventId: taskWithGoogleFields.googleEventId,
        requestBody: eventResource,
      });

      // Update sync timestamp
      await this.prisma.task.update({
        where: { id: task.id },
        data: { lastSyncedAt: new Date() } as any,
      });

      console.log(`Updated Google Calendar event: ${taskWithGoogleFields.googleEventId} for task: ${task.id}`);
    } catch (error) {
      console.error('Failed to update Google Calendar event:', error);
      await this.handleRateLimit(error);
      throw error;
    }
  }

  /**
   * Delete a Google Calendar event
   */
  async deleteEvent(task: Task): Promise<void> {
    const taskWithGoogleFields = task as Task & { googleEventId?: string | null };
    
    if (!this.calendar || !taskWithGoogleFields.googleEventId) {
      return; // Nothing to delete
    }

    try {
      await this.calendar.events.delete({
        calendarId: this.config.calendarId,
        eventId: taskWithGoogleFields.googleEventId,
      });

      // Clear Google Event ID from task
      await this.prisma.task.update({
        where: { id: task.id },
        data: {
          googleEventId: null,
          googleCalendarId: null,
          lastSyncedAt: new Date(),
        } as any,
      });

      console.log(`Deleted Google Calendar event: ${taskWithGoogleFields.googleEventId} for task: ${task.id}`);
    } catch (error) {
      console.error('Failed to delete Google Calendar event:', error);
      await this.handleRateLimit(error);
      throw error;
    }
  }

  /**
   * List Google Calendar events in date range
   */
  async listEvents(timeMin?: Date, timeMax?: Date): Promise<calendar_v3.Schema$Event[]> {
    if (!this.calendar) {
      throw new Error('Calendar service not initialized');
    }

    try {
      const response = await this.calendar.events.list({
        calendarId: this.config.calendarId,
        timeMin: timeMin?.toISOString(),
        timeMax: timeMax?.toISOString(),
        maxResults: 250,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Failed to list Google Calendar events:', error);
      await this.handleRateLimit(error);
      throw error;
    }
  }

  /**
   * Sync all events from Google Calendar to local database
   */
  async syncOnce(daysAhead: number = 30): Promise<{ created: number; updated: number; deleted: number }> {
    const stats = { created: 0, updated: 0, deleted: 0 };

    try {
      const now = new Date();
      const timeMax = new Date();
      timeMax.setDate(now.getDate() + daysAhead);

      const googleEvents = await this.listEvents(now, timeMax);
      const studyBuddyEvents = googleEvents.filter(
        event => event.extendedProperties?.private?.studyBuddyTaskId
      );

      for (const event of studyBuddyEvents) {
        const taskId = event.extendedProperties?.private?.studyBuddyTaskId;
        if (!taskId) continue;

        const existingTask = await this.prisma.task.findUnique({
          where: { id: taskId },
        });

        if (!existingTask) {
          // Event exists in Google but not locally - create local task
          const newTask = await this.eventResourceToTask(event);
          if (newTask) {
            await this.prisma.task.create({ data: newTask as any });
            stats.created++;
          }
        } else {
          // Check if event was updated after last sync
          const taskWithGoogleFields = existingTask as typeof existingTask & { lastSyncedAt?: Date | null };
          const eventUpdated = new Date(event.updated || 0);
          const lastSync = taskWithGoogleFields.lastSyncedAt || new Date(0);
          
          if (eventUpdated > lastSync) {
            // Update local task with Google event data
            const updatedTask = await this.eventResourceToTask(event);
            if (updatedTask) {
              await this.prisma.task.update({
                where: { id: taskId },
                data: {
                  ...updatedTask,
                  lastSyncedAt: new Date(),
                } as any,
              });
              stats.updated++;
            }
          }
        }
      }

      console.log('Google Calendar sync completed:', stats);
      return stats;
    } catch (error) {
      console.error('Failed to sync Google Calendar events:', error);
      throw error;
    }
  }

  /**
   * Convert Task to Google Calendar event resource
   */
  private taskToEventResource(task: Task): TaskEventMapping {
    // Calculate event duration based on estimate
    const startTime = new Date(task.deadline);
    const endTime = new Date(startTime.getTime() + (task.estimateMinutes || 30) * 60 * 1000);

    // Map priority to color
    const priorityColorMap: Record<Priority, string> = {
      high: '11', // Red
      medium: '5', // Yellow
      low: '10', // Green
    };

    return {
      summary: task.title,
      description: task.description || `Nhiệm vụ từ StudyBuddy\nƯu tiên: ${task.priority}\nThời gian ước tính: ${task.estimateMinutes} phút`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      colorId: priorityColorMap[task.priority] || '1',
      extendedProperties: {
        private: {
          studyBuddyTaskId: task.id,
          priority: task.priority,
          status: task.status,
        },
      },
    };
  }

  /**
   * Convert Google Calendar event to Task data
   */
  private async eventResourceToTask(event: calendar_v3.Schema$Event): Promise<any | null> {
    if (!event.start?.dateTime || !event.summary) {
      return null;
    }

    const deadline = new Date(event.start.dateTime);
    const endTime = event.end?.dateTime ? new Date(event.end.dateTime) : new Date(deadline.getTime() + 30 * 60 * 1000);
    const estimateMinutes = Math.round((endTime.getTime() - deadline.getTime()) / (60 * 1000));

    // Map color back to priority
    const colorPriorityMap: { [key: string]: 'high' | 'medium' | 'low' } = {
      '11': 'high',   // Red
      '5': 'medium',  // Yellow
      '10': 'low',    // Green
    };

    const priority = colorPriorityMap[event.colorId || ''] || 'medium';
    const status = event.extendedProperties?.private?.status || 'todo';

    return {
      id: event.extendedProperties?.private?.studyBuddyTaskId,
      title: event.summary,
      description: event.description,
      deadline,
      priority,
      estimateMinutes,
      status,
      googleEventId: event.id,
      googleCalendarId: this.config.calendarId,
      lastSyncedAt: new Date(),
    };
  }

  /**
   * Handle rate limiting with exponential backoff
   */
  private async handleRateLimit(error: any): Promise<void> {
    if (error.code === 429 || error.status === 429) {
      const retryAfter = error.headers?.['retry-after'] ? parseInt(error.headers['retry-after']) * 1000 : 5000;
      console.log(`Rate limited. Waiting ${retryAfter}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, retryAfter));
    }
  }
}