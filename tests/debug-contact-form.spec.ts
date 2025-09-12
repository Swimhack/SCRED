import { test, expect } from '@playwright/test';

// Debug test to understand the current contact form behavior
test.describe('Contact Form Debug', () => {
  
  test('Debug contact form current state and behavior', async ({ page }) => {
    console.log('🔍 Starting contact form debug session...');
    
    // Navigate to contact page
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-screenshots/debug-contact-initial.png',
      fullPage: true 
    });
    
    console.log('📄 Page loaded, checking form elements...');
    
    // Check form elements
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    const phoneInput = page.locator('input[name="phone"]');
    const messageTextarea = page.locator('textarea[name="message"]');
    const submitButton = page.locator('button[type="submit"]');
    
    console.log('Name input present:', await nameInput.isVisible());
    console.log('Email input present:', await emailInput.isVisible());
    console.log('Phone input present:', await phoneInput.isVisible());
    console.log('Message textarea present:', await messageTextarea.isVisible());
    console.log('Submit button present:', await submitButton.isVisible());
    console.log('Submit button text:', await submitButton.textContent());
    
    // Try empty form submission and capture all possible toast selectors
    console.log('🧪 Testing empty form submission...');
    
    const logs: string[] = [];
    page.on('console', (msg) => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    await submitButton.click();
    
    // Wait a moment for any UI changes
    await page.waitForTimeout(2000);
    
    // Take screenshot after submission
    await page.screenshot({ 
      path: 'test-screenshots/debug-contact-after-empty-submit.png',
      fullPage: true 
    });
    
    // Check for various toast selectors
    const possibleToastSelectors = [
      '[data-radix-toast-viewport]',
      '[data-radix-toast-viewport] [role="alert"]',
      '[role="alert"]',
      '.toast',
      '[data-toast]',
      '[data-sonner-toast]',
      '.Toaster',
      '[data-state="open"]'
    ];
    
    console.log('🔍 Checking possible toast selectors...');
    for (const selector of possibleToastSelectors) {
      const element = page.locator(selector);
      const count = await element.count();
      const isVisible = count > 0 ? await element.first().isVisible() : false;
      console.log(`${selector}: count=${count}, visible=${isVisible}`);
      
      if (count > 0 && isVisible) {
        try {
          const text = await element.first().textContent();
          console.log(`  Text: "${text}"`);
        } catch (e) {
          console.log(`  Could not get text: ${e}`);
        }
      }
    }
    
    // Check DOM for toast-related elements
    const allElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const toastLike = [];
      elements.forEach(el => {
        const className = el.className || '';
        const textContent = el.textContent || '';
        
        if (textContent.includes('Missing') || 
            textContent.includes('required') ||
            textContent.includes('field') ||
            className.includes('toast') ||
            el.getAttribute('role') === 'alert') {
          toastLike.push({
            tagName: el.tagName,
            className: className,
            role: el.getAttribute('role'),
            'data-state': el.getAttribute('data-state'),
            textContent: textContent.substring(0, 100)
          });
        }
      });
      return toastLike;
    });
    
    console.log('🔍 Toast-like elements in DOM:', JSON.stringify(allElements, null, 2));
    
    // Print console logs
    console.log('📋 Console logs during test:');
    logs.forEach((log, index) => {
      console.log(`  ${index + 1}: ${log}`);
    });
    
    // Now test with valid data to see success behavior
    console.log('🧪 Testing with valid data...');
    
    await page.fill('input[name="name"]', 'Debug Test User');
    await page.fill('input[name="email"]', 'debug@example.com');
    await page.fill('textarea[name="message"]', 'Debug test message');
    
    // Take screenshot of filled form
    await page.screenshot({ 
      path: 'test-screenshots/debug-contact-filled.png',
      fullPage: true 
    });
    
    await submitButton.click();
    
    // Check button state
    await page.waitForTimeout(500);
    console.log('Button text after submit:', await submitButton.textContent());
    console.log('Button disabled:', await submitButton.isDisabled());
    
    await page.waitForTimeout(5000);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-screenshots/debug-contact-after-valid-submit.png',
      fullPage: true 
    });
    
    // Check for any toasts again
    console.log('🔍 Checking for toasts after valid submission...');
    for (const selector of possibleToastSelectors) {
      const element = page.locator(selector);
      const count = await element.count();
      const isVisible = count > 0 ? await element.first().isVisible() : false;
      console.log(`${selector}: count=${count}, visible=${isVisible}`);
      
      if (count > 0 && isVisible) {
        try {
          const text = await element.first().textContent();
          console.log(`  Text: "${text}"`);
        } catch (e) {
          console.log(`  Could not get text: ${e}`);
        }
      }
    }
    
    console.log('✅ Debug session complete');
  });
});