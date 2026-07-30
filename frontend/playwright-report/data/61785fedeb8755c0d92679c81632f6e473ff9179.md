# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login-mobile.spec.js >> Mobile Login Flows E2E >> Admin Mobile Login
- Location: tests\login-mobile.spec.js:9:3

# Error details

```
Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "Đổi giao diện Sáng/Tối" [ref=e8] [cursor=pointer]:
    - img [ref=e9]
  - generic [ref=e15]:
    - generic [ref=e16]:
      - img [ref=e18]
      - heading "Hệ Thống Quản Trị" [level=1] [ref=e20]
      - paragraph [ref=e21]: Quản lý Học sinh, Học phí, Lịch học và Điểm số
    - generic [ref=e22]:
      - generic [ref=e23]:
        - text: Email Quản Trị
        - textbox "admin@school.com" [ref=e24]: admin@gmail.com
      - generic [ref=e25]:
        - text: Mật Khẩu
        - textbox "••••••••" [ref=e26]: chanh123
      - button "Đăng Nhập" [ref=e27]:
        - generic [ref=e28]: Đăng Nhập
    - button "Quay lại Cổng Học Sinh" [ref=e30]
```