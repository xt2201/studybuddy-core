

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Filter, 
  Search, 
  Clock, 
  Calendar, 
  Flag, 
  Edit, 
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Task, Priority, Status } from '@/lib/types';
import { VIETNAMESE_LABELS, PRIORITY_COLORS, STATUS_COLORS } from '@/lib/constants';
import { isOverdue, getRelativeTimeVN, formatDurationVN } from '@/lib/timezone';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
}

export function TaskList({ tasks, onTaskUpdate, onTaskDelete }: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'created'>('deadline');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Filter and sort tasks
  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) || 
                         task?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task?.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task?.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  })?.sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        return new Date(a?.deadline).getTime() - new Date(b?.deadline).getTime();
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b?.priority] ?? 0) - (priorityOrder[a?.priority] ?? 0);
      case 'created':
        return new Date(b?.createdAt).getTime() - new Date(a?.createdAt).getTime();
      default:
        return 0;
    }
  }) ?? [];

  // Handle status change
  const handleStatusToggle = (task: Task, newStatus: Status) => {
    onTaskUpdate(task.id, { status: newStatus });
  };

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>{VIETNAMESE_LABELS.tasks}</span>
            <Badge variant="secondary" className="ml-2">
              {filteredTasks?.length ?? 0}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            className="text-gray-500"
          >
            <Filter className="h-4 w-4 mr-1" />
            Lọc
            {isFiltersExpanded ? (
              <ChevronUp className="h-4 w-4 ml-1" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-1" />
            )}
          </Button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {isFiltersExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-4 border-t"
            >
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm nhiệm vụ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap gap-4">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Status | 'all')}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="todo">{VIETNAMESE_LABELS.todo}</SelectItem>
                    <SelectItem value="doing">{VIETNAMESE_LABELS.doing}</SelectItem>
                    <SelectItem value="done">{VIETNAMESE_LABELS.done}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as Priority | 'all')}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Độ ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả độ ưu tiên</SelectItem>
                    <SelectItem value="low">{VIETNAMESE_LABELS.low}</SelectItem>
                    <SelectItem value="medium">{VIETNAMESE_LABELS.medium}</SelectItem>
                    <SelectItem value="high">{VIETNAMESE_LABELS.high}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'deadline' | 'priority' | 'created')}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deadline">Hạn chót</SelectItem>
                    <SelectItem value="priority">Độ ưu tiên</SelectItem>
                    <SelectItem value="created">Ngày tạo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>

      <CardContent className="space-y-4">
        {filteredTasks?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">{VIETNAMESE_LABELS.noTasks}</p>
            <p className="text-sm">Hãy tạo nhiệm vụ đầu tiên của bạn!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task, index) => (
              <TaskItem
                key={task?.id}
                task={task}
                index={index}
                onStatusChange={handleStatusToggle}
                onDelete={onTaskDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TaskItemProps {
  task: Task;
  index: number;
  onStatusChange: (task: Task, newStatus: Status) => void;
  onDelete: (taskId: string) => void;
}

function TaskItem({ task, index, onStatusChange, onDelete }: TaskItemProps) {
  const overdue = isOverdue(task?.deadline);
  const completed = task?.status === 'done';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
        overdue && !completed
          ? 'border-red-200 bg-red-50/50'
          : completed
          ? 'border-green-200 bg-green-50/50'
          : 'border-gray-200 bg-white/50'
      }`}
    >
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <div className="pt-1">
          <Checkbox
            checked={completed}
            onCheckedChange={(checked) => {
              onStatusChange(task, checked ? 'done' : 'todo');
            }}
            className="h-5 w-5"
          />
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-gray-900 mb-1 ${
                completed ? 'line-through text-gray-500' : ''
              }`}>
                {task?.title}
              </h3>
              {task?.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {task.description}
                </p>
              )}
              
              {/* Task Meta */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge className={PRIORITY_COLORS[task?.priority ?? 'medium']}>
                  <Flag className="h-3 w-3 mr-1" />
                  {VIETNAMESE_LABELS[task?.priority ?? 'medium']}
                </Badge>
                
                <Badge className={STATUS_COLORS[task?.status ?? 'todo']}>
                  {VIETNAMESE_LABELS[task?.status ?? 'todo']}
                </Badge>
                
                <span className={`flex items-center ${overdue && !completed ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                  <Calendar className="h-3 w-3 mr-1" />
                  {getRelativeTimeVN(task?.deadline)}
                </span>
                
                <span className="flex items-center text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDurationVN(task?.estimateMinutes ?? 0)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                onClick={() => onDelete(task?.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
