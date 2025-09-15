
export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline: Date;
  priority: Priority;
  estimateMinutes: number;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskFormData {
  title: string;
  description?: string;
  deadline: string; // ISO string for forms
  priority: Priority;
  estimateMinutes: number;
  status: Status;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  averageCompletionTime: number;
}

export interface CalendarDay {
  date: Date;
  tasks: Task[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface AICoachSuggestion {
  type: 'deadline' | 'priority' | 'timeEstimate' | 'general';
  message: string;
  suggestedValue?: any;
  confidence: number;
}

export interface NotificationData {
  id: string;
  type: 'deadline_reminder' | 'task_overdue' | 'task_completed';
  title: string;
  message: string;
  taskId?: string;
  timestamp: Date;
  read: boolean;
}
