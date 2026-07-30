# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: capture.spec.js >> capture screenshots and video
- Location: tests\capture.spec.js:8:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "Đổi giao diện Sáng/Tối" [ref=e8] [cursor=pointer]:
    - img [ref=e9]
  - generic [ref=e19]:
    - generic [ref=e20]:
      - img [ref=e22]
      - heading "Hệ Thống Quản Trị" [level=1] [ref=e24]
      - paragraph [ref=e25]: Quản lý Học sinh, Học phí, Lịch học và Điểm số
    - generic [ref=e26]:
      - generic [ref=e27]:
        - text: Email Quản Trị
        - textbox "admin@school.com" [ref=e28]
      - generic [ref=e29]:
        - text: Mật Khẩu
        - textbox "••••••••" [ref=e30]
      - button "Đăng Nhập" [ref=e31]:
        - generic [ref=e32]: Đăng Nhập
    - button "Quay lại Cổng Học Sinh" [ref=e34]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.use({ 
  4  |   video: 'on',
  5  |   viewport: { width: 1280, height: 720 }
  6  | });
  7  | 
  8  | test('capture screenshots and video', async ({ page }) => {
  9  |   // 1. ADMIN
  10 |   await page.goto('http://localhost:5173/admin/login');
  11 |   await page.waitForTimeout(2000);
> 12 |   await page.fill('input[type="email"]', 'admin@gmail.com');
     |              ^ Error: page.fill: Test timeout of 30000ms exceeded.
  13 |   await page.fill('input[type="password"]', 'chanh123');
  14 |   await page.click('button[type="submit"]');
  15 |   await page.waitForTimeout(3000); 
  16 |   await page.screenshot({ path: '../assets/admin-mobile-dashboard.png' });
  17 |   
  18 |   // Logout Admin - by going to root maybe? Or clearing cookies.
  19 |   await page.context().clearCookies();
  20 | 
  21 |   // 2. STUDENT
  22 |   await page.goto('http://localhost:5173/');
  23 |   await page.waitForTimeout(2000);
  24 |   await page.fill('input[type="tel"]', '0702523201');
  25 |   await page.click('button[type="submit"]');
  26 |   await page.waitForTimeout(4000);
  27 |   await page.screenshot({ path: '../assets/student-mobile-dashboard.png' });
  28 | 
  29 |   await page.context().clearCookies();
  30 | 
  31 |   // 3. PARENT
  32 |   await page.goto('http://localhost:5173/');
  33 |   await page.waitForTimeout(2000);
  34 |   await page.fill('input[type="tel"]', '0935160045');
  35 |   await page.click('button[type="submit"]');
  36 |   await page.waitForTimeout(3000);
  37 |   await page.screenshot({ path: '../assets/parent-mobile-dashboard.png' });
  38 | });
  39 | 
```