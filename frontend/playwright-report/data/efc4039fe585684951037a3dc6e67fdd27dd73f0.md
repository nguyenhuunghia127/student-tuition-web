# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: student.spec.js >> Student Flow E2E >> Student should be able to login and navigate through all tabs
- Location: tests\student.spec.js:4:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button[type="submit"]')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "Đổi giao diện Sáng/Tối" [ref=e8] [cursor=pointer]:
    - img [ref=e9]
  - generic [ref=e19]:
    - generic [ref=e20]:
      - img [ref=e22]
      - heading "Cổng Học Sinh" [level=1] [ref=e25]
      - paragraph [ref=e26]: Tra cứu thông tin học tập & học phí trực tuyến
    - generic [ref=e27]:
      - generic [ref=e28]:
        - generic [ref=e29]: Số Điện Thoại Đăng Nhập
        - generic [ref=e30]:
          - img [ref=e32]
          - textbox "Số Điện Thoại Đăng Nhập" [ref=e35]:
            - /placeholder: "Ví dụ: 0912345678"
      - button "Vào Hệ Thống" [ref=e36]:
        - generic [ref=e37]: Vào Hệ Thống
    - button "Đăng nhập cho Cán bộ / Admin" [ref=e39]:
      - img [ref=e40]
      - text: Đăng nhập cho Cán bộ / Admin
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Student Flow E2E', () => {
  4  |   test('Student should be able to login and navigate through all tabs', async ({ page }) => {
  5  |     // 1. Login
  6  |     await page.goto('/');
  7  |     
  8  |     // Fill phone number
  9  |     await page.fill('input[type="tel"]', '0912345678');
> 10 |     await page.click('button[type="submit"]');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  11 | 
  12 |     // Should redirect to dashboard
  13 |     await expect(page.getByText('Cổng tra cứu học sinh').first()).toBeVisible({ timeout: 10000 });
  14 |     
  15 |     // We expect the student dashboard to have 5 tabs: Học Phí, Thời Khóa Biểu, Bảng Điểm, Bài Tập, Thông Báo
  16 |     
  17 |     // 2. Navigate to Thời Khóa Biểu
  18 |     await page.click('button:has-text("Thời Khóa Biểu")');
  19 |     await expect(page.getByText('Lịch Học & Phòng Học')).toBeVisible();
  20 | 
  21 |     // 3. Navigate to Bảng Điểm
  22 |     await page.click('button:has-text("Bảng Điểm")');
  23 |     await expect(page.getByText('Kết Quả Học Tập')).toBeVisible();
  24 | 
  25 |     // 4. Navigate to Bài Tập
  26 |     await page.click('button:has-text("Bài Tập")');
  27 |     await expect(page.getByText('Danh Sách Bài Tập')).toBeVisible();
  28 | 
  29 |     // 5. Navigate to Thông Báo
  30 |     await page.click('button:has-text("Thông Báo")');
  31 |     await expect(page.getByText('Bảng Tin & Cảnh Báo Khẩn')).toBeVisible();
  32 |     
  33 |     // Navigate back to Học Phí to check
  34 |     await page.click('button:has-text("Học Phí")');
  35 |     await expect(page.getByText('Học phí cần thanh toán', { exact: false }).first()).toBeVisible();
  36 | 
  37 |     await page.click('button[title="Đăng xuất"]');
  38 |     
  39 |     // Wait for redirect to login page
  40 |     await expect(page.locator('input[type="tel"]')).toBeVisible();
  41 |   });
  42 | });
  43 | 
```