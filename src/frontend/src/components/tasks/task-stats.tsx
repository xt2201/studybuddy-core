

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { Task } from '@/lib/types';
import { VIETNAMESE_LABELS } from '@/lib/constants';
import { isOverdue } from '@/lib/timezone';

interface TaskStatsProps {
  tasks: Task[];
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const total = tasks?.length ?? 0;
  const completed = tasks?.filter(task => task?.status === 'done')?.length ?? 0;
  const pending = tasks?.filter(task => task?.status !== 'done')?.length ?? 0;
  const overdue = tasks?.filter(task => 
    task?.status !== 'done' && isOverdue(task?.deadline)
  )?.length ?? 0;
  
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    {
      title: VIETNAMESE_LABELS.totalTasks,
      value: total,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'nhiệm vụ'
    },
    {
      title: VIETNAMESE_LABELS.completedTasks,
      value: completed,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'hoàn thành'
    },
    {
      title: VIETNAMESE_LABELS.pendingTasks,
      value: pending,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'đang chờ'
    },
    {
      title: VIETNAMESE_LABELS.overdue,
      value: overdue,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'quá hạn'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                    className={`text-3xl font-bold ${stat.color}`}
                  >
                    {stat.value}
                  </motion.div>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
                {stat.title === VIETNAMESE_LABELS.completedTasks && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>{VIETNAMESE_LABELS.completionRate}</span>
                      <span>{completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${completionRate}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
