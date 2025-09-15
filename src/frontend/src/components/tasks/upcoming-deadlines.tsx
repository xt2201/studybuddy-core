

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Task } from '@/lib/types';
import { VIETNAMESE_LABELS } from '@/lib/constants';
import { formatDateTimeVN, isUpcoming, isOverdue, getRelativeTimeVN } from '@/lib/timezone';

interface UpcomingDeadlinesProps {
  tasks: Task[];
}

export function UpcomingDeadlines({ tasks }: UpcomingDeadlinesProps) {
  // Get upcoming and overdue tasks
  const upcomingTasks = tasks?.filter(task => 
    task?.status !== 'done' && (isUpcoming(task?.deadline) || isOverdue(task?.deadline))
  )?.sort((a, b) => 
    new Date(a?.deadline).getTime() - new Date(b?.deadline).getTime()
  )?.slice(0, 5) ?? [];

  if (upcomingTasks.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-600">
            <Bell className="h-5 w-5" />
            <span>Hạn chót sắp tới</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Không có nhiệm vụ sắp đến hạn</p>
            <p className="text-xs mt-1">Tuyệt vời! Bạn đã hoàn thành tốt!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-orange-600" />
            <span>Hạn chót sắp tới</span>
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            {upcomingTasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingTasks.map((task, index) => {
          const overdue = isOverdue(task?.deadline);
          
          return (
            <motion.div
              key={task?.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                overdue 
                  ? 'border-red-200 bg-red-50/50' 
                  : 'border-orange-200 bg-orange-50/50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-1.5 rounded-full ${overdue ? 'bg-red-100' : 'bg-orange-100'} mt-0.5`}>
                  {overdue ? (
                    <AlertTriangle className="h-3 w-3 text-red-600" />
                  ) : (
                    <Clock className="h-3 w-3 text-orange-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 truncate">
                    {task?.title}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs ${overdue ? 'text-red-600 font-medium' : 'text-orange-600'}`}>
                      {getRelativeTimeVN(task?.deadline)}
                    </span>
                    {overdue && (
                      <Badge variant="destructive" className="text-xs px-2 py-0">
                        {VIETNAMESE_LABELS.overdue}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTimeVN(task?.deadline)}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
