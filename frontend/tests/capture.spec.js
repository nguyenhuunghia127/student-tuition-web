import { test, expect } from '@playwright/test';

test.use({ 
  video: 'on',
  viewport: { width: 1280, height: 720 }
});

test('capture screenshots and video', async ({ page }) => {
  // 1. ADMIN
  await page.goto('http://localhost:5173/admin/login');
  await page.waitForTimeout(2000);
  await page.fill('input[type="email"]', 'admin@gmail.com');
  await page.fill('input[type="password"]', 'chanh123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000); 
  await page.screenshot({ path: '../assets/admin-mobile-dashboard.png' });
  
  // Logout Admin - by going to root maybe? Or clearing cookies.
  await page.context().clearCookies();

  // 2. STUDENT
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);
  await page.fill('input[type="tel"]', '0702523201');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
  await page.screenshot({ path: '../assets/student-mobile-dashboard.png' });

  await page.context().clearCookies();

  // 3. PARENT
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);
  await page.fill('input[type="tel"]', '0935160045');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '../assets/parent-mobile-dashboard.png' });
});
