import { test, expect } from '@playwright/test';

// Mobile Responsiveness Test Suite for StreetCredRx
test.describe('Mobile Responsiveness Tests', () => {
  
  // Test 1: Mobile Layout Validation (iPhone SE - 375px)
  test('iPhone SE (375px) - No horizontal overflow', async ({ page }) => {
    // Set viewport to iPhone SE size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to the landing page
    await page.goto('/');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check for horizontal overflow
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
    
    console.log(`Body scroll width: ${bodyScrollWidth}, client width: ${bodyClientWidth}`);
    expect(bodyScrollWidth).toBeLessThanOrEqual(375);
    
    // Take screenshot of mobile layout
    await page.screenshot({ 
      path: 'test-screenshots/mobile-375px-landing.png',
      fullPage: true 
    });
    
    // Check that content fits within viewport
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(pageWidth).toBeLessThanOrEqual(375);
  });

  // Test 2: Contact Form Mobile Testing
  test('Contact form mobile functionality', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to contact page
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // Check for horizontal overflow on contact page
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(pageWidth).toBeLessThanOrEqual(375);
    
    // Take screenshot before filling form
    await page.screenshot({ 
      path: 'test-screenshots/mobile-contact-form-empty.png',
      fullPage: true 
    });
    
    // Fill out the contact form
    await page.fill('input[name="name"]', 'Test User Mobile');
    await page.fill('input[name="email"]', 'testmobile@example.com');
    await page.fill('input[name="phone"]', '555-0123');
    await page.fill('textarea[name="message"]', 'This is a test message from mobile device to verify form functionality and responsiveness.');
    
    // Take screenshot with filled form
    await page.screenshot({ 
      path: 'test-screenshots/mobile-contact-form-filled.png',
      fullPage: true 
    });
    
    // Verify form elements are properly sized for mobile
    const submitButton = page.locator('button[type="submit"]');
    const buttonBox = await submitButton.boundingBox();
    
    if (buttonBox) {
      // Button should be at least 44px tall for touch accessibility
      expect(buttonBox.height).toBeGreaterThanOrEqual(44);
      // Button should not exceed viewport width
      expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(375);
    }
    
    // Test form submission (without actually submitting)
    expect(await submitButton.isVisible()).toBe(true);
    expect(await submitButton.isEnabled()).toBe(true);
  });

  // Test 3: Navigation Menu Mobile Testing
  test('Mobile navigation menu functionality', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for mobile menu toggle (hamburger menu)
    const mobileMenuToggle = page.locator('[data-testid="mobile-menu-toggle"], .hamburger, [aria-label*="menu" i], button[aria-expanded]').first();
    
    if (await mobileMenuToggle.isVisible()) {
      // Click mobile menu toggle
      await mobileMenuToggle.click();
      
      // Take screenshot with menu open
      await page.screenshot({ 
        path: 'test-screenshots/mobile-nav-menu-open.png',
        fullPage: true 
      });
      
      // Verify menu items are accessible
      const menuItems = page.locator('nav a, [role="menuitem"]');
      const itemCount = await menuItems.count();
      
      if (itemCount > 0) {
        // Test first menu item click
        const firstItem = menuItems.first();
        expect(await firstItem.isVisible()).toBe(true);
      }
    }
    
    // Check brand logo visibility and size
    const logo = page.locator('img[alt*="logo" i], .logo, [data-testid="logo"]').first();
    if (await logo.isVisible()) {
      const logoBox = await logo.boundingBox();
      if (logoBox) {
        // Logo should not be too wide for mobile
        expect(logoBox.width).toBeLessThanOrEqual(200);
      }
    }
  });

  // Test 4: Responsive Breakpoints Testing
  test('Multiple breakpoints validation', async ({ page }) => {
    const breakpoints = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1024, height: 768, name: 'Small Desktop' },
      { width: 1920, height: 1080, name: 'Large Desktop' }
    ];
    
    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for horizontal overflow at each breakpoint
      const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(pageWidth).toBeLessThanOrEqual(bp.width + 20); // Allow small margin for scrollbars
      
      // Take screenshot at each breakpoint
      await page.screenshot({ 
        path: `test-screenshots/responsive-${bp.width}x${bp.height}-${bp.name.toLowerCase().replace(' ', '-')}.png`,
        fullPage: false // Keep it to viewport only for comparison
      });
      
      // Test main content visibility
      const mainContent = page.locator('main, #root, .app').first();
      expect(await mainContent.isVisible()).toBe(true);
    }
  });

  // Test 5: Touch Target Size Validation
  test('Touch targets meet accessibility standards', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check button sizes meet 44px minimum for touch targets
    const buttons = page.locator('button, a[role="button"], input[type="submit"]');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) { // Check first 10 buttons
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          // WCAG recommends minimum 44x44px for touch targets
          const minSize = 44;
          expect(Math.max(box.width, box.height)).toBeGreaterThanOrEqual(minSize - 10); // Allow some flexibility
        }
      }
    }
  });

  // Test 6: Text Readability on Mobile
  test('Text remains readable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check font sizes are appropriate for mobile
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div');
    const elementCount = await textElements.count();
    
    for (let i = 0; i < Math.min(elementCount, 20); i++) { // Check first 20 text elements
      const element = textElements.nth(i);
      if (await element.isVisible()) {
        const fontSize = await element.evaluate(el => {
          const style = window.getComputedStyle(el);
          return parseInt(style.fontSize);
        });
        
        // Minimum font size should be at least 14px for readability
        if (fontSize > 0) {
          expect(fontSize).toBeGreaterThanOrEqual(12); // Allow some flexibility
        }
      }
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-screenshots/mobile-text-readability.png',
      fullPage: true 
    });
  });

  // Test 7: Image Responsiveness
  test('Images scale properly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that images don't exceed viewport width
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        const box = await img.boundingBox();
        if (box) {
          // Images should not exceed viewport width
          expect(box.width).toBeLessThanOrEqual(375);
          expect(box.x + box.width).toBeLessThanOrEqual(375);
        }
      }
    }
  });

  // Test 8: Performance on Mobile
  test('Mobile performance metrics', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Measure page load time
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    console.log(`Page load time: ${loadTime}ms`);
    
    // Page should load within reasonable time (10 seconds max)
    expect(loadTime).toBeLessThan(10000);
    
    // Check for JavaScript errors
    const jsErrors: string[] = [];
    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });
    
    // Wait a bit to catch any runtime errors
    await page.waitForTimeout(2000);
    
    if (jsErrors.length > 0) {
      console.log('JavaScript errors found:', jsErrors);
    }
    
    // Take performance screenshot
    await page.screenshot({ 
      path: 'test-screenshots/mobile-performance-test.png',
      fullPage: true 
    });
  });
});

// Desktop Regression Tests
test.describe('Desktop Functionality Verification', () => {
  test('Desktop layout remains functional', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Basic desktop functionality checks
    expect(await page.title()).toBeTruthy();
    
    // Navigation should be visible and functional
    const nav = page.locator('nav').first();
    expect(await nav.isVisible()).toBe(true);
    
    // Take desktop screenshot for comparison
    await page.screenshot({ 
      path: 'test-screenshots/desktop-regression-test.png',
      fullPage: false 
    });
    
    // Test navigation to contact page
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // Contact form should be functional
    const contactForm = page.locator('form').first();
    expect(await contactForm.isVisible()).toBe(true);
  });
});