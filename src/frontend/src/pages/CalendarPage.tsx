import { Suspense } from 'react';
import { CalendarView } from '@/components/calendar/calendar-view';
import { CalendarSkeleton } from '@/components/calendar/calendar-skeleton';

export default function CalendarPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Lịch Nhiệm Vụ
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Xem tổng quan các nhiệm vụ theo thời gian và lập kế hoạch hiệu quả
        </p>
      </div>

      {/* Calendar Content */}
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarView />
      </Suspense>
    </div>
  );
}