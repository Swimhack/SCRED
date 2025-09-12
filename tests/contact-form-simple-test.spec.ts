import { test, expect } from '@playwright/test';

test.describe('Contact Form Simple Validation Test', () => {
  
  test('Check form validation behavior with detailed logging', async ({ page }) => {
    console.log('🔍 Starting simple contact form test...');
    
    // Capture console logs
    const logs: string[] = [];
    page.on('console', (msg) => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Navigate to contact page
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    console.log('📄 Page loaded successfully');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-screenshots/simple-test-initial.png',
      fullPage: true 
    });
    
    // Test 1: Empty form submission
    console.log('🧪 Test 1: Empty form submission');
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Wait for any UI changes
    await page.waitForTimeout(3000);
    
    // Take screenshot after empty submission
    await page.screenshot({ 
      path: 'test-screenshots/simple-test-empty-submit.png',
      fullPage: true 
    });
    
    // Check for any visible error elements
    const allAlerts = page.locator('[role="alert"]');
    const allToasts = page.locator('[data-state="open"]');
    const allErrorText = page.locator('*').filter({ hasText: /missing|required|invalid|error/i });
    
    console.log('Alert count:', await allAlerts.count());
    console.log('Toast count:', await allToasts.count());  
    console.log('Error text count:', await allErrorText.count());
    
    if (await allErrorText.count() > 0) {
      for (let i = 0; i < await allErrorText.count(); i++) {
        const text = await allErrorText.nth(i).textContent();
        console.log(`Error text ${i}: "${text}"`);
      }
    }
    
    // Test 2: Invalid email format
    console.log('🧪 Test 2: Invalid email format');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('textarea[name="message"]', 'Test message');
    
    await submitButton.click();
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-screenshots/simple-test-invalid-email.png',
      fullPage: true 
    });
    
    // Check for error messages again
    const emailErrorCount = await allErrorText.count();
    console.log('Email error elements found:', emailErrorCount);
    
    // Test 3: Valid form submission (will likely fail due to backend)
    console.log('🧪 Test 3: Valid form submission');
    await page.fill('input[name="email"]', 'valid@example.com');
    
    await submitButton.click();
    
    // Check button state immediately
    const buttonTextAfterClick = await submitButton.textContent();
    const isDisabled = await submitButton.isDisabled();
    console.log('Button text after click:', buttonTextAfterClick);
    console.log('Button disabled:', isDisabled);
    
    await page.waitForTimeout(8000); // Wait for network request
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-screenshots/simple-test-valid-submit.png',
      fullPage: true 
    });
    
    // Check final button state
    const finalButtonText = await submitButton.textContent();
    const finalIsDisabled = await submitButton.isDisabled();
    console.log('Final button text:', finalButtonText);
    console.log('Final button disabled:', finalIsDisabled);
    
    // Print all console logs
    console.log('📋 All console logs:');
    logs.forEach((log, index) => {
      console.log(`${index + 1}: ${log}`);
    });
    
    // Final check for any error or success messages
    const finalErrorCount = await allErrorText.count();
    console.log('Final error/message count:', finalErrorCount);
    
    if (finalErrorCount > 0) {
      for (let i = 0; i < Math.min(finalErrorCount, 5); i++) {
        const text = await allErrorText.nth(i).textContent();
        console.log(`Final message ${i}: "${text}"`);
      }
    }
    
    console.log('✅ Simple test completed');
  });
});