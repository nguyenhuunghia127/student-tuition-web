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

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/admin/dashboard*" until "load"
============================================================
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
      - generic [ref=e27]:
        - img [ref=e28]
        - generic [ref=e30]: Load failed
      - button "Đăng Nhập" [ref=e31]:
        - generic [ref=e32]: Đăng Nhập
    - button "Quay lại Cổng Học Sinh" [ref=e34]
```

# Test source

```ts
  1  | import { test, expect, devices } from '@playwright/test';
  2  | 
  3  | test.use({
  4  |   ...devices['iPhone 12'],
  5  | });
  6  | 
  7  | test.describe('Mobile Login Flows E2E', () => {
  8  | 
  9  |   test('Admin Mobile Login', async ({ page }) => {
  10 |     await page.goto('/admin/login');
  11 |     await page.fill('input[type="email"]', 'admin@gmail.com');
  12 |     await page.fill('input[type="password"]', 'chanh123');
  13 |     await page.click('button[type="submit"]');
  14 | 
> 15 |     await page.waitForURL('**/admin/dashboard*');
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  16 |     expect(page.url()).toContain('/admin/dashboard');
  17 |     // Wait for network idle to ensure page loaded
  18 |     await page.waitForLoadState('networkidle');
  19 |     await page.screenshot({ path: 'test-results/admin-mobile-dashboard.png' });
  20 |   });
  21 | 
  22 |   test('Student Mobile Login', async ({ page }) => {
  23 |     await page.goto('/');
  24 |     await page.fill('input[type="tel"]', '0702523201');
  25 |     await page.click('button[type="submit"]');
  26 | 
  27 |     await page.waitForURL('**/dashboard*');
  28 |     expect(page.url()).toContain('/dashboard');
  29 |     await page.waitForLoadState('networkidle');
  30 |     await page.screenshot({ path: 'test-results/student-mobile-dashboard.png' });
  31 |   });
  32 | 
  33 |   test('Parent Mobile Login', async ({ page }) => {
  34 |     await page.goto('/');
  35 |     await page.fill('input[type="tel"]', '0935160045'); 
  36 |     await page.click('button[type="submit"]');
  37 | 
  38 |     await page.waitForURL('**/parent/dashboard*');
  39 |     expect(page.url()).toContain('/parent/dashboard');
  40 |     await page.waitForLoadState('networkidle');
  41 |     await page.screenshot({ path: 'test-results/parent-mobile-dashboard.png' });
  42 |   });
  43 | 
  44 | });
  45 | 
```