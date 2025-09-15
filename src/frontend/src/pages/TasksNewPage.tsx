import { TaskForm } from '@/components/tasks/task-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function TasksNewPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Tạo Nhiệm Vụ Mới
        </h1>
        <p className="text-gray-600">
          Thêm nhiệm vụ mới vào danh sách công việc của bạn
        </p>
      </div>

      {/* Form */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-green-600" />
            <span>Chi tiết nhiệm vụ</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm />
        </CardContent>
      </Card>
    </div>
  );
}