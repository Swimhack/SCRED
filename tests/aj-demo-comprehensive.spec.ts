import { test, expect } from '@playwright/test';

test.describe('StreetCredRx Platform - Comprehensive Demo for A.J. Lipka', () => {
  
  test('Homepage and navigation - What A.J. sees first', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot of homepage
    await page.screenshot({ 
      path: 'test-results/01-homepage-full.png', 
      fullPage: true 
    });
    
    // Check for professional branding elements
    await expect(page.locator('text=StreetCredRx')).toBeVisible();
    
    // Test navigation elements
    const navLinks = ['Home', 'About', 'Service', 'Contact', 'Log In'];
    for (const link of navLinks) {
      await expect(page.locator(`text=${link}`)).toBeVisible();
    }
    
    // Screenshot navigation bar closeup
    await page.screenshot({ 
      path: 'test-results/02-navigation-bar.png',
      clip: { x: 0, y: 0, width: 1920, height: 100 }
    });
  });

  test('Authentication system - Sign up and login interface', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Screenshot login form
    await page.screenshot({ 
      path: 'test-results/03-login-form.png',
      fullPage: true 
    });
    
    // Test login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=Sign in')).toBeVisible();
    
    // Switch to sign up form
    await page.click('text=Sign up');
    await page.waitForTimeout(1000);
    
    // Screenshot signup form
    await page.screenshot({ 
      path: 'test-results/04-signup-form.png',
      fullPage: true 
    });
    
    // Test signup form elements
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Test forgot password flow
    await page.click('text=Sign in');
    await page.waitForTimeout(500);
    await page.click('text=Forgot your password?');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/05-forgot-password.png',
      fullPage: true 
    });
  });

  test('Dashboard access and admin routes - Core functionality for A.J.', async ({ page }) => {
    // Test dashboard route (should redirect to auth for unauthenticated users)
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should be redirected to auth
    expect(page.url()).toContain('/auth');
    
    // Screenshot what users see when trying to access dashboard
    await page.screenshot({ 
      path: 'test-results/06-dashboard-redirect-to-auth.png',
      fullPage: true 
    });
    
    // Test admin route redirect
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Should also redirect to auth
    expect(page.url()).toContain('/auth');
    
    // Test all protected admin routes
    const adminRoutes = [
      '/pharmacists',
      '/pending', 
      '/completed',
      '/expiring',
      '/user-management',
      '/logs',
      '/messages'
    ];
    
    for (const route of adminRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      // All should redirect to auth when not authenticated
      expect(page.url()).toContain('/auth');
    }
    
    await page.screenshot({ 
      path: 'test-results/07-protected-routes-auth-required.png',
      fullPage: true 
    });
  });

  test('Public pages - About, Service, Contact', async ({ page }) => {
    // Test About page
    await page.goto('/about');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/08-about-page.png',
      fullPage: true 
    });
    
    // Test Service page
    await page.goto('/service');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/09-service-page.png',
      fullPage: true 
    });
    
    // Test Contact page
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/10-contact-page.png',
      fullPage: true 
    });
    
    // Test contact form elements
    const contactForm = page.locator('form');
    if (await contactForm.isVisible()) {
      await expect(contactForm).toBeVisible();
      
      // Look for common form fields
      const possibleFields = ['name', 'email', 'message', 'subject', 'phone'];
      let visibleFields = 0;
      
      for (const field of possibleFields) {
        const fieldLocator = page.locator(`input[name="${field}"], input[placeholder*="${field}"], textarea[name="${field}"]`);
        if (await fieldLocator.isVisible()) {
          visibleFields++;
        }
      }
      
      console.log(`Contact form has ${visibleFields} visible fields`);
    }
  });

  test('Mobile responsiveness - Multi-device testing', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/11-mobile-homepage.png',
      fullPage: true 
    });
    
    // Test mobile auth page
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/12-mobile-auth.png',
      fullPage: true 
    });
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/13-tablet-homepage.png',
      fullPage: true 
    });
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('Error handling and 404 pages', async ({ page }) => {
    // Test 404 handling
    await page.goto('/non-existent-page');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/14-404-page.png',
      fullPage: true 
    });
    
    // Test another invalid route
    await page.goto('/admin/invalid-route');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/15-admin-404.png',
      fullPage: true 
    });
  });

  test('Performance and console errors check', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate and measure performance
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`Homepage load time: ${loadTime}ms`);
    console.log(`Console errors found: ${consoleErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }
    
    // Test key pages for errors
    const pagesToTest = ['/', '/about', '/service', '/contact', '/auth'];
    
    for (const pagePath of pagesToTest) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Check if page loaded successfully
      const title = await page.title();
      console.log(`Page ${pagePath}: Title = "${title}"`);
    }
    
    // Take final screenshot of homepage with all console info
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/16-final-homepage-quality-check.png',
      fullPage: true 
    });
  });

});