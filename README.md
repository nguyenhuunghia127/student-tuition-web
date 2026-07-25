# 🎓 Hệ Thống Quản Lý Học Phí & Học Tập Sinh Viên (Student Tuition Web)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

Một ứng dụng web quản lý học phí và học tập toàn diện, hiện đại, được thiết kế chuyên biệt cho trường học, trung tâm ngoại ngữ và cơ sở giáo dục. Hệ thống cung cấp **ba cổng thông tin riêng biệt** nhằm tối ưu hóa trải nghiệm người dùng:
- 👨‍💼 **Cổng Quản Trị (Admin):** Quản lý toàn bộ dữ liệu hệ thống (học sinh, giáo viên, học phí, bài tập, tài liệu).
- 👨‍🎓 **Cổng Học Sinh (Student):** Tra cứu thông tin cá nhân, nộp bài tập, tra cứu điểm số và thanh toán học phí bằng mã QR.
- 👨‍👩‍👧‍👦 **Cổng Phụ Huynh (Parent):** Theo dõi tiến độ học tập của tất cả các con, nhận thông báo, kiểm tra điểm số và lịch sử thanh toán học phí.

Tích hợp cổng thanh toán trực tuyến qua **VietQR / PayOS** với tính năng tự động gạch nợ nhanh chóng và đối soát thời gian thực.

---

## 🌐 Liên Kết Trực Tuyến

*   **Frontend (Giao diện người dùng):** [Trải nghiệm ngay tại đây](https://student-tuition-web.vercel.app)
*   **Backend API:** [Truy cập API](https://tuition-backend-api.onrender.com)

---

## ✨ Tính Năng Nổi Bật

### 👨‍💼 Dành Cho Ban Quản Trị (Admin)
Hệ thống số hóa toàn diện quy trình vận hành từ đầu đến cuối với giao diện tối ưu:

*   **📊 Bento Dashboard Thông Minh:** Bảng điều khiển thiết kế dạng Bento Box hiện đại, kết hợp Glassmorphism. Cung cấp biểu đồ trực quan (Donut Chart, Stacked Bar Chart), số liệu thời gian thực và *News Feed* tự động bắt mọi log hoạt động của hệ thống.
*   **👨‍🎓 Quản Lý Hồ Sơ Học Sinh:** Lưu trữ thông tin cá nhân. Hỗ trợ tạo mới thủ công hoặc **Import hàng loạt qua file Excel**. Hệ thống tìm kiếm, lọc theo lớp học, khóa học siêu tốc.
*   **💰 Quản Lý Học Phí & Công Nợ:** Khởi tạo kỳ thu học phí cho toàn trường, khối, lớp hoặc cá nhân. Tự động chuyển trạng thái ngay khi có giao dịch thanh toán (qua VietQR) hoặc xác nhận thủ công.
*   **📈 Sổ Điểm Điện Tử:** Hệ thống quản lý điểm số đa dạng (15 phút, 1 tiết, giữa kỳ, cuối kỳ). Hỗ trợ **Import điểm từ Excel**. Tự động tính toán điểm trung bình và xếp loại học lực.
*   **📅 Thời Khoá Biểu Linh Hoạt:** Hiển thị dưới dạng lịch Grid trực quan. Quản lý các ca học, môn học, phòng học, điểm danh.
*   **📚 Quản Lý Bài Tập Về Nhà:** Giao bài tập kèm file đính kèm. Đặt thời hạn (Deadline). Quản lý bài nộp, cho phép chấm điểm và gửi nhận xét phản hồi trực tiếp.
*   **📁 Kho Tài Liệu (Document Repo):** Hệ thống lưu trữ và chia sẻ tài liệu như một File Explorer thực thụ (tạo thư mục, upload file, phân quyền xem tài liệu theo khối/lớp hoặc dùng chung).
*   **🔔 Hệ Thống Thông Báo:** Gửi thông báo đến toàn hệ thống hoặc cá nhân, phân biệt màu sắc thông báo rõ ràng.

### 👨‍🎓 Dành Cho Học Sinh (Student)
Giao diện tối ưu trải nghiệm người dùng (UX/UI), hỗ trợ **Dark/Light mode**, hiển thị tốt trên mọi thiết bị (Responsive):

*   **🏠 Bảng Điều Khiển Học Tập:** Tra cứu thông tin cá nhân, kết quả học tập, điểm trung bình (GPA) và xếp loại tự động.
*   **💳 Thanh Toán Nhanh Chóng:** Hiển thị rõ ràng các khoản chưa thanh toán. Tích hợp thanh toán bằng mã **VietQR (PayOS)** với tốc độ xử lý siêu nhanh. Hỗ trợ **Polling Verification** giúp xác thực ngay cả khi Webhook bị nghẽn.
*   **📜 Lịch Sử Giao Dịch:** Tra cứu và kiểm tra minh bạch mọi giao dịch quá khứ.
*   **📅 Xem Lịch Học:** Tra cứu thời khóa biểu sắp diễn ra theo tuần.
*   **📝 Quản Lý Bài Tập:** Nhận thông báo bài tập mới, nhắc nhở deadline bằng đồng hồ đếm ngược. Giao diện nộp file đơn giản.
*   **📂 Tải Tài Liệu:** Truy cập vào Kho Tài Liệu do nhà trường cung cấp theo đúng phân quyền (chung hoặc nội bộ lớp).
*   **⚖️ Hệ Thống Phúc Khảo:** Gửi yêu cầu phúc khảo điểm số trực tiếp từ giao diện học sinh.

### 👨‍👩‍👧‍👦 Dành Cho Phụ Huynh (Parent)
Cổng thông tin riêng biệt để theo dõi nhiều học sinh cùng lúc:

*   **📱 Đăng Nhập Tiện Lợi:** Đăng nhập an toàn qua số điện thoại đã đăng ký với nhà trường, không cần ghi nhớ nhiều tài khoản.
*   **👨‍👧‍👦 Quản Lý Nhiều Con Em:** Theo dõi thông tin, học phí, và kết quả học tập của nhiều học sinh (con) trong cùng một tài khoản.
*   **💸 Theo Dõi Học Phí:** Nhận thông báo ngay lập tức về các khoản thu học phí, kiểm tra lịch sử thanh toán của con cái một cách minh bạch.
*   **📊 Theo Dõi Học Tập:** Xem điểm số, kết quả bài tập về nhà và tỷ lệ đi học đầy đủ để có thể đồng hành cùng con em trong quá trình học.
*   **💳 Hỗ Trợ Thanh Toán QR:** Tạo mã VietQR để phụ huynh quét và thanh toán học phí trực tiếp nhanh chóng.

---

## 🛠️ Công Nghệ Sử Dụng

Kiến trúc **Client-Server** với Backend API tách rời hoàn toàn:

### Frontend
*   **Core:** React 19, Vite 8 (Tốc độ build siêu việt)
*   **Routing:** React Router DOM v7
*   **UI/Styling:** Tailwind CSS v4, Lucide React (Icons), UI Glassmorphism
*   **Charts:** Tùy biến biểu đồ bằng SVG thuần (không sử dụng thư viện nặng).
*   **Testing:** Playwright (E2E Tests)

### Backend API
*   **Core:** Node.js v22+, Express.js
*   **Database & Auth:** Supabase (PostgreSQL) + Row Level Security (RLS)
*   **Payment Gateway:** `@payos/node` v2 (API VietQR mở + Webhooks)
*   **Tệp đính kèm:** `multer` (Upload), `xlsx` (Thao tác Excel)
*   **Bảo mật & Khác:** `cors`, `dotenv`

---

## 📁 Cấu Trúc Dự Án (Architecture)

```text
student-tuition-web/
├── frontend/                     # Ứng dụng Frontend (React/Vite)
│   ├── public/                   # Tài nguyên tĩnh
│   ├── src/
│   │   ├── components/           # Components tái sử dụng (ThemeToggle, AdminDocuments...)
│   │   ├── pages/                # Các trang chính (AdminDashboard, StudentDashboard, ParentDashboard...)
│   │   ├── App.jsx               # Routing chính
│   │   ├── config.js             # File config (Biến môi trường)
│   │   └── index.css             # Tailwind & Base CSS (Custom Animations)
│   ├── tests/                    # Script kiểm thử E2E (Playwright)
│   └── package.json              
│
├── backend/                      # Ứng dụng Backend (Express API)
│   ├── config/                   # Thiết lập Supabase, PayOS
│   ├── controllers/              # Logic xử lý chính (adminController, paymentController, studentController...)
│   ├── routes/                   # Định tuyến API
│   ├── utils/                    # Các hàm tiện ích (logger, response format)
│   ├── server.js                 # Entry point
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
*   Tài khoản [PayOS](https://payos.vn/) (Để tích hợp thanh toán)

### Bước 1: Khởi tạo Database (Supabase)
1. Đăng nhập Supabase và tạo Project mới.
2. Tại **SQL Editor** -> **New query**, dán toàn bộ nội dung của file `database.sql` và nhấn **Run**.
3. Tại **Authentication -> Users**, tạo một tài khoản Admin mới (Ví dụ: `admin@gmail.com`).
4. Tại **Table Editor -> users**, tìm tài khoản vừa tạo và đặt cột `role` thành `admin`.
5. Vào **Project Settings -> API**, sao chép `Project URL` và `Service Role (secret) Key`.

### Bước 2: Thiết lập Backend
```bash
git clone https://github.com/nguyenhuunghia127/student-tuition-web.git
cd student-tuition-web/backend
```
*Tạo file `.env` (copy từ `.env.example` hoặc tạo mới)*:
```env
PORT=5000
SUPABASE_URL=https://[PROJECT-ID].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_secret_key

# Thông tin PayOS (business.payos.vn)
PAYOS_CLIENT_ID=your-client-id
PAYOS_API_KEY=your-api-key
PAYOS_CHECKSUM_KEY=your-checksum-key
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
npm install
npm run dev
```
*Giao diện Frontend chạy mặc định tại `http://localhost:5173` và tự động kết nối với API Backend tại `http://localhost:5000`.*

---

## ☁️ Hướng Dẫn Triển Khai (Deployment)

### 1. Triển khai Backend lên Render
1. Tạo Web Service mới trên [Render](https://render.com).
2. Kết nối tới Repository GitHub của bạn.
3. Cài đặt Root Directory: `backend`.
4. Build Command: `npm install`, Start Command: `node server.js`.
5. Bổ sung toàn bộ biến môi trường (`SUPABASE_URL`, `PAYOS_...`) ở tab Environment.

### 2. Triển khai Frontend lên Vercel
1. Khởi tạo Project mới trên [Vercel](https://vercel.com) từ GitHub.
2. Chọn Root Directory là `frontend`. Vercel sẽ tự nhận diện đây là dự án Vite.
3. Thiết lập biến môi trường `VITE_API_URL` trỏ tới đường dẫn Backend Render của bạn (Ví dụ: `https://tuition-backend-api.onrender.com`).

### 3. Cài đặt Webhook PayOS (Xác thực Thanh toán)
*   Đăng nhập [Dashboard PayOS](https://business.payos.vn).
*   Chuyển tới phần **Cài đặt -> Webhook**.
*   Thiết lập URL Webhook thành: `https://[RENDER-BACKEND-URL]/api/payment/webhook`.
*   *Lưu ý: Nếu chạy Localhost, hệ thống đã được trang bị cơ chế Polling để vượt qua rào cản Webhook.*

---

## 📝 Cơ Chế Thanh Toán Tự Động (Payment Flow)
1. Học sinh / Phụ huynh bấm thanh toán $\rightarrow$ Backend gọi PayOS API tạo `orderCode` và Checkout URL.
2. Người dùng quét mã QR thanh toán trên trang của PayOS.
3. Nếu thành công, hệ thống redirect về trang chủ kèm `?status=PAID&orderCode=...`.
4. **Luồng 1 (Server-to-Server Webhook):** Ngân hàng báo PayOS $\rightarrow$ PayOS gọi Webhook Backend $\rightarrow$ Backend cập nhật DB (Nhanh nhất).
5. **Luồng 2 (Client Polling Fallback):** Frontend tự động gọi API `/api/payment/verify-payment` để Backend chủ động tra cứu với PayOS (Dùng khi Webhook bị lỗi hoặc đang chạy Localhost).
6. Hệ thống tạo Log hoạt động và phát Thông báo ngay sau khi hoàn tất.

---

## 🧪 Kiểm Thử Hệ Thống (E2E Testing)

Dự án sử dụng Playwright để kiểm tra chất lượng tự động:
```bash
cd frontend
npx playwright test
```
*Để xem báo cáo kiểm thử (kèm video màn hình lỗi nếu có):*
```bash
npx playwright show-report
```

---

## 📄 Bản Quyền & Giấy Phép (License)

Mã nguồn được phân phối cho mục đích học tập, giáo dục và có thể được tùy chỉnh để phục vụ nội bộ trường học/trung tâm của riêng bạn. 
Vui lòng giữ lại thông tin tác giả nguyên gốc nếu có chia sẻ lại. Cảm ơn bạn!
