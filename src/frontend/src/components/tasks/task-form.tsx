

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tasksApi } from '@/lib/api';
import { 
  Save, 
  Calendar as CalendarIcon, 
  Clock,
  Flag,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { VIETNAMESE_LABELS } from '@/lib/constants';
import { TaskFormData, Priority, Status } from '@/lib/types';

interface TaskFormErrors {
  title?: string;
  description?: string;
  deadline?: string;
  priority?: string;
  estimateMinutes?: string;
  status?: string;
}
import { getCurrentTimeInVietnam } from '@/lib/timezone';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { Link } from 'react-router-dom';

export function TaskForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    deadline: format(addDays(getCurrentTimeInVietnam(), 1), "yyyy-MM-dd'T'HH:mm"),
    priority: 'medium',
    estimateMinutes: 60,
    status: 'todo'
  });

  const [errors, setErrors] = useState<TaskFormErrors>({});

  // Validation
  const validateForm = (): boolean => {
    const newErrors: TaskFormErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Hạn chót là bắt buộc';
    } else {
      const deadlineDate = new Date(formData.deadline);
      const now = getCurrentTimeInVietnam();
      if (deadlineDate < now) {
        newErrors.deadline = 'Hạn chót phải sau thời điểm hiện tại';
      }
    }

    if (!formData.estimateMinutes || formData.estimateMinutes <= 0) {
      newErrors.estimateMinutes = 'Thời gian ước tính phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const data = await tasksApi.create(formData);

      if (data.success) {
        toast({
          title: 'Thành công!',
          description: 'Đã tạo nhiệm vụ mới thành công',
        });
        navigate('/');
      } else {
        toast({
          title: 'Lỗi',
          description: data.error || 'Không thể tạo nhiệm vụ',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể kết nối với server',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form field changes
  const updateField = (field: keyof TaskFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof TaskFormErrors]) {
      setErrors(prev => ({ ...prev, [field as keyof TaskFormErrors]: undefined }));
    }
  };

  // Handle numeric field changes
  const updateNumericField = (field: keyof TaskFormData, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
    if (errors[field as keyof TaskFormErrors]) {
      setErrors(prev => ({ ...prev, [field as keyof TaskFormErrors]: undefined }));
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          {VIETNAMESE_LABELS.title} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Nhập tiêu đề nhiệm vụ..."
          className={errors.title ? 'border-red-300' : ''}
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          {VIETNAMESE_LABELS.description}
        </Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Mô tả chi tiết nhiệm vụ (tùy chọn)..."
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Deadline */}
      <div className="space-y-2">
        <Label htmlFor="deadline" className="text-sm font-medium">
          {VIETNAMESE_LABELS.deadline} <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="deadline"
            type="datetime-local"
            value={formData.deadline}
            onChange={(e) => updateField('deadline', e.target.value)}
            className={`pl-10 ${errors.deadline ? 'border-red-300' : ''}`}
            min={format(getCurrentTimeInVietnam(), "yyyy-MM-dd'T'HH:mm")}
          />
        </div>
        {errors.deadline && (
          <p className="text-sm text-red-600">{errors.deadline}</p>
        )}
      </div>

      {/* Priority and Estimate Time Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            <Flag className="inline h-4 w-4 mr-1" />
            {VIETNAMESE_LABELS.priority}
          </Label>
          <Select value={formData.priority} onValueChange={(value) => updateField('priority', value as Priority)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">{VIETNAMESE_LABELS.low}</SelectItem>
              <SelectItem value="medium">{VIETNAMESE_LABELS.medium}</SelectItem>
              <SelectItem value="high">{VIETNAMESE_LABELS.high}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Estimated Time */}
        <div className="space-y-2">
          <Label htmlFor="estimateMinutes" className="text-sm font-medium">
            <Clock className="inline h-4 w-4 mr-1" />
            {VIETNAMESE_LABELS.estimatedTime} <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="estimateMinutes"
              type="number"
              min="1"
              max="1440"
              value={formData.estimateMinutes}
              onChange={(e) => updateNumericField('estimateMinutes', e.target.value)}
              placeholder="60"
              className={errors.estimateMinutes ? 'border-red-300' : ''}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
              phút
            </span>
          </div>
          {errors.estimateMinutes && (
            <p className="text-sm text-red-600">{errors.estimateMinutes}</p>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {VIETNAMESE_LABELS.status}
        </Label>
        <Select value={formData.status} onValueChange={(value) => updateField('status', value as Status)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">{VIETNAMESE_LABELS.todo}</SelectItem>
            <SelectItem value="doing">{VIETNAMESE_LABELS.doing}</SelectItem>
            <SelectItem value="done">{VIETNAMESE_LABELS.done}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Link to="/">
          <Button type="button" variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {VIETNAMESE_LABELS.cancel}
          </Button>
        </Link>
        
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Đang tạo...' : VIETNAMESE_LABELS.create}
        </Button>
      </div>
    </motion.form>
  );
}
