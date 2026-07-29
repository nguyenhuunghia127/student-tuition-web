import { test, expect, devices } from '@playwright/test';

test.use({
  ...devices['iPhone 12'],
});

test.describe('Mobile Login Flows E2E', () => {

  test('Admin Mobile Login', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@gmail.com');
    await page.fill('input[type="password"]', 'chanh123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/admin/dashboard*');
    expect(page.url()).toContain('/admin/dashboard');
    // Wait for network idle to ensure page loaded
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/admin-mobile-dashboard.png' });
  });

  test('Student Mobile Login', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="tel"]', '0702523201');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard*');
    expect(page.url()).toContain('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/student-mobile-dashboard.png' });
  });

  test('Parent Mobile Login', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="tel"]', '0935160045'); 
    await page.click('button[type="submit"]');

    await page.waitForURL('**/parent/dashboard*');
    expect(page.url()).toContain('/parent/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/parent-mobile-dashboard.png' });
  });

});
