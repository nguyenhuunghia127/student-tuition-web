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

**EduManager Pro** (Student Tuition Web) không chỉ là một phần mềm quản lý thông thường, mà là một hệ sinh thái số hóa toàn diện dành cho các trường học, trung tâm ngoại ngữ và cơ sở giáo dục. 

Thay vì những bảng tính Excel cồng kềnh, EduManager Pro mang đến một giao diện **Glassmorphism** cực kỳ sang trọng, trải nghiệm **Bento Grid** hiện đại, kết nối WebSockets siêu tốc thời gian thực (**Realtime**) và quy trình tự động hóa lên đến 90%. Hệ thống được tích hợp tiêu chuẩn bảo mật khắt khe và hệ thống **Audit Logs** (nhật ký hoạt động) cấp độ doanh nghiệp.

Sản phẩm cung cấp **3 cổng thông tin độc lập** đem lại trải nghiệm cá nhân hóa tối đa:
- 👑 **Admin Portal:** Trạm điều khiển trung tâm quyền lực dành cho Ban Giám Đốc/Giáo viên.
- 👨‍🎓 **Student Portal:** Không gian học tập số hóa chuyên biệt dành cho Học sinh.
- 👨‍👩‍👧‍👦 **Parent Portal:** Ứng dụng đồng hành sát sao cùng Phụ huynh.

---

## 🚀 Tính Năng Cốt Lõi (Core Features)

### 👑 1. Quản Trị Trung Tâm Tự Động (Admin Portal)
- 📊 **Dashboard Real-time:** Theo dõi dòng tiền, sĩ số, tình trạng lớp học. Bất kỳ thay đổi nào từ phía học sinh (nộp bài, đóng tiền) đều làm mới dữ liệu lập tức trên màn hình Admin mà không cần tải lại trang.
- 🏫 **Quản Lý Lớp Học & "Lớp Tạm" Thông Minh:** Tự động phát hiện học sinh chưa có lớp, gom nhóm để quản lý học phí một chạm.
- 💰 **Thu Học Phí Tự Động & Hóa Đơn PDF:** Tự động sinh mã VietQR chứa nội dung thanh toán. Quản lý trạng thái thanh toán và hỗ trợ xuất **Biên lai điện tử PDF** chỉ với 1 click.
- ✉️ **Quy Trình Xin Nghỉ Phép Số Hóa:** Học sinh gửi đơn qua web, Admin duyệt/từ chối nhanh chóng.
- 📈 **Sổ Điểm Điện Tử & Bài Tập:** Tính GPA tự động. Quản lý bài tập (deadline, link nộp bài) và lưu trữ kho tài liệu.
- 🛡️ **Nhật Ký Hoạt Động (Audit Logs):** Theo dõi mọi hành động (tạo tài liệu, duyệt đơn, xuất hóa đơn) chi tiết đến từng mili-giây để truy vết rõ ràng.

### 👨‍🎓 2. Không Gian Học Tập Số (Student Portal)
- **Ví Điện Tử & Học Phí:** Theo dõi công nợ, thanh toán 1 chạm bằng mã QR, tải Biên lai đóng tiền về máy.
- **Quản Lý Học Tập:** Nhận thông báo mới nhất, nộp bài tập online, xem bảng điểm, tra cứu thời khóa biểu theo thời gian thực (Supabase Realtime).
- **Xin Nghỉ Có Phép:** Soạn đơn xin phép gửi trực tiếp đến cho Admin và theo dõi trạng thái duyệt đơn.

### 👨‍👩‍👧‍👦 3. Đồng Hành Cùng Phụ Huynh (Parent Portal)
- **Giám Sát 360 Độ:** Xem lịch trình học tập, bảng điểm, bài tập của con cái từ xa.
- **Lịch Sử Giao Dịch:** Kiểm soát minh bạch dòng tiền, lịch sử đóng tiền học, tải biên lai về máy bất cứ lúc nào.

---

## 🔒 Bảo Mật Nâng Cao (Advanced Security)

Dự án áp dụng các tiêu chuẩn bảo mật khắt khe nhất, bảo vệ dữ liệu người dùng toàn diện:
- **Authorization & Authentication (10/10):** Mã hóa mật khẩu bcrypt, quản lý phiên qua JWT kết hợp HttpOnly Cookies bảo mật.
- **Chống Tấn Công SQL Injection:** Ngăn chặn hoàn toàn rủi ro bằng cơ chế Parameterized Queries & ORM của Supabase.
- **Anti-XSS & Anti-CSRF:** Các cổng đầu vào được kiểm tra nghiêm ngặt (sanitization), chặn chèn script độc hại.
- **Rate Limiting & Security Headers:** Giới hạn lưu lượng request để chống spam DDoS, thiết lập Helmet Headers an toàn.

---

## 🛠️ Kiến Trúc Công Nghệ (Tech Stack)

EduManager Pro được xây dựng trên kiến trúc **Microservices-oriented** linh hoạt và siêu tốc:

| Layer | Công Nghệ Sử Dụng | Ưu Điểm Nổi Bật |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 | UI/UX hiện đại, tốc độ load siêu việt, thiết kế Responsive & Dark Mode. |
| **Backend** | Node.js v22+, Express.js | API tốc độ cao, xử lý bảo mật (Helmet, XSS, Rate-limit, Audit Logs). |
| **Database** | Supabase (PostgreSQL) | Tính toàn vẹn ACID, cấu trúc 3NF chuẩn hóa, **Supabase Realtime WebSockets**. |
| **DevOps** | Git, Vercel, Render | Triển khai nhanh chóng, dễ dàng scale. |

---

## 💻 Hướng Dẫn Triển Khai Nhanh (Quick Start)

### Yêu Cầu Hệ Thống
- [Node.js](https://nodejs.org/) (v18+ hoặc v22+)
- Tài khoản [Supabase](https://supabase.com/)

### 1. Khởi Tạo Cơ Sở Dữ Liệu
1. Tạo một dự án mới trên Supabase.
2. Mở tab **SQL Editor** -> Dán toàn bộ script trong file `database.sql` và chạy (Run).
3. Mở tab **SQL Editor** -> Dán kịch bản trong file `enable_realtime.sql` và chạy (Bắt buộc để tính năng cập nhật thời gian thực WebSockets hoạt động).
4. Lấy `Project URL` và `Service Role Key` từ cài đặt API của Supabase để cấu hình Backend.

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
1. **Backend:** Khuyến nghị triển khai Node.js API lên **Render.com** (hoặc Railway). Nhớ cấu hình đầy đủ Environment Variables (Đặc biệt cấu hình Cookie an toàn nếu dùng cross-domain).
2. **Frontend:** Triển khai thư mục `frontend` lên **Vercel** hoặc **Netlify**. Cấu hình biến `VITE_API_URL` trỏ tới link Backend tương ứng.

---
<div align="center">
  <p>Được xây dựng với 🩵 và kiến trúc lập trình hiện đại nhất.</p>
</div>
