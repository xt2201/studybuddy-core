import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TaskList } from '@/components/tasks/task-list';
import { TaskStats } from '@/components/tasks/task-stats';
import { AICoachCard } from '@/components/ai-coach/ai-coach-card';
import { UpcomingDeadlines } from '@/components/tasks/upcoming-deadlines';
import { Task } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { tasksApi, getAISuggestion } from '@/lib/api';

export function DashboardContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState('AI Coach đang suy nghĩ...');
  const { toast } = useToast();

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getAll();
      
      if (data.success) {
        setTasks(data.tasks);
      } else {
        toast({
          title: 'Lỗi',
          description: data.error || 'Không thể tải danh sách nhiệm vụ',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể kết nối với server',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch AI suggestion
  const fetchAISuggestion = async (currentTasks: Task[]) => {
    if (currentTasks.length > 0) {
      const suggestion = await getAISuggestion(currentTasks);
      setAiSuggestion(suggestion);
    } else {
      setAiSuggestion('Hãy thêm vài nhiệm vụ để AI Coach có thể bắt đầu giúp bạn!');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchAISuggestion(tasks);
    }
  }, [tasks, loading]);

  // Handle task updates
  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const data = await tasksApi.update(taskId, updates as any);
      
      if (data.success) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        ));
        toast({
          title: 'Thành công',
          description: 'Đã cập nhật nhiệm vụ',
        });
      } else {
        toast({
          title: 'Lỗi',
          description: data.error || 'Không thể cập nhật nhiệm vụ',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật nhiệm vụ',
        variant: 'destructive',
      });
    }
  };

  // Handle task deletion
  const handleTaskDelete = async (taskId: string) => {
    try {
      const data = await tasksApi.delete(taskId);
      
      if (data.success) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        toast({
          title: 'Thành công',
          description: 'Đã xóa nhiệm vụ',
        });
      } else {
        toast({
          title: 'Lỗi',
          description: data.error || 'Không thể xóa nhiệm vụ',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa nhiệm vụ',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TaskStats tasks={tasks} />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <TaskList 
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-6"
        >
          {/* Upcoming Deadlines */}
          <UpcomingDeadlines tasks={tasks} />
          
          {/* AI Coach */}
          <AICoachCard 
            suggestion={aiSuggestion} 
            onRefresh={() => fetchAISuggestion(tasks)}
            tasks={tasks}
          />
        </motion.div>
      </div>
    </div>
  );
}
