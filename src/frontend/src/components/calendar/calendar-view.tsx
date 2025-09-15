

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { 
  ChevronLeft, 
  ChevronRight, 
  Grid3X3,
  List
} from 'lucide-react';
import type { Task, CalendarDay } from '@/lib/types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth,
  addMonths,
  subMonths
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { getCurrentTimeInVietnam, isToday, formatDateVN } from '@/lib/timezone';
import { useToast } from '@/hooks/use-toast';

export function CalendarView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(getCurrentTimeInVietnam());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const { toast } = useToast();

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await api.get('/tasks');
        
        if (response.data.success) {
          setTasks(response.data.tasks);
        } else {
          toast({
            title: 'Lỗi',
            description: response.data.error || 'Không thể tải danh sách nhiệm vụ',
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

    fetchTasks();
  }, [toast]);

  // Generate calendar days
  const generateCalendarDays = (): CalendarDay[] => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    
    const days = eachDayOfInterval({ start, end });
    
    return days.map(date => ({
      date,
      tasks: tasks?.filter(task => 
        isSameDay(new Date(task?.deadline), date)
      ) ?? [],
      isCurrentMonth: isSameMonth(date, currentDate),
      isToday: isToday(date)
    }));
  };

  const calendarDays = generateCalendarDays();
  const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  // Navigation handlers
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(getCurrentTimeInVietnam());

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold text-gray-900 min-w-[200px] text-center">
            {format(currentDate, 'MMMM yyyy', { locale: vi })}
          </h2>
          <Button variant="outline" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={goToToday}>
            Hôm nay
          </Button>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="h-8"
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Tháng
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="h-8"
            >
              <List className="h-4 w-4 mr-1" />
              Tuần
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-0">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2">
            {weekdays.map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-gray-600 border-b"
              >
                {day}
              </div>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="grid grid-cols-7 gap-0 min-h-[600px]">
            {calendarDays.map((day, index) => (
              <CalendarDay 
                key={day.date.toISOString()}
                day={day}
                index={index}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm">Chú thích</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Ưu tiên cao</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Ưu tiên trung bình</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Ưu tiên thấp</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-300 border-2 border-gray-500"></div>
              <span>Đã hoàn thành</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface CalendarDayProps {
  day: CalendarDay;
  index: number;
}

function CalendarDay({ day, index }: CalendarDayProps) {
  const dayNumber = format(day.date, 'd');
  const tasksToShow = day.tasks?.slice(0, 3) ?? [];
  const remainingTasks = Math.max(0, (day?.tasks?.length ?? 0) - 3);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.01 }}
      className={`min-h-[120px] p-2 border-r border-b transition-all duration-200 hover:bg-gray-50/50 ${
        !day.isCurrentMonth 
          ? 'bg-gray-50/30 text-gray-400' 
          : day.isToday 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-white'
      }`}
    >
      <div className="h-full flex flex-col">
        {/* Day Number */}
        <div className="flex-shrink-0 mb-1">
          <span className={`inline-flex items-center justify-center w-6 h-6 text-sm font-medium rounded-full ${
            day.isToday 
              ? 'bg-blue-500 text-white' 
              : day.isCurrentMonth 
                ? 'text-gray-900' 
                : 'text-gray-400'
          }`}>
            {dayNumber}
          </span>
        </div>

        {/* Tasks */}
        <div className="flex-1 space-y-1 overflow-hidden">
          <AnimatePresence>
            {tasksToShow.map((task, taskIndex) => (
              <motion.div
                key={task?.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: taskIndex * 0.05 }}
                className={`text-xs p-1 rounded truncate border-l-2 ${
                  task?.status === 'done'
                    ? 'bg-gray-100 text-gray-500 border-gray-300'
                    : task?.priority === 'high'
                      ? 'bg-red-50 text-red-700 border-red-400'
                      : task?.priority === 'medium'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-400'
                        : 'bg-green-50 text-green-700 border-green-400'
                } cursor-pointer hover:bg-opacity-75`}
                title={`${task?.title} - ${formatDateVN(task?.deadline, 'HH:mm')}`}
              >
                {task?.title}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {remainingTasks > 0 && (
            <div className="text-xs text-gray-500 px-1">
              +{remainingTasks} nhiệm vụ khác
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
