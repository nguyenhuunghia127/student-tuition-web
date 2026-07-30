const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

(async () => {
  if (!fs.existsSync('../assets')) {
    fs.mkdirSync('../assets');
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: { dir: '../assets/' }, // Ghi video
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // 1. ADMIN
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'admin@gmail.com');
  await page.fill('input[type="password"]', 'chanh123');
  await page.click('button:has-text("Đăng Nhập")');
  await page.waitForTimeout(2000); 
  await page.screenshot({ path: '../assets/admin-mobile-dashboard.png' });
  
  await page.click('button:has-text("Đăng Xuất")');
  await page.waitForTimeout(1000);

  // 2. STUDENT
  await page.click('text=Đăng nhập cho Học sinh / Phụ huynh');
  await page.waitForTimeout(1000);
  await page.fill('input[type="tel"]', '0702523201');
  await page.click('button:has-text("Vào Hệ Thống")');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: '../assets/student-mobile-dashboard.png' });

  await page.click('button:has-text("Đăng Xuất")');
  await page.waitForTimeout(1000);

  // 3. PARENT (just mock)
  await page.fill('input[type="tel"]', '0935160045');
  await page.click('button:has-text("Vào Hệ Thống")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '../assets/parent-mobile-dashboard.png' });
  
  await context.close();
  await browser.close();

  const files = fs.readdirSync('../assets');
  const webmFile = files.find(f => f.endsWith('.webm'));
  if (webmFile) {
    fs.renameSync(`../assets/${webmFile}`, '../assets/demo-video.webm');
  }
  
  console.log('Screenshots & Video recorded successfully!');
})();
