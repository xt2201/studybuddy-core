import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

interface Task {
  id: string;
  title: string;
  description?: string;
  deadline: string | Date;
  priority: string;
  estimateMinutes: number;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/suggestion', async (req: express.Request, res: express.Response) => {
  const tasks = req.body.tasks as Task[];

  if (!tasks || tasks.length === 0) {
    return res.status(400).json({ error: 'Task list is required.' });
  }

  try {
    const prompt = `Bạn là trợ lý học tập AI. Phân tích nhiệm vụ và đưa ra 1 gợi ý cụ thể (2-3 câu) bằng tiếng Việt:

    Nhiệm vụ:
    ${tasks
      .map(
        (task) =>
          `- ${task.title} (${task.priority}, hạn ${new Date(
            task.deadline
          ).toLocaleDateString('vi-VN')}, ${task.status})`
      )
      .join('\n')}

    Đưa ra lời khuyên ngắn gọn về: nhiệm vụ cụ thể nào làm trước, cách tổ chức thời gian, hoặc động viên. Kết thúc bằng dấu chấm.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.5,
    });

    const suggestion = response.choices[0]?.message?.content?.trim() || 'Không thể tạo gợi ý lúc này.';
    res.json({ suggestion });
  } catch (error) {
    console.error('Error getting suggestion from OpenAI:', error);
    res.status(500).json({ error: 'Failed to get AI suggestion.' });
  }
});

export default router;
