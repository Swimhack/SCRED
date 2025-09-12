import { test, expect } from '@playwright/test';

test('Debug contact form basics', async ({ page }) => {
  const errors: string[] = [];
  const consoleMessages: string[] = [];
  
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  page.on('response', response => {
    if (!response.ok()) {
      console.log(`HTTP Error: ${response.status()} ${response.url()}`);
    }
  });
  
  await page.goto('/contact');
  await page.waitForLoadState('networkidle');
  
  // Check if form elements exist
  const nameInput = page.locator('input[name="name"]');
  const emailInput = page.locator('input[name="email"]');  
  const submitButton = page.locator('button[type="submit"]');
  
  console.log('Name input exists:', await nameInput.count() > 0);
  console.log('Email input exists:', await emailInput.count() > 0);
  console.log('Submit button exists:', await submitButton.count() > 0);
  
  if (await submitButton.count() > 0) {
    console.log('Submit button text:', await submitButton.textContent());
  }
  
  // Try clicking submit button directly
  console.log('Attempting to click submit button...');
  await submitButton.click();
  
  await page.waitForTimeout(2000);
  
  console.log('Console messages after click:', consoleMessages.slice(-10));
  console.log('JavaScript errors:', errors);
  
  // Check if any network requests were made
  await page.evaluate(() => {
    console.log('Button click test completed');
  });
  
  await page.waitForTimeout(1000);
  console.log('Final console messages:', consoleMessages.slice(-5));
});