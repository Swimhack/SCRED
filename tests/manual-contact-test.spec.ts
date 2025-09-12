import { test, expect } from '@playwright/test';

test('Manual contact form test', async ({ page }) => {
  // Enable more detailed console logging
  page.on('console', msg => {
    console.log(`Browser console [${msg.type()}]: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`Page error: ${error.message}`);
    console.log(error.stack);
  });
  
  await page.goto('http://localhost:8080/contact');
  await page.waitForLoadState('networkidle');
  
  // Wait a bit to ensure all components are loaded
  await page.waitForTimeout(2000);
  
  console.log('Page loaded, attempting form submission...');
  
  // Click the submit button
  await page.click('button[type="submit"]');
  
  // Wait for any response
  await page.waitForTimeout(3000);
  
  console.log('Form submission attempt completed');
});