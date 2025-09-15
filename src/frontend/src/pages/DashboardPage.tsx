import { Suspense } from 'react';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Chào mừng đến với StudyBuddy
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Quản lý thời gian học tập hiệu quả với sự hỗ trợ của AI thông minh
        </p>
      </div>

      {/* Dashboard Content */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}