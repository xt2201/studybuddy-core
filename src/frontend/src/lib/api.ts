import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making API request to:', `${config.baseURL || ''}${config.url || ''}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Task interfaces
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  deadline: string | Date;
  priority: 'low' | 'medium' | 'high';
  estimateMinutes: number;
  status: 'todo' | 'doing' | 'done';
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface TaskFormData {
  title: string;
  description?: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  estimateMinutes: number;
  status: 'todo' | 'doing' | 'done';
}

// Analytics interface
export interface AnalyticsData {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  averageCompletionTime: number;
  weeklyData: Array<{
    date: string;
    completed: number;
  }>;
  priorityStats: {
    low: number;
    medium: number;
    high: number;
  };
  success: boolean;
}

// Task API methods
export const tasksApi = {
  // Get all tasks
  async getAll(params?: { status?: string; priority?: string }) {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  // Get single task
  async getById(id: string) {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create task
  async create(data: TaskFormData) {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  // Update task
  async update(id: string, data: Partial<TaskFormData>) {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  // Delete task
  async delete(id: string) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

// Analytics API methods
export const analyticsApi = {
  // Get analytics data
  async get() {
    const response = await api.get('/analytics');
    return response.data;
  },
};

// Get AI suggestion
export const getAISuggestion = async (tasks: any[]) => {
  try {
    console.log('Sending tasks to AI API:', tasks.length, 'tasks');
    const response = await api.post('/ai/suggestion', { tasks });
    console.log('AI API response:', response.data);
    return response.data.suggestion || 'Hãy thêm một số nhiệm vụ để AI Coach có thể giúp bạn!';
  } catch (error: any) {
    console.error('Error getting AI suggestion:', error);
    console.error('Error response:', error.response?.data);
    
    // More specific error messages
    if (error.response?.status === 400) {
      return 'Không có nhiệm vụ nào để phân tích. Hãy thêm một số nhiệm vụ!';
    } else if (error.response?.status === 500) {
      return 'Lỗi server khi tạo gợi ý AI. Vui lòng thử lại sau.';
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      return 'Không thể kết nối với server AI. Kiểm tra kết nối mạng.';
    }
    
    return 'Không thể tải gợi ý từ AI lúc này. Hãy thử lại sau.';
  }
};