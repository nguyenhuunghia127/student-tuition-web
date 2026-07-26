<div align="center">
  <img src="https://img.shields.io/badge/Edu-Manager%20Pro-blue?style=for-the-badge&logo=react" alt="Logo" />
  <h1>🎓 EduManager Pro</h1>
  <p><em>Nền Tảng Quản Lý Trung Tâm & Học Phí Toàn Diện Thế Hệ Mới</em></p>
  <p>
    <a href="https://student-tuition-web.vercel.app" target="_blank">
      <img src="https://img.shields.io/badge/Live%20Demo-Vercel-black?style=flat-square&logo=vercel" alt="Live Demo" />
    </a>
    <img src="https://img.shields.io/badge/Version-2.0.0-success?style=flat-square" alt="Version" />
    <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
  </p>
</div>

---

## 🌟 Về Sản Phẩm

**EduManager Pro** (Student Tuition Web) không chỉ là một phần mềm quản lý, mà là một hệ sinh thái số hóa toàn diện dành cho các trường học, trung tâm ngoại ngữ và cơ sở giáo dục. Thay vì những bảng tính Excel cồng kềnh, EduManager Pro mang đến một giao diện **Glassmorphism** cực kỳ sang trọng, trải nghiệm **Bento Grid** hiện đại và quy trình tự động hóa lên đến 90%.

Sản phẩm cung cấp **3 cổng thông tin độc lập** đem lại trải nghiệm cá nhân hóa tối đa:
- 👑 **Admin Portal:** Trạm điều khiển trung tâm quyền lực dành cho Ban Giám Đốc/Giáo viên.
- 👨‍🎓 **Student Portal:** Không gian học tập số hóa chuyên biệt dành cho Học sinh.
- 👨‍👩‍👧‍👦 **Parent Portal:** Ứng dụng đồng hành sát sao cùng Phụ huynh.

---

## 🚀 Tính Năng Cốt Lõi (Core Features)

### 👑 1. Quản Trị Trung Tâm Tự Động (Admin Portal)
- 📊 **Bento Dashboard Real-time:** Theo dõi dòng tiền, sĩ số, tình trạng lớp học ngay tại một màn hình duy nhất.
- 🏫 **Quản Lý Lớp Học & "Lớp Tạm" Thông Minh:** Tự động phát hiện học sinh chưa có lớp, gom nhóm tự động để quản lý học phí một chạm.
- 💰 **Hệ Thống Thu Học Phí Tự Động (VietQR API):** Tự động sinh mã QR chứa số tiền và nội dung. Quản lý trạng thái thanh toán chuyên nghiệp.
- 🧾 **Xuất Biên Lai PDF (Mới):** Chỉ với 1 click, hệ thống sinh ra Biên lai điện tử (PDF) chuyên nghiệp, uy tín cho mọi giao dịch.
- ✉️ **Quy Trình Xin Nghỉ Phép Số Hóa (Mới):** Không còn việc nhắn tin xin phép rời rạc. Học sinh gửi đơn qua web, Admin duyệt/từ chối tự động bằng 1 nút bấm trên bảng chuyên dụng.
- 📈 **Sổ Điểm Điện Tử & Phúc Khảo:** Tính GPA tự động, xử lý quy trình khiếu nại điểm số minh bạch.
- 📚 **Kho Tài Liệu & Giao Bài Tập:** Lưu trữ tài liệu (như Google Drive), giao bài tập có deadline, chấm bài trực tiếp.

### 👨‍🎓 2. Không Gian Học Tập Số (Student Portal)
- **Ví Điện Tử & Học Phí:** Theo dõi công nợ rõ ràng. Thanh toán 1 chạm bằng QR code và tải Biên lai đỏ (PDF) chứng nhận thanh toán.
- **Quản Lý Học Tập:** Nộp bài tập online, xem điểm số, tra cứu thời khóa biểu.
- **Gửi Đơn Xin Nghỉ (Mới):** Gửi yêu cầu nghỉ học với lý do chi tiết trực tiếp cho Admin, theo dõi trạng thái duyệt đơn theo thời gian thực.

### 👨‍👩‍👧‍👦 3. Ứng Dụng Đồng Hành Cùng Phụ Huynh (Parent Portal)
- **Giám Sát 360 Độ:** Xem lịch trình học tập, tiến độ làm bài, bảng điểm của con cái.
- **Lịch Sử Giao Dịch:** Kiểm soát lịch sử đóng tiền học, tải về Biên lai PDF để lưu trữ bất cứ lúc nào.

---

## 🛠️ Kiến Trúc Công Nghệ (Tech Stack)

EduManager Pro được xây dựng trên kiến trúc **Microservices-oriented** linh hoạt và siêu tốc:

| Layer | Công Nghệ Sử Dụng | Ưu Điểm Nổi Bật |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Framer Motion | Tốc độ load siêu việt, UI/UX hiện đại (Glassmorphism), tích hợp sẵn Dark/Light Mode. |
| **Backend** | Node.js v22+, Express.js | API tốc độ cao, xử lý luồng mượt mà, bảo mật vững chắc (Helmet, XSS, Rate-limit). |
| **Database** | Supabase (PostgreSQL) | Đảm bảo tính toàn vẹn ACID, cấu trúc Database chuẩn hóa 3NF. |
| **Security**| JWT Token, Cấu hình CORS | Cơ chế Interceptor tự động gắn token, xác thực đa phân quyền an toàn tuyệt đối. |

---

## 💻 Hướng Dẫn Triển Khai Nhanh (Quick Start)

### Yêu Cầu Hệ Thống
- [Node.js](https://nodejs.org/) (v18+ hoặc v22+)
- Tài khoản [Supabase](https://supabase.com/)

### 1. Khởi Tạo Cơ Sở Dữ Liệu
1. Tạo một dự án mới trên Supabase.
2. Mở tab **SQL Editor** -> Dán toàn bộ script trong file `database.sql` và chạy (Run).
3. Lấy `Project URL` và `Service Role Key` từ phần cài đặt API của Supabase để cấu hình Backend.

### 2. Chạy Máy Chủ Backend (API)
```bash
git clone https://github.com/nguyenhuunghia127/student-tuition-web.git
cd student-tuition-web/backend
```
*Tạo file `.env` tại thư mục backend:*
```env
PORT=5000
SUPABASE_URL=https://[PROJECT-ID].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_secret_role_key
JWT_SECRET=your_super_secret_jwt_key

# Cấu hình thanh toán VietQR
BANK_ID=Vikki Digital Bank
ACCOUNT_NO=935042177
ACCOUNT_NAME=NGUYEN HUU CHANH
```
*Khởi động Backend:*
```bash
npm install
npm run dev
```

### 3. Chạy Giao Diện Frontend (Web)
```bash
cd ../frontend
```
*Tạo file `.env` tại thư mục frontend:*
```env
VITE_SUPABASE_URL=https://[PROJECT-ID].supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:5000
```
*Khởi động Frontend:*
```bash
npm install
npm run dev
```

---

## ☁️ Triển Khai Môi Trường Thực Tế (Production Deployment)
Sản phẩm được thiết kế để dễ dàng triển khai Cloud hoàn toàn miễn phí:
1. **Backend:** Khuyến nghị triển khai Node.js API lên **Render.com** (hoặc Railway). Nhớ cấu hình đầy đủ Environment Variables.
2. **Frontend:** Triển khai thư mục `frontend` lên **Vercel** hoặc **Netlify**. Đừng quên cấu hình biến môi trường `VITE_API_URL` trỏ tới link Render của Backend.

---
<div align="center">
  <p>Được xây dựng với 🩵 và kiến trúc lập trình hiện đại nhất.</p>
</div>
