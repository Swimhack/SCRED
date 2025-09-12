import { test, expect } from '@playwright/test';

test('Debug toast system', async ({ page }) => {
  await page.goto('/contact');
  await page.waitForLoadState('networkidle');
  
  // Take initial screenshot
  await page.screenshot({ path: 'test-screenshots/debug-toast-initial.png', fullPage: true });
  
  // Submit empty form
  await page.click('button[type="submit"]');
  
  // Wait for any toast to appear
  await page.waitForTimeout(2000);
  
  // Take screenshot after click
  await page.screenshot({ path: 'test-screenshots/debug-toast-after-click.png', fullPage: true });
  
  // Check all possible toast selectors
  const selectors = [
    '[data-radix-toast-viewport]',
    '[data-radix-toast-viewport] [role="alert"]', 
    '[role="alert"]',
    '.toast',
    '[data-toast]',
    '[data-state="open"]'
  ];
  
  console.log('Checking toast selectors...');
  for (const selector of selectors) {
    const element = page.locator(selector);
    const count = await element.count();
    console.log(`${selector}: ${count} elements found`);
    
    if (count > 0) {
      try {
        const text = await element.first().textContent();
        const isVisible = await element.first().isVisible();
        console.log(`  Text: "${text}"`);
        console.log(`  Visible: ${isVisible}`);
      } catch (e) {
        console.log(`  Error getting text/visibility: ${e}`);
      }
    }
  }
  
  // Check console logs
  const logs: string[] = [];
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  // Trigger validation again to capture logs
  await page.fill('input[name="name"]', '');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
  
  console.log('Console logs:', logs);
  
  // Check DOM structure
  const bodyContent = await page.evaluate(() => document.body.innerHTML);
  const hasToastProvider = bodyContent.includes('data-radix-toast');
  console.log('Has toast provider in DOM:', hasToastProvider);
  
  // Final screenshot
  await page.screenshot({ path: 'test-screenshots/debug-toast-final.png', fullPage: true });
});