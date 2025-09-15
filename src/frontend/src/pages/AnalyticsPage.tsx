import { Suspense } from 'react';
import { AnalyticsContent } from '@/components/analytics/analytics-content';
import { AnalyticsSkeleton } from '@/components/analytics/analytics-skeleton';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Phân Tích Hiệu Suất
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Theo dõi tiến độ học tập và phân tích xu hướng để cải thiện hiệu quả
        </p>
      </div>

      {/* Analytics Content */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}