# Specification: Kho tài liệu dành cho Admin (Admin Document Repository)

## 1. Overview
Tính năng này cung cấp một "Kho tài liệu" (Document Repository) giúp Admin quản lý các đường link tài liệu (ví dụ: Google Drive link). Tài liệu này mặc định chỉ Admin thấy, sau đó Admin có thể gán các tài liệu này vào các bài tập (assignments) để chuyển đến cho học sinh, một lớp học hoặc toàn bộ hệ thống.

## 2. User Scenarios & Testing
- **Scenario 1:** Admin thêm tài liệu mới bằng cách dán đường link Google Drive, nhập Tên tài liệu, Mô tả và phân loại Danh mục.
- **Scenario 2:** Admin vào mục quản lý, gán một tài liệu (thông qua bài tập) cho một Học sinh cụ thể, một Lớp học, hoặc gán cho tất cả.
- **Scenario 3:** Admin tìm kiếm tài liệu theo tên hoặc lọc theo danh mục.
- **Scenario 4:** Học sinh xem bài tập được giao và nhấp vào link tài liệu để xem/tải trực tiếp từ Google Drive.

## 3. Functional Requirements
- Hệ thống KHÔNG lưu trữ file vật lý, chỉ lưu đường link (URL) của tài liệu (ví dụ: Google Drive) vào database (Supabase).
- Tài liệu trong kho mặc định chỉ hiển thị cho Admin.
- Hệ thống hỗ trợ tính năng Gán tài liệu: Admin có thể chọn tài liệu -> gắn vào một bài tập -> giao cho 1 học sinh / 1 lớp / tất cả.
- Có hệ thống danh mục (Categories) để phân loại tài liệu.
- Có chức năng tìm kiếm tài liệu theo tên và mô tả.

## 4. Success Criteria
- Thêm mới tài liệu (link) thành công dưới 2 giây do không cần upload file.
- Giao diện Admin hiển thị rõ tài liệu nào đã được gán cho bài tập nào/học sinh nào.
- Dữ liệu link tài liệu được lưu trữ an toàn trên Supabase.

## 5. Key Entities
- `Document`: Lưu trữ metadata (Tên, Link Google Drive, Loại, Ngày tạo).
- `DocumentCategory`: Danh mục tài liệu.
- `AssignmentDocument`: Bảng trung gian liên kết giữa Bài tập (Assignment) và Tài liệu (Document).

## 6. Assumptions
- Giao diện Admin đã có sẵn layout chuẩn để thêm module mới.
- Hệ thống Supabase đã được cấu hình và kết nối sẵn trong dự án.
- Project đã có sẵn tính năng "Bài tập" (Assignment) và "Lớp học" (Class) để kết nối.
