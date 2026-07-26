# 🎓 Hệ Thống Quản Lý Học Phí & Học Tập Sinh Viên (Student Tuition Web)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)

Một ứng dụng web quản lý học phí và học tập toàn diện, hiện đại, được thiết kế chuyên biệt cho trường học, trung tâm ngoại ngữ và cơ sở giáo dục. Giao diện được thiết kế theo phong cách **Glassmorphism** sang trọng kết hợp layout **Bento Grid** hiện đại, mang lại trải nghiệm người dùng tuyệt vời.

Hệ thống cung cấp **ba cổng thông tin riêng biệt** nhằm tối ưu hóa trải nghiệm người dùng:
- 👨‍💼 **Cổng Quản Trị (Admin):** Quản lý toàn bộ dữ liệu hệ thống (học sinh, lớp học đa môn, học phí, bài tập, tài liệu, điểm danh, VietQR).
- 👨‍🎓 **Cổng Học Sinh (Student):** Tra cứu thông tin cá nhân, nộp bài tập, tra cứu điểm số và thanh toán học phí tự động qua mã VietQR.
- 👨‍👩‍👧‍👦 **Cổng Phụ Huynh (Parent):** Theo dõi tiến độ học tập của tất cả các con, nhận thông báo, kiểm tra điểm số và lịch sử thanh toán học phí.

---

## 🌐 Liên Kết Trực Tuyến

*   **Frontend (Giao diện người dùng):** [Trải nghiệm ngay tại đây](https://student-tuition-web.vercel.app)
*   **Backend API:** [Truy cập API](https://tuition-backend-api.onrender.com)

---

## ✨ Tính Năng Nổi Bật

### 👨‍💼 Dành Cho Ban Quản Trị (Admin)
Hệ thống số hóa toàn diện quy trình vận hành từ đầu đến cuối với giao diện tối ưu và chặt chẽ:

*   **📊 Bento Dashboard Thông Minh:** Bảng điều khiển thiết kế dạng Bento Box hiện đại, cung cấp biểu đồ trực quan, số liệu thời gian thực và ghi lại mọi nhật ký hoạt động hệ thống.
*   **🏫 Quản Lý Lớp Học & Môn Học Đa Dạng:**
    *   Quản lý lớp học linh hoạt (chọn 1-3 môn: Toán, Lý, Hóa).
    *   Hỗ trợ **"Lớp tạm"**: Tự động phát hiện học sinh chưa có lớp chính thức và cho phép Admin khởi tạo lớp trực tiếp, sau đó hệ thống tự động gom (auto-assign) học sinh vào lớp để đồng bộ học phí siêu nhanh.
*   **👨‍🎓 Quản Lý Hồ Sơ Học Sinh:** Lưu trữ thông tin cá nhân. Hỗ trợ gán nhiều lớp học cùng lúc cho một học sinh (Mô hình N-N qua bảng `student_classes`). 
*   **💰 Quản Lý Học Phí & VietQR:** 
    *   Giao học phí thông minh (Assign Advanced): Giao nợ tự động theo môn học (tách tháng) cho toàn lớp hoặc từng học sinh. Ràng buộc học sinh phải học môn đó mới được tính tiền.
    *   **Thanh toán VietQR:** Tích hợp VietQR Open API chuẩn Napas247 tạo mã QR chứa số tiền và nội dung chính xác. Nhận diện và cập nhật trạng thái ngay sau khi thanh toán.
*   **📈 Sổ Điểm Điện Tử & Phúc Khảo:** Hệ thống quản lý điểm số tự động tính toán điểm trung bình. Xử lý khép kín quy trình Phúc khảo (Appeals) của học sinh.
*   **📅 Thời Khoá Biểu & Điểm Danh:** Quản lý lịch học, phòng học. Giáo viên điểm danh bằng cách check box dễ dàng.
*   **📚 Quản Lý Bài Tập Về Nhà:** Giao bài tập kèm file đính kèm. Đặt thời hạn (Deadline). Quản lý bài nộp, cho phép chấm điểm và gửi nhận xét.
*   **📁 Kho Tài Liệu (Document Repo):** Hệ thống lưu trữ và chia sẻ tài liệu tương tự Google Drive, phân quyền xem tài liệu theo khối/lớp hoặc dùng chung toàn trường.
*   **🔔 Trung Tâm Thông Báo (Notifications):** Gửi thông báo hàng loạt đến toàn trường, các lớp học, hoặc qua SĐT của phụ huynh/học sinh.

### 👨‍🎓 Dành Cho Học Sinh (Student)
Giao diện tối ưu trải nghiệm (UX/UI), hỗ trợ **Dark/Light mode**, hiển thị tốt trên mọi thiết bị di động/Tablet:

*   **💳 Thanh Toán Nhanh Chóng (VietQR):** Hiển thị rõ ràng các khoản chưa thanh toán. Quét mã QR trực tiếp bằng mọi app ngân hàng để nộp tiền.
*   **📝 Quản Lý Bài Tập:** Nhận thông báo bài tập mới. Giao diện nộp file bài làm trực quan, tự động báo cho Admin.
*   **🏠 Bảng Điều Khiển Học Tập:** Tra cứu thông tin cá nhân, điểm số, lịch học, tải tài liệu. Yêu cầu phúc khảo điểm số ngay trên app.

---

## 🛠️ Công Nghệ Sử Dụng

Kiến trúc **Client-Server** với Backend API tách rời hoàn toàn (Microservices-oriented):

### Frontend
*   **Core:** React 19, Vite 8 (Tốc độ build siêu việt)
*   **Routing:** React Router DOM v7
*   **UI/Styling:** Tailwind CSS v4, Lucide React (Icons), Framer Motion (Animations)
*   **Design System:** Glassmorphism, Bento Grid
*   **State Management:** React Hooks Context

### Backend API
*   **Core:** Node.js v22+, Express.js
*   **Database:** Supabase (PostgreSQL) theo chuẩn 3NF và đảm bảo tính toàn vẹn ACID.
*   **Authentication:** JSON Web Tokens (JWT) kết hợp Supabase Auth.
*   **Payment Gateway:** VietQR Generator (Open API)
*   **Bảo mật:** `cors`, `helmet`, `xss-clean`, `express-rate-limit`

---

## 📁 Cấu Trúc Dự Án (Architecture)

```text
student-tuition-web/
├── frontend/                     # Ứng dụng Frontend (React/Vite)
│   ├── public/                   # Tài nguyên tĩnh
│   ├── src/
│   │   ├── components/           # Components tái sử dụng
│   │   ├── pages/                # Các trang chính (Admin, Student, Parent Dashboard)
│   │   ├── App.jsx               # Routing chính
│   │   └── index.css             # Tailwind & Custom Animations
│   └── package.json              
│
├── backend/                      # Ứng dụng Backend (Express API)
│   ├── config/                   # Thiết lập Database/Supabase
│   ├── controllers/              # Logic xử lý chính (admin, student, payment, document...)
│   ├── middlewares/              # Middleware bảo mật
│   ├── routes/                   # Định tuyến API
│   ├── server.js                 # Entry point
│   └── app.js                    # Cấu hình Express
│
└── database.sql                  # Script thiết lập Database chuẩn hóa (PostgreSQL)
```

---

## 🚀 Hướng Dẫn Cài Đặt (Local Development)

### 📋 Yêu cầu tiên quyết:
*   [Node.js](https://nodejs.org/) (phiên bản 18+ hoặc 22+)
*   Tài khoản [Supabase](https://supabase.com/)

### Bước 1: Khởi tạo Database (Supabase)
1. Tạo Project trên Supabase.
2. Mở **SQL Editor** -> dán nội dung file `database.sql` và nhấn **Run**.
3. Vào **Project Settings -> API**, copy `Project URL` và `Service Role (secret) Key`.

### Bước 2: Thiết lập Backend
```bash
git clone https://github.com/nguyenhuunghia127/student-tuition-web.git
cd student-tuition-web/backend
```
Tạo file `.env`:
```env
PORT=5000
SUPABASE_URL=https://[PROJECT-ID].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_secret_role_key
JWT_SECRET=your_super_secret_jwt_key

# Cấu hình thanh toán VietQR mặc định
BANK_ID=Vikki Digital Bank
ACCOUNT_NO=935042177
ACCOUNT_NAME=NGUYEN HUU CHANH
```
Chạy backend: `npm install && npm run dev`

### Bước 3: Thiết lập Frontend
```bash
cd ../frontend
```
Tạo file `.env`:
```env
VITE_SUPABASE_URL=https://[PROJECT-ID].supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:5000
```
Chạy frontend: `npm install && npm run dev`

---

## ☁️ Hướng Dẫn Triển Khai (Deployment)
1. **Backend:** Deploy thư mục `backend` lên **Render**, cấu hình Environment Variables đầy đủ. Command: `npm install` và `node server.js`.
2. **Frontend:** Deploy thư mục `frontend` lên **Vercel**, điền `VITE_API_URL` trỏ tới link Render backend của bạn.

---

## 📄 Bản Quyền & Giấy Phép (License)
Mã nguồn được phân phối cho mục đích học tập, giáo dục và có thể được tùy chỉnh để phục vụ nội bộ. Vui lòng giữ lại thông tin tác giả nguyên gốc nếu có chia sẻ lại. Cảm ơn bạn!
