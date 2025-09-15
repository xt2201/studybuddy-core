# Google Calendar Integration cho StudyBuddy

## 📋 Tổng quan

Tích hợp Google Calendar API v3 vào StudyBuddy để đồng bộ hóa nhiệm vụ học tập với Google Calendar, giúp người dùng quản lý thời gian hiệu quả hơn.

## 🚀 Cài đặt và Cấu hình

### 1. Chuẩn bị Google Calendar API

#### Tạo Google Cloud Project
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project existing
3. Bật Google Calendar API trong API Library
4. Tạo OAuth 2.0 credentials (Desktop application)
5. Tải file `credentials.json`

#### Cấu hình Scopes
Ứng dụng yêu cầu các quyền sau:
- `https://www.googleapis.com/auth/calendar.events` - Quản lý sự kiện (khuyến nghị)
- `https://www.googleapis.com/auth/calendar` - Quyền đầy đủ (nếu cần)

### 2. Thiết lập Backend

#### Environment Variables
Copy file `.env.example` thành `.env` và cập nhật:

```bash
# OpenAI Integration
OPENAI_API_KEY=your-openai-api-key

# Google Calendar Integration  
GOOGLE_CREDENTIALS_PATH=./credentials.json
GOOGLE_TOKEN_PATH=./token.json
GOOGLE_CALENDAR_ID=primary

# Database & Server
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
```

#### Cài đặt Dependencies
```bash
cd src/backend
npm install
npx prisma generate
npx prisma db push
```

### 3. Xác thực lần đầu

#### Sử dụng Demo CLI
```bash
npm run demo
```

Chọn tùy chọn 1 để thiết lập xác thực:
1. Truy cập URL được tạo
2. Đăng nhập Google và cho phép quyền truy cập
3. Copy mã xác thực từ callback URL
4. Paste vào CLI

#### Hoặc sử dụng API endpoints
```bash
# Lấy auth URL
curl http://localhost:3001/api/google-calendar/auth-url

# Submit auth code
curl -X POST http://localhost:3001/api/google-calendar/auth-code \
  -H "Content-Type: application/json" \
  -d '{"code":"your-auth-code-here"}'
```

## 📡 API Endpoints

### Authentication & Setup
- `GET /api/google-calendar/auth-url` - Tạo URL xác thực
- `POST /api/google-calendar/auth-code` - Xử lý mã xác thực
- `GET /api/google-calendar/status` - Kiểm tra trạng thái service

### Synchronization
- `POST /api/google-calendar/sync` - Đồng bộ toàn bộ (manual)
- `POST /api/google-calendar/sync-task/:id` - Đồng bộ task cụ thể
- `DELETE /api/google-calendar/sync-task/:id` - Xóa task khỏi Google Calendar

## 🔄 Cách hoạt động

### Data Mapping
StudyBuddy Task → Google Calendar Event:
- `title` → `summary`
- `description` → `description` (+ metadata)
- `deadline` → `start.dateTime`
- `deadline + estimateMinutes` → `end.dateTime`
- `priority` → `colorId` (high=red, medium=yellow, low=green)
- `id` → `extendedProperties.private.studyBuddyTaskId`

### Sync Strategy
- **Two-way sync** với conflict resolution
- **ID mapping**: Task.googleEventId ↔ Event.id
- **Conflict resolution**: Last-modified-wins + user notification
- **Rate limiting**: Exponential backoff với retry logic

### Database Schema
```prisma
model Task {
  id               String    @id @default(cuid())
  title            String
  description      String?
  deadline         DateTime
  priority         Priority  @default(medium)
  estimateMinutes  Int
  status           Status    @default(todo)
  
  // Google Calendar Integration
  googleEventId    String?   @unique
  googleCalendarId String?
  lastSyncedAt     DateTime?
  
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}
```

## 🧪 Testing

### Chạy Tests
```bash
npm test                    # Chạy tất cả tests
npm run test:watch         # Watch mode
```

### Demo CLI
```bash
npm run demo
```

Demo CLI cung cấp:
1. Thiết lập xác thực
2. Tạo dữ liệu mẫu và demo CRUD operations
3. Kiểm tra trạng thái service
4. Đồng bộ thủ công

### Test Cases Coverage
- ✅ Authentication flow
- ✅ Event CRUD operations (create, update, delete)
- ✅ Event listing và sync
- ✅ Data mapping (Task ↔ Event)
- ✅ Error handling & rate limiting
- ✅ Field validation
- ✅ Timezone handling

## 🔒 Bảo mật

### Nguyên tắc Least Privilege
- Chỉ yêu cầu scope `calendar.events` (không phải toàn bộ calendar)
- Sử dụng OAuth 2.0 với refresh tokens
- Không hardcode credentials trong code

### Token Management  
- `credentials.json`: OAuth client credentials (không commit)
- `token.json`: Access/refresh tokens (không commit)
- Tokens được refresh tự động khi expired
- Lưu trữ an toàn trong gitignore

### Environment Variables
- Tất cả sensitive data trong `.env`
- `.env` files trong `.gitignore`
- Sử dụng `.env.example` làm template

## 📚 Usage Examples

### Tạo task và đồng bộ với Google Calendar
```typescript
// Tạo task mới
const newTask = await prisma.task.create({
  data: {
    title: 'Ôn tập Toán cao cấp',
    description: 'Chuẩn bị cho kỳ thi cuối kỳ',
    deadline: new Date('2024-01-20T14:00:00Z'),
    priority: 'high',
    estimateMinutes: 120,
    status: 'todo'
  }
});

// Đồng bộ với Google Calendar
const eventId = await calendarService.createEvent(newTask);
console.log(`Created Google Calendar event: ${eventId}`);
```

### Đồng bộ toàn bộ
```typescript
const stats = await calendarService.syncOnce();
console.log('Sync completed:', stats);
// Output: { created: 2, updated: 1, deleted: 0 }
```

### Hook vào Task CRUD operations
```typescript
// Trong task routes - tự động sync khi tạo task
tasksRouter.post('/', async (req, res) => {
  const task = await prisma.task.create({ data: req.body });
  
  // Auto-sync to Google Calendar
  try {
    if (calendarService.isInitialized()) {
      await calendarService.createEvent(task);
    }
  } catch (error) {
    console.warn('Failed to sync to Google Calendar:', error);
    // Don't fail the task creation
  }
  
  res.json({ task, success: true });
});
```

## 🔧 Troubleshooting

### Lỗi thường gặp

**"Token not found"**
- Chạy `npm run demo` và chọn tùy chọn 1 để thiết lập xác thực

**"Rate limit exceeded"**
- Service tự động retry với exponential backoff
- Kiểm tra Google Cloud Console quota

**"Credentials file not found"**
- Đảm bảo `credentials.json` có trong thư mục backend
- Kiểm tra `GOOGLE_CREDENTIALS_PATH` trong `.env`

**"Calendar not found"**
- Sử dụng `primary` cho calendar mặc định
- Hoặc lấy Calendar ID từ Google Calendar settings

### Debug Mode
```bash
NODE_ENV=development npm run demo
```

Logs chi tiết sẽ hiển thị các API calls và responses.

## 📈 Performance & Monitoring

### Rate Limiting
- Google Calendar API: 1M requests/day, 100 requests/100s/user
- Implemented exponential backoff: 1s → 2s → 4s → 8s
- Batch operations khi có thể

### Monitoring
- Success/failure rates logged
- Sync statistics tracked
- Performance metrics for API calls

## 🚀 Production Deployment

### Vercel/Production Setup
```bash
# Set production environment variables
GOOGLE_CREDENTIALS_PATH=/var/secrets/credentials.json
GOOGLE_TOKEN_PATH=/var/secrets/token.json
NODE_ENV=production
```

### Security Checklist
- ✅ Credentials không commit trong repository
- ✅ Environment variables configured properly
- ✅ HTTPS required cho OAuth callbacks
- ✅ Rate limiting implemented
- ✅ Error handling không expose sensitive data

## 📖 Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- [OAuth 2.0 for Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
- [googleapis npm package](https://www.npmjs.com/package/googleapis)