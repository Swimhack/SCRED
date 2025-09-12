import { test, expect } from '@playwright/test';

test('Debug JavaScript errors', async ({ page }) => {
  const consoleMessages: string[] = [];
  const errors: string[] = [];
  
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    errors.push(`Page error: ${error.message}`);
  });
  
  await page.goto('/contact');
  await page.waitForLoadState('networkidle');
  
  // Trigger toast to see if there are errors
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
  
  console.log('Console messages:', consoleMessages);
  console.log('JavaScript errors:', errors);
  
  // Try to trigger toast directly via JavaScript
  const toastResult = await page.evaluate(() => {
    try {
      // Check if toast function exists
      const toastModule = (window as any).__vite__?.modules?.['@/hooks/use-toast'];
      return `Toast module available: ${!!toastModule}`;
    } catch (e) {
      return `Error checking toast module: ${e.message}`;
    }
  });
  
  console.log('Toast module check:', toastResult);
  
  // Check if React is working
  const reactCheck = await page.evaluate(() => {
    const reactElements = document.querySelectorAll('[data-reactroot]');
    const hasReactElements = reactElements.length > 0;
    return `React elements found: ${hasReactElements}`;
  });
  
  console.log('React check:', reactCheck);
});