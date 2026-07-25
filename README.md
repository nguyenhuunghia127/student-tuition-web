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
- 👨‍💼 **Cổng Quản Trị (Admin):** Quản lý toàn bộ dữ liệu hệ thống (học sinh, giáo viên, học phí, bài tập, tài liệu).
- 👨‍🎓 **Cổng Học Sinh (Student):** Tra cứu thông tin cá nhân, nộp bài tập, tra cứu điểm số và thanh toán học phí bằng mã VietQR.
- 👨‍👩‍👧‍👦 **Cổng Phụ Huynh (Parent):** Theo dõi tiến độ học tập của tất cả các con, nhận thông báo, kiểm tra điểm số và lịch sử thanh toán học phí.

---

## 🌐 Liên Kết Trực Tuyến

*   **Frontend (Giao diện người dùng):** [Trải nghiệm ngay tại đây](https://student-tuition-web.vercel.app)
*   **Backend API:** [Truy cập API](https://tuition-backend-api.onrender.com)

---

## ✨ Tính Năng Nổi Bật

### 👨‍💼 Dành Cho Ban Quản Trị (Admin)
Hệ thống số hóa toàn diện quy trình vận hành từ đầu đến cuối với giao diện tối ưu:

*   **📊 Bento Dashboard Thông Minh:** Bảng điều khiển thiết kế dạng Bento Box hiện đại, kết hợp Glassmorphism. Cung cấp biểu đồ trực quan, số liệu thời gian thực và tự động bắt mọi log hoạt động của hệ thống.
*   **👨‍🎓 Quản Lý Hồ Sơ Học Sinh:** Lưu trữ thông tin cá nhân. Hỗ trợ gán nhiều lớp học cùng lúc cho một học sinh. Hệ thống tìm kiếm, lọc theo lớp học, khóa học siêu tốc.
*   **💰 Quản Lý Học Phí & Công Nợ:** Khởi tạo kỳ thu học phí cho toàn trường, khối, lớp hoặc cá nhân. Tự động chuyển trạng thái ngay khi có giao dịch thanh toán xác nhận thủ công hoặc tự động.
*   **📈 Sổ Điểm Điện Tử:** Hệ thống quản lý điểm số đa dạng (15 phút, 1 tiết, giữa kỳ, cuối kỳ). Cho phép cấu hình trọng số môn học. Tự động tính toán điểm trung bình.
*   **📅 Thời Khoá Biểu Linh Hoạt:** Hiển thị dưới dạng lịch trực quan. Quản lý các ca học, môn học, phòng học, điểm danh.
*   **📚 Quản Lý Bài Tập Về Nhà:** Giao bài tập kèm file đính kèm. Đặt thời hạn (Deadline). Quản lý bài nộp, cho phép chấm điểm và gửi nhận xét phản hồi trực tiếp.
*   **📁 Kho Tài Liệu (Document Repo):** Hệ thống lưu trữ và chia sẻ tài liệu như một File Explorer thực thụ (tạo thư mục, upload file, phân quyền xem tài liệu theo khối/lớp hoặc dùng chung).
*   **🔔 Trung Tâm Thông Báo (Notifications):** 
    - **Hộp Thư (Inbox):** Nhận thông báo tự động từ hệ thống ngay khi học sinh nộp bài tập hoặc thanh toán học phí.
    - **Phát Thông Báo:** Gửi thông báo hàng loạt đến toàn trường hoặc các lớp học/cá nhân cụ thể.

### 👨‍🎓 Dành Cho Học Sinh (Student)
Giao diện tối ưu trải nghiệm người dùng (UX/UI), hỗ trợ **Dark/Light mode**, hiển thị tốt trên mọi thiết bị (Responsive):

*   **🏠 Bảng Điều Khiển Học Tập:** Tra cứu thông tin cá nhân, kết quả học tập, điểm trung bình (GPA) và xếp loại tự động.
*   **💳 Thanh Toán Nhanh Chóng (VietQR):** Hiển thị rõ ràng các khoản chưa thanh toán. Tích hợp thanh toán bằng mã **VietQR** tự động tạo mã QR chứa số tiền và nội dung chuyển khoản chính xác, giúp phụ huynh/học sinh quét mã thanh toán bằng mọi app ngân hàng.
*   **📜 Lịch Sử Giao Dịch:** Tra cứu và kiểm tra minh bạch mọi giao dịch quá khứ.
*   **📅 Xem Lịch Học:** Tra cứu thời khóa biểu sắp diễn ra theo tuần.
*   **📝 Quản Lý Bài Tập:** Nhận thông báo bài tập mới, nhắc nhở deadline. Giao diện nộp file trực quan, hỗ trợ nhiều định dạng. Khi nộp bài xong, hệ thống tự động báo cho Admin.
*   **📂 Tải Tài Liệu:** Truy cập vào Kho Tài Liệu do nhà trường cung cấp theo đúng phân quyền (chung hoặc nội bộ lớp).
*   **⚖️ Hệ Thống Phúc Khảo:** Gửi yêu cầu phúc khảo điểm số trực tiếp từ giao diện học sinh.

### 👨‍👩‍👧‍👦 Dành Cho Phụ Huynh (Parent)
Cổng thông tin riêng biệt để theo dõi nhiều học sinh cùng lúc:

*   **📱 Đăng Nhập Tiện Lợi:** Đăng nhập an toàn, không cần ghi nhớ nhiều tài khoản phức tạp.
*   **👨‍👧‍👦 Quản Lý Nhiều Con Em:** Theo dõi thông tin, học phí, và kết quả học tập của nhiều học sinh (con) trong cùng một tài khoản.
*   **💸 Theo Dõi Học Phí:** Nhận thông báo ngay lập tức về các khoản thu học phí, kiểm tra lịch sử thanh toán của con cái một cách minh bạch.
*   **📊 Theo Dõi Học Tập:** Xem điểm số, kết quả bài tập về nhà và tỷ lệ đi học đầy đủ để có thể đồng hành cùng con em trong quá trình học.

---

## 🛠️ Công Nghệ Sử Dụng

Kiến trúc **Client-Server** với Backend API tách rời hoàn toàn:

### Frontend
*   **Core:** React 19, Vite 8 (Tốc độ build siêu việt)
*   **Routing:** React Router DOM v7
*   **UI/Styling:** Tailwind CSS v4, Lucide React (Icons), Framer Motion (Animations)
*   **Design System:** Glassmorphism, Bento Grid
*   **State Management:** React Hooks Context

### Backend API
*   **Core:** Node.js v22+, Express.js
*   **Database:** Supabase (PostgreSQL) 
*   **Authentication:** JSON Web Tokens (JWT) cho tính năng đăng nhập bảo mật
*   **Payment Gateway:** VietQR Generator (tạo mã QR động)
*   **File Upload:** `multer` (Upload file cục bộ)
*   **Bảo mật:** `cors`, `helmet`, `xss-clean`, `express-rate-limit`, `dotenv`

---

## 📁 Cấu Trúc Dự Án (Architecture)

```text
student-tuition-web/
├── frontend/                     # Ứng dụng Frontend (React/Vite)
│   ├── public/                   # Tài nguyên tĩnh
│   ├── src/
│   │   ├── components/           # Components tái sử dụng (ThemeToggle, Modals...)
│   │   ├── pages/                # Các trang chính (AdminDashboard, StudentDashboard, ParentDashboard...)
│   │   ├── App.jsx               # Routing chính
│   │   ├── config.js             # File config (Biến môi trường)
│   │   └── index.css             # Tailwind & Base CSS (Custom Animations, Glassmorphism classes)
│   └── package.json              
│
├── backend/                      # Ứng dụng Backend (Express API)
│   ├── config/                   # Thiết lập Supabase
│   ├── controllers/              # Logic xử lý chính (adminController, paymentController, studentController...)
│   ├── middlewares/              # Middleware bảo mật (authMiddleware, uploadMiddleware)
│   ├── routes/                   # Định tuyến API
│   ├── utils/                    # Các hàm tiện ích (logger)
│   ├── server.js                 # Entry point
│   ├── app.js                    # Cấu hình Express
│   └── package.json              
│
└── database.sql                  # Script thiết lập Database ban đầu (PostgreSQL)
```

---

## 🚀 Hướng Dẫn Cài Đặt (Local Development)

### 📋 Yêu cầu tiên quyết:
*   [Node.js](https://nodejs.org/) (phiên bản 18+ hoặc 22+)
*   Git
*   Tài khoản [Supabase](https://supabase.com/)

### Bước 1: Khởi tạo Database (Supabase)
1. Đăng nhập Supabase và tạo Project mới.
2. Tại **SQL Editor** -> **New query**, dán toàn bộ nội dung của file `database.sql` và nhấn **Run**.
3. Vào **Project Settings -> API**, sao chép `Project URL`, `Service Role (secret) Key` và `anon/public key`.

### Bước 2: Thiết lập Backend
```bash
git clone https://github.com/nguyenhuunghia127/student-tuition-web.git
cd student-tuition-web/backend
```
*Tạo file `.env` chứa các cấu hình quan trọng*:
```env
PORT=5000
SUPABASE_URL=https://[PROJECT-ID].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_secret_role_key
SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_super_secret_jwt_key

# Thông tin tài khoản ngân hàng để tạo mã VietQR
BANK_ID=Vikki Digital Bank
ACCOUNT_NO=935042177
ACCOUNT_NAME=NGUYEN HUU CHANH
```
*Cài đặt và chạy*:
```bash
npm install
npm run dev
```

### Bước 3: Thiết lập Frontend
Mở một terminal mới:
```bash
cd student-tuition-web/frontend
```
*Tạo file `.env`*:
```env
VITE_SUPABASE_URL=https://[PROJECT-ID].supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:5000
```
*Cài đặt và chạy*:
```bash
npm install
npm run dev
```
*Giao diện Frontend chạy mặc định tại `http://localhost:5173` và tự động kết nối với API Backend tại `http://localhost:5000`.*

---

## ☁️ Hướng Dẫn Triển Khai (Deployment)

### 1. Triển khai Backend (Render / Heroku)
1. Tạo Web Service mới trên [Render](https://render.com).
2. Kết nối tới Repository GitHub của bạn.
3. Cài đặt Root Directory: `backend`.
4. Build Command: `npm install`, Start Command: `node server.js`.
5. **ĐẶC BIỆT QUAN TRỌNG:** Bổ sung toàn bộ biến môi trường ở bước 2 (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, thông tin `BANK_ID`...) vào tab Environment. Nếu thiếu `JWT_SECRET`, server sẽ báo lỗi *Lỗi cấu hình Server* khi đăng nhập.

### 2. Triển khai Frontend (Vercel / Netlify)
1. Khởi tạo Project mới trên [Vercel](https://vercel.com) từ GitHub.
2. Chọn Root Directory là `frontend`. Vercel sẽ tự nhận diện đây là dự án Vite.
3. Thiết lập biến môi trường `VITE_API_URL` trỏ tới đường dẫn Backend bạn vừa deploy (Ví dụ: `https://tuition-backend-api.onrender.com`).
4. Thêm `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.

---

## 📄 Bản Quyền & Giấy Phép (License)

Mã nguồn được phân phối cho mục đích học tập, giáo dục và có thể được tùy chỉnh để phục vụ nội bộ trường học/trung tâm của riêng bạn. 
Vui lòng giữ lại thông tin tác giả nguyên gốc nếu có chia sẻ lại. Cảm ơn bạn!
