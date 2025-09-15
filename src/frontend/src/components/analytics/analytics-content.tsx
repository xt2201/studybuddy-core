

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatDurationVN } from '@/lib/timezone';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface AnalyticsData {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  averageCompletionTime: number;
  weeklyData: Array<{
    date: string;
    completed: number;
  }>;
  priorityStats: {
    low: number;
    medium: number;
    high: number;
  };
}

export function AnalyticsContent() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await api.get('/analytics');
        
        if (response.data.success) {
          setAnalytics(response.data);
        } else {
          toast({
            title: 'Lỗi',
            description: response.data.error || 'Không thể tải dữ liệu phân tích',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể kết nối với server',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [toast]);

  if (loading || !analytics) {
    return <div>Đang tải...</div>;
  }

  // Prepare data for charts
  const priorityData = [
    { name: 'Thấp', value: analytics.priorityStats.low, color: '#80D8C3' },
    { name: 'Trung bình', value: analytics.priorityStats.medium, color: '#FF9149' },
    { name: 'Cao', value: analytics.priorityStats.high, color: '#FF9898' }
  ].filter(item => item.value > 0);

  const statusData = [
    { name: 'Hoàn thành', value: analytics.completed, color: '#80D8C3' },
    { name: 'Đang chờ', value: analytics.pending, color: '#60B5FF' },
    { name: 'Quá hạn', value: analytics.overdue, color: '#FF9898' }
  ].filter(item => item.value > 0);

  const weeklyChartData = analytics.weeklyData.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('vi-VN', { 
      weekday: 'short',
      day: 'numeric',
      month: 'numeric'
    })
  }));

  const stats = [
    {
      title: 'Tổng nhiệm vụ',
      value: analytics.total,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: null
    },
    {
      title: 'Tỷ lệ hoàn thành',
      value: `${analytics.completionRate}%`,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: analytics.completionRate >= 70 ? 'positive' : 'negative'
    },
    {
      title: 'Thời gian TB',
      value: formatDurationVN(analytics.averageCompletionTime),
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: null
    },
    {
      title: 'Quá hạn',
      value: analytics.overdue,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: analytics.overdue === 0 ? 'positive' : 'negative'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
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
                  <div className="flex items-center justify-between">
                    <div className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </div>
                    {stat.change && (
                      <Badge variant={stat.change === 'positive' ? 'default' : 'destructive'}>
                        {stat.change === 'positive' ? 'Tốt' : 'Cần cải thiện'}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Completion Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Xu hướng hoàn thành 7 ngày</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyChartData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                    <XAxis 
                      dataKey="date" 
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      label={{ value: 'Ngày', position: 'insideBottom', offset: -15, style: { textAnchor: 'middle', fontSize: 11 } }}
                    />
                    <YAxis 
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                      label={{ value: 'Số nhiệm vụ', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
                    />
                    <Tooltip 
                      labelStyle={{ fontSize: 11 }}
                      contentStyle={{ fontSize: 11 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#60B5FF" 
                      strokeWidth={3}
                      dot={{ fill: '#60B5FF', strokeWidth: 2, r: 4 }}
                      name="Hoàn thành"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-purple-600" />
                <span>Phân bố độ ưu tiên</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [`${value} nhiệm vụ`, name]}
                      labelStyle={{ fontSize: 11 }}
                      contentStyle={{ fontSize: 11 }}
                    />
                    <Legend 
                      verticalAlign="top"
                      wrapperStyle={{ fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Status Overview Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Tổng quan trạng thái nhiệm vụ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                  <XAxis 
                    dataKey="name"
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    label={{ value: 'Trạng thái', position: 'insideBottom', offset: -15, style: { textAnchor: 'middle', fontSize: 11 } }}
                  />
                  <YAxis 
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    label={{ value: 'Số lượng', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value} nhiệm vụ`, 'Số lượng']}
                    labelStyle={{ fontSize: 11 }}
                    contentStyle={{ fontSize: 11 }}
                  />
                  <Legend 
                    verticalAlign="top"
                    wrapperStyle={{ fontSize: 11 }}
                  />
                  <Bar 
                    dataKey="value" 
                    name="Số lượng nhiệm vụ"
                    radius={[4, 4, 0, 0]}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Tóm tắt hiệu suất</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {analytics.completionRate}%
                </div>
                <p className="text-sm text-gray-600">Tỷ lệ hoàn thành tổng thể</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${analytics.completionRate}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {analytics.completed}
                </div>
                <p className="text-sm text-gray-600">Nhiệm vụ đã hoàn thành</p>
                <Badge className="mt-2 bg-green-100 text-green-700">
                  Xuất sắc!
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatDurationVN(analytics.averageCompletionTime)}
                </div>
                <p className="text-sm text-gray-600">Thời gian trung bình</p>
                <p className="text-xs text-gray-500 mt-1">
                  Mỗi nhiệm vụ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
