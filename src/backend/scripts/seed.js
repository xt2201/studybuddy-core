"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Bắt đầu tạo dữ liệu mẫu...');
    // Clear existing data
    await prisma.task.deleteMany();
    console.log('🧹 Đã xóa dữ liệu cũ');
    const now = new Date();
    // Create 15 sample tasks with Vietnamese content
    const tasks = [
        {
            title: 'Làm bài tập Toán học - Chương 3',
            description: 'Hoàn thành các bài tập từ 3.1 đến 3.5 trong sách giáo khoa Đại số 11. Tập trung vào phần hàm số bậc hai.',
            deadline: (0, date_fns_1.addDays)(now, 2),
            priority: 'high',
            estimateMinutes: 120,
            status: 'todo'
        },
        {
            title: 'Ôn tập Văn học - Truyện Kiều',
            description: 'Đọc lại đoạn trích "Lưu thủy nên duyên" và phân tích tâm trạng nhân vật chính.',
            deadline: (0, date_fns_1.addDays)(now, 1),
            priority: 'medium',
            estimateMinutes: 90,
            status: 'doing'
        },
        {
            title: 'Chuẩn bị thuyết trình Lịch sử',
            description: 'Nghiên cứu về cuộc Cách mạng tháng Tám 1945 và tác động của nó đến lịch sử Việt Nam.',
            deadline: (0, date_fns_1.addDays)(now, 3),
            priority: 'high',
            estimateMinutes: 180,
            status: 'todo'
        },
        {
            title: 'Thí nghiệm Hóa học - Phản ứng axit',
            description: 'Chuẩn bị báo cáo thí nghiệm về phản ứng giữa axit và bazơ, ghi chú hiện tượng và giải thích.',
            deadline: (0, date_fns_1.addDays)(now, 4),
            priority: 'medium',
            estimateMinutes: 60,
            status: 'todo'
        },
        {
            title: 'Học từ vựng Tiếng Anh - Unit 5',
            description: 'Thuộc 50 từ vựng mới trong bài "Technology and Communication", làm bài tập áp dụng.',
            deadline: (0, date_fns_1.addHours)(now, 8),
            priority: 'low',
            estimateMinutes: 45,
            status: 'done'
        },
        {
            title: 'Giải bài tập Vật lý - Dao động cơ',
            description: 'Hoàn thành 10 bài tập về dao động điều hòa và con lắc đơn. Ôn lại công thức cơ bản.',
            deadline: (0, date_fns_1.addDays)(now, 1),
            priority: 'high',
            estimateMinutes: 150,
            status: 'doing'
        },
        {
            title: 'Viết luận Giáo dục công dân',
            description: 'Soạn bài luận về "Vai trò của giáo dục trong việc xây dựng nhân cách", tối thiểu 800 từ.',
            deadline: (0, date_fns_1.addDays)(now, 5),
            priority: 'medium',
            estimateMinutes: 120,
            status: 'todo'
        },
        {
            title: 'Ôn tập kiểm tra Sinh học',
            description: 'Ôn lại chương "Di truyền học cơ bản" và "Quy luật Mendel". Làm bài tập trắc nghiệm.',
            deadline: (0, date_fns_1.addHours)(now, 12),
            priority: 'high',
            estimateMinutes: 90,
            status: 'todo'
        },
        {
            title: 'Dự án nhóm Tin học',
            description: 'Phát triển ứng dụng quản lý thư viện bằng Python. Hoàn thiện giao diện người dùng.',
            deadline: (0, date_fns_1.addDays)(now, 7),
            priority: 'medium',
            estimateMinutes: 240,
            status: 'doing'
        },
        {
            title: 'Đọc sách "Tôi thấy hoa vàng trên cỏ xanh"',
            description: 'Đọc và viết cảm nhận về tác phẩm của Nguyễn Nhật Ánh, phân tích tâm lý trẻ em.',
            deadline: (0, date_fns_1.addDays)(now, 6),
            priority: 'low',
            estimateMinutes: 180,
            status: 'todo'
        },
        {
            title: 'Làm bài tập Địa lý - Bản đồ địa hình',
            description: 'Vẽ bản đồ địa hình Việt Nam, đánh dấu các dãy núi và đồng bằng chính.',
            deadline: (0, date_fns_1.subDays)(now, 1),
            priority: 'medium',
            estimateMinutes: 75,
            status: 'todo'
        },
        {
            title: 'Ôn tập Tiếng Anh - Ngữ pháp thì',
            description: 'Ôn lại 12 thì trong Tiếng Anh, làm bài tập về cách sử dụng và cấu trúc.',
            deadline: (0, date_fns_1.addMinutes)(now, 30),
            priority: 'high',
            estimateMinutes: 60,
            status: 'doing'
        },
        {
            title: 'Chuẩn bị thi Olympic Toán',
            description: 'Giải các đề thi Olympic Toán cấp tỉnh những năm trước, tập trung vào hình học.',
            deadline: (0, date_fns_1.addDays)(now, 10),
            priority: 'high',
            estimateMinutes: 300,
            status: 'todo'
        },
        {
            title: 'Viết báo cáo thực tập',
            description: 'Hoàn thành báo cáo về buổi thực tập tại Bảo tàng Lịch sử, bao gồm cảm nhận cá nhân.',
            deadline: (0, date_fns_1.addDays)(now, 2),
            priority: 'low',
            estimateMinutes: 90,
            status: 'done'
        },
        {
            title: 'Chuẩn bị bài hát cho buổi văn nghệ',
            description: 'Tập hát bài "Quê hương" để biểu diễn trong chương trình văn nghệ chào mừng 20/11.',
            deadline: (0, date_fns_1.addDays)(now, 8),
            priority: 'low',
            estimateMinutes: 120,
            status: 'todo'
        }
    ];
    console.log('📝 Đang tạo nhiệm vụ mẫu...');
    for (const taskData of tasks) {
        await prisma.task.create({
            data: taskData
        });
    }
    console.log(`✅ Đã tạo thành công ${tasks.length} nhiệm vụ mẫu!`);
    // Show summary
    const createdTasks = await prisma.task.findMany();
    const totalTasks = createdTasks.length;
    const completedTasks = createdTasks.filter(task => task.status === 'done').length;
    const pendingTasks = createdTasks.filter(task => task.status !== 'done').length;
    const overdueTasks = createdTasks.filter(task => task.status !== 'done' && new Date(task.deadline) < now).length;
    console.log(`
📊 THỐNG KÊ DỮ LIỆU MẪU:
  • Tổng số nhiệm vụ: ${totalTasks}
  • Đã hoàn thành: ${completedTasks}
  • Đang thực hiện: ${pendingTasks}
  • Quá hạn: ${overdueTasks}
  • Độ ưu tiên cao: ${createdTasks.filter(t => t.priority === 'high').length}
  • Độ ưu tiên trung bình: ${createdTasks.filter(t => t.priority === 'medium').length}
  • Độ ưu tiên thấp: ${createdTasks.filter(t => t.priority === 'low').length}
  `);
    console.log('🎉 Hoàn thành việc tạo dữ liệu mẫu!');
}
main()
    .catch((e) => {
    console.error('❌ Lỗi khi tạo dữ liệu mẫu:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map