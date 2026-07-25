import { test, expect } from '@playwright/test';

test.describe('Student Flow E2E', () => {
  test('Student should be able to login and navigate through all tabs', async ({ page }) => {
    // 1. Login
    await page.goto('/');
    
    // Fill phone number
    await page.fill('input[type="tel"]', '0912345678');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page.getByText('Cổng tra cứu học sinh').first()).toBeVisible({ timeout: 10000 });
    
    // We expect the student dashboard to have 5 tabs: Học Phí, Thời Khóa Biểu, Bảng Điểm, Bài Tập, Thông Báo
    
    // 2. Navigate to Thời Khóa Biểu
    await page.click('button:has-text("Thời Khóa Biểu")');
    await expect(page.getByText('Lịch Học & Phòng Học')).toBeVisible();

    // 3. Navigate to Bảng Điểm
    await page.click('button:has-text("Bảng Điểm")');
    await expect(page.getByText('Kết Quả Học Tập')).toBeVisible();

    // 4. Navigate to Bài Tập
    await page.click('button:has-text("Bài Tập")');
    await expect(page.getByText('Danh Sách Bài Tập')).toBeVisible();

    // 5. Navigate to Thông Báo
    await page.click('button:has-text("Thông Báo")');
    await expect(page.getByText('Bảng Tin & Cảnh Báo Khẩn')).toBeVisible();
    
    // Navigate back to Học Phí to check
    await page.click('button:has-text("Học Phí")');
    await expect(page.getByText('Học phí cần thanh toán', { exact: false }).first()).toBeVisible();

    await page.click('button[title="Đăng xuất"]');
    
    // Wait for redirect to login page
    await expect(page.locator('input[type="tel"]')).toBeVisible();
  });
});
