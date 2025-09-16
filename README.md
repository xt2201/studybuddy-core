# NAVER Vietnam AI HACKATHON 2025 - Round 1

# StudyBuddy - Ứng dụng Quản lý Học tập Thông minh

## 🚀 Project Setup & Usage
**Cách cài đặt và chạy dự án trên localhost:**  
✍️  Thực hiện các bước sau:

- `git clone https://github.com/NAVER-Vietnam-AI-Hackathon/web-track-naver-vietnam-ai-hackathon-xt2201.git`
- `cd web-track-naver-vietnam-ai-hackathon-xt2201/src`

### Backend

- `cd backend`
- `npm install`

- **Tạo file .env:**

  ```bash
  cp .env.example .env
  ```

- **Cập nhật file .env với các biến cần thiết:**

  ```env
  OPENAI_API_KEY=your_openai_api_key_here
  GOOGLE_CREDENTIALS_PATH=./credentials.json
  GOOGLE_TOKEN_PATH=./token.json
  GOOGLE_CALENDAR_ID=primary
  ```

- `npx prisma generate`
- `npx prisma db push`
- `npx prisma db seed`
- `npm run dev` (chạy trên port 3000)

### Frontend

- `cd frontend`
- `npm install`

- **Tạo file .env:**

  ```bash
  cp .env.example .env
  ```

- **Cập nhật file .env:**

  ```env
  VITE_API_URL=http://localhost:3001/api
  ```

- `npm run dev` (chạy trên port 5173)

### Truy cập ứng dụng

**🌐 Local Development:** [http://localhost:5173/](http://localhost:5173/)

Sau khi chạy cả backend và frontend, mở trình duyệt và truy cập [http://localhost:5173/](http://localhost:5173/) để sử dụng ứng dụng.

## ⚙️ Environment Variables

### Backend (.env)

- `OPENAI_API_KEY`: API key từ OpenAI để sử dụng GPT-4o-mini cho AI Coach
- `GOOGLE_CREDENTIALS_PATH`: Đường dẫn đến file credentials.json của Google Calendar API
- `GOOGLE_TOKEN_PATH`: Đường dẫn đến file token.json để lưu trữ access token
- `GOOGLE_CALENDAR_ID`: ID của Google Calendar (mặc định là 'primary')

### Frontend (.env)

- `VITE_API_URL`: URL của backend API (mặc định: [http://localhost:3001/api](http://localhost:3001/api))

## 🔗 Deployed Web URL (Optional)

✍️  **Live Demo:** [https://studybuddy-core.vercel.app](https://studybuddy-core.vercel.app)

## 🎥 Demo Video

**Video demo (≤ 2 phút):**  

[![StudyBuddy Demo Video](https://img.youtube.com/vi/MmShcJ0z_js/maxresdefault.jpg)](https://youtu.be/MmShcJ0z_js)

👆 Click vào thumbnail để xem video demo

**Link trực tiếp:** [https://youtu.be/MmShcJ0z_js](https://youtu.be/MmShcJ0z_js)

## 💻 Project Introduction

### a. Tổng quan

✍️  StudyBuddy là ứng dụng web giúp sinh viên và người học quản lý nhiệm vụ, lập kế hoạch, theo dõi tiến độ và nhận gợi ý thông minh từ AI để tối ưu hóa việc học.

### b. Chức năng chính & Hướng dẫn sử dụng

- ✍️ **Quản lý nhiệm vụ:** CRUD nhiệm vụ với tiêu đề, mô tả, hạn chót, độ ưu tiên và trạng thái.
- ✍️ **Lên kế hoạch:** Xem lịch tháng, nhắc nhở deadline.
- ✍️ **Phân tích:** Biểu đồ tương tác thống kê tỷ lệ hoàn thành, xu hướng.
- ✍️ **AI Coach:** Gợi ý ngắn gọn bằng tiếng Việt dựa trên danh sách nhiệm vụ.

### c. Điểm đặc biệt

- ✍️ Tích hợp OpenAI GPT-4o-mini để đưa ra lời khuyên động lực.
- Thiết kế responsive, tối ưu mobile-first.
- Kiến trúc microservices tách biệt Frontend và Backend.

### d. Công nghệ & Triển khai

- ✍️ **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, React Router, Framer Motion, Recharts.
- **Backend:** Node.js, Express.js, Prisma ORM, SQLite, OpenAI SDK.
- **DevOps:** Vercel (frontend), Serverless/Express (backend), Prisma migrations.

### e. Kiến trúc dịch vụ & Cơ sở dữ liệu

- ✍️ **Kiến trúc:** Separated Frontend/Backend, REST API.
- **DB Schema:** Model `Task` (id, title, description, priority, deadline, status, timestamps) trong `prisma/schema.prisma`.

## 🧠 Reflection

### a. Nếu có thêm thời gian, bạn sẽ mở rộng gì?

- ✍️ Thêm tính năng gắn nhãn (tags) và phân loại nhiệm vụ.
- Triển khai tính năng realtime collaboration và thông báo đẩy.
- Cải thiện PWA cho offline support.

### b. Nếu tích hợp thêm AI API, bạn sẽ làm gì?

- ✍️ Thêm Text-to-Speech cho gợi ý AI.
- Xây dựng chatbot hỗ trợ trực tiếp.
- Phân tích lịch sử hoàn thành nhiệm vụ để cá nhân hóa timeline.

## ✅ Checklist


- ✅ Code chạy không lỗi
- ✅ Đã implement đầy đủ CRUD, analytics và AI Coach
- ✅ Đã điền đầy đủ các mục ✍️  trong README
