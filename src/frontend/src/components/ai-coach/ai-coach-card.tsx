import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Lightbulb, RefreshCw } from 'lucide-react';
import { VIETNAMESE_LABELS } from '@/lib/constants';

interface AICoachCardProps {
  suggestion: string;
  onRefresh: () => void;
  tasks?: any[]; // Add tasks prop for stats
}

export function AICoachCard({ suggestion, onRefresh, tasks = [] }: AICoachCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRefresh = async () => {
    setIsGenerating(true);
    await onRefresh();
    setIsGenerating(false);
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-blue-50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {VIETNAMESE_LABELS.aiCoachTitle}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isGenerating}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div
          key={suggestion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm text-gray-600 dark:text-gray-300 min-h-[150px] flex items-start py-2"
        >
          <Lightbulb className="h-5 w-5 mr-3 text-yellow-400 flex-shrink-0 mt-1" />
          <p className="leading-relaxed break-words whitespace-pre-wrap">
            {isGenerating ? 'AI Coach đang suy nghĩ...' : suggestion}
          </p>
        </motion.div>
        
        {/* Quick Stats */}
        <div className="pt-4 border-t border-purple-100">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-2 rounded-lg bg-white/60">
              <div className="text-lg font-bold text-purple-600">
                {tasks?.filter((t: any) => t?.status === 'done')?.length ?? 0}
              </div>
              <div className="text-xs text-gray-600">Đã hoàn thành</div>
            </div>
            <div className="p-2 rounded-lg bg-white/60">
              <div className="text-lg font-bold text-blue-600">
                {Math.round(tasks?.length > 0 ? (tasks.filter((t: any) => t?.status === 'done').length / tasks.length) * 100 : 0)}%
              </div>
              <div className="text-xs text-gray-600">Tỷ lệ thành công</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
