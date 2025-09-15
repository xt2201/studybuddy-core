#!/usr/bin/env tsx
/**
 * Google Calendar Integration Demo CLI
 * 
 * This script demonstrates the Google Calendar integration functionality
 * including authentication setup, task synchronization, and CRUD operations.
 */

import { PrismaClient } from '@prisma/client';
import { GoogleCalendarService } from '../src/services/google-calendar.js';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const config = {
  credentialsPath: process.env.GOOGLE_CREDENTIALS_PATH || './credentials.json',
  tokenPath: process.env.GOOGLE_TOKEN_PATH || './token.json',
  calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
  scopes: [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar'
  ]
};

const calendarService = new GoogleCalendarService(config, prisma);

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupAuthentication() {
  console.log('\n=== THIẾT LẬP XÁC THỰC GOOGLE CALENDAR ===');
  
  try {
    await calendarService.initialize();
    console.log('✅ Google Calendar service đã được khởi tạo thành công!');
    return true;
  } catch (error) {
    console.log('⚠️  Cần thiết lập xác thực lần đầu...');
    
    const authUrl = calendarService.getAuthUrl();
    console.log('\n1. Truy cập URL sau để xác thực:');
    console.log(authUrl);
    console.log('\n2. Cho phép ứng dụng truy cập Google Calendar');
    console.log('3. Sao chép mã xác thực từ URL callback');
    
    const code = await question('\nNhập mã xác thực: ');
    
    try {
      await calendarService.handleAuthCode(code.trim());
      await calendarService.initialize();
      console.log('✅ Xác thực thành công! Google Calendar service đã sẵn sàng.');
      return true;
    } catch (error) {
      console.error('❌ Lỗi xác thực:', error);
      return false;
    }
  }
}

async function createSampleTasks() {
  console.log('\n=== TẠO DỮ LIỆU MẪU ===');
  
  const sampleTasks = [
    {
      title: 'Ôn tập Toán cao cấp',
      description: 'Chuẩn bị cho kỳ thi cuối kỳ - chương vi phân tích phân',
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      priority: 'high' as const,
      estimateMinutes: 120,
      status: 'todo' as const
    },
    {
      title: 'Nộp bài tập Lập trình Web',
      description: 'Hoàn thiện project React final',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      priority: 'medium' as const,
      estimateMinutes: 180,
      status: 'doing' as const
    },
    {
      title: 'Đọc tài liệu Machine Learning',
      description: 'Đọc chương 3-5 về Neural Networks',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      priority: 'low' as const,
      estimateMinutes: 90,
      status: 'todo' as const
    }
  ];
  
  const createdTasks = [];
  for (const taskData of sampleTasks) {
    const task = await prisma.task.create({ data: taskData });
    createdTasks.push(task);
    console.log(`✅ Tạo nhiệm vụ: ${task.title}`);
  }
  
  return createdTasks;
}

async function demonstrateCRUDOperations(tasks: any[]) {
  console.log('\n=== DEMO CRUD OPERATIONS VỚI GOOGLE CALENDAR ===');
  
  // Test 1: Create events in Google Calendar
  console.log('\n1. Tạo sự kiện Google Calendar từ nhiệm vụ...');
  for (const task of tasks) {
    try {
      const eventId = await calendarService.createEvent(task);
      console.log(`   ✅ Tạo event ${eventId} cho task "${task.title}"`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit protection
    } catch (error) {
      console.log(`   ❌ Lỗi tạo event cho task "${task.title}":`, error);
    }
  }
  
  // Test 2: Update a task and sync to Google
  console.log('\n2. Cập nhật nhiệm vụ và đồng bộ...');
  const taskToUpdate = tasks[0];
  const updatedTask = await prisma.task.update({
    where: { id: taskToUpdate.id },
    data: {
      title: taskToUpdate.title + ' (CẬP NHẬT)',
      priority: 'medium',
      estimateMinutes: 150
    }
  });
  
  try {
    await calendarService.updateEvent(updatedTask);
    console.log(`   ✅ Cập nhật event cho task "${updatedTask.title}"`);
  } catch (error) {
    console.log(`   ❌ Lỗi cập nhật event:`, error);
  }
  
  // Test 3: List events from Google Calendar
  console.log('\n3. Lấy danh sách sự kiện từ Google Calendar...');
  try {
    const events = await calendarService.listEvents();
    console.log(`   ✅ Tìm thấy ${events.length} sự kiện`);
    events.forEach(event => {
      if (event.extendedProperties?.private?.studyBuddyTaskId) {
        console.log(`   - ${event.summary} (Task ID: ${event.extendedProperties.private.studyBuddyTaskId})`);
      }
    });
  } catch (error) {
    console.log(`   ❌ Lỗi lấy danh sách events:`, error);
  }
  
  // Test 4: Full sync
  console.log('\n4. Thực hiện đồng bộ toàn bộ...');
  try {
    const syncStats = await calendarService.syncOnce();
    console.log(`   ✅ Đồng bộ thành công:`, syncStats);
  } catch (error) {
    console.log(`   ❌ Lỗi đồng bộ:`, error);
  }
  
  // Test 5: Delete events (cleanup)
  console.log('\n5. Dọn dẹp - xóa sự kiện test...');
  for (const task of tasks) {
    try {
      const fullTask = await prisma.task.findUnique({ where: { id: task.id } });
      if (fullTask) {
        await calendarService.deleteEvent(fullTask);
        console.log(`   ✅ Xóa event cho task "${fullTask.title}"`);
      }
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit protection
    } catch (error) {
      console.log(`   ❌ Lỗi xóa event:`, error);
    }
  }
}

async function cleanupTasks(taskIds: string[]) {
  console.log('\n=== DỌN DẸP DỮ LIỆU TEST ===');
  
  for (const id of taskIds) {
    await prisma.task.delete({ where: { id } });
    console.log(`✅ Xóa nhiệm vụ test: ${id}`);
  }
}

async function displayMenu() {
  console.log('\n=== GOOGLE CALENDAR INTEGRATION DEMO ===');
  console.log('1. Thiết lập xác thực');
  console.log('2. Tạo dữ liệu mẫu và demo CRUD');
  console.log('3. Kiểm tra trạng thái service');
  console.log('4. Đồng bộ thủ công');
  console.log('5. Thoát');
  
  return await question('\nChọn tùy chọn (1-5): ');
}

async function checkServiceStatus() {
  console.log('\n=== KIỂM TRA TRẠNG THÁI ===');
  
  try {
    await calendarService.initialize();
    console.log('✅ Google Calendar service: SẴN SÀNG');
    console.log(`📁 Credentials: ${config.credentialsPath}`);
    console.log(`🔑 Token: ${config.tokenPath}`);
    console.log(`📅 Calendar ID: ${config.calendarId}`);
  } catch (error) {
    console.log('❌ Google Calendar service: CHƯA SẴN SÀNG');
    console.log('💡 Hãy chạy tùy chọn 1 để thiết lập xác thực');
  }
}

async function manualSync() {
  console.log('\n=== ĐỒNG BỘ THỦ CÔNG ===');
  
  try {
    await calendarService.initialize();
    const stats = await calendarService.syncOnce();
    console.log('✅ Đồng bộ thành công:', stats);
  } catch (error) {
    console.log('❌ Lỗi đồng bộ:', error);
  }
}

async function main() {
  console.log('🚀 StudyBuddy Google Calendar Integration Demo');
  console.log('===============================================');
  
  try {
    let running = true;
    
    while (running) {
      const choice = await displayMenu();
      
      switch (choice.trim()) {
        case '1':
          await setupAuthentication();
          break;
          
        case '2':
          console.log('\nĐảm bảo đã thiết lập xác thực trước...');
          try {
            await calendarService.initialize();
            const tasks = await createSampleTasks();
            await demonstrateCRUDOperations(tasks);
            
            const cleanup = await question('\nXóa dữ liệu test? (y/n): ');
            if (cleanup.toLowerCase() === 'y') {
              await cleanupTasks(tasks.map(t => t.id));
            }
          } catch (error) {
            console.log('❌ Cần thiết lập xác thực trước. Chạy tùy chọn 1.');
          }
          break;
          
        case '3':
          await checkServiceStatus();
          break;
          
        case '4':
          await manualSync();
          break;
          
        case '5':
          running = false;
          console.log('👋 Tạm biệt!');
          break;
          
        default:
          console.log('❌ Tùy chọn không hợp lệ. Vui lòng chọn 1-5.');
      }
    }
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Run the demo
main().catch(console.error);