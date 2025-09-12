import { test, expect } from '@playwright/test';

test.describe('Comprehensive Routing Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up any necessary context or state
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console error: ${msg.text()}`);
      }
    });
  });

  test('should load main page successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/StreetCredRx/i);
    
    // Check that the page loaded without JavaScript errors
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
    
    // Verify main navigation elements are present
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should navigate to public routes', async ({ page }) => {
    const publicRoutes = [
      { path: '/', titleRegex: /StreetCredRx/i },
      { path: '/about', titleRegex: /About.*StreetCredRx/i },
      { path: '/service', titleRegex: /Service.*StreetCredRx/i },
      { path: '/contact', titleRegex: /Contact.*StreetCredRx/i }
    ];

    for (const route of publicRoutes) {
      await page.goto(route.path);
      await expect(page).toHaveTitle(route.titleRegex);
      
      // Verify no JavaScript errors
      const errors = [];
      page.on('pageerror', error => errors.push(error));
      await page.waitForTimeout(1000);
      expect(errors).toHaveLength(0);
    }
  });

  test('should handle /admin route (expected to 404 or redirect)', async ({ page }) => {
    const response = await page.goto('/admin');
    
    // The route should either:
    // 1. Return 404 (not found)
    // 2. Redirect to login/auth
    // 3. Show "Not Found" page
    
    if (response) {
      console.log(`Response status for /admin: ${response.status()}`);
    }
    
    // Check if it shows the NotFound component or redirects
    const isNotFound = await page.locator('text=/not found|404/i').isVisible({ timeout: 3000 });
    const isAuth = await page.locator('text=/sign in|login|auth/i').isVisible({ timeout: 3000 });
    const isUnauthorized = await page.locator('text=/unauthorized|access denied/i').isVisible({ timeout: 3000 });
    
    // One of these should be true
    expect(isNotFound || isAuth || isUnauthorized).toBe(true);
  });

  test('should redirect protected routes to auth when not authenticated', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/profile',
      '/pharmacist-form',
      '/pharmacists',
      '/pending',
      '/completed',
      '/user-management'
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should either show auth page, unauthorized page, or redirect to auth
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      const isAuthPage = currentUrl.includes('/auth') || 
                        await page.locator('text=/sign in|login|authenticate/i').isVisible({ timeout: 3000 });
      const isUnauthorized = await page.locator('text=/unauthorized|access denied/i').isVisible({ timeout: 3000 });
      
      expect(isAuthPage || isUnauthorized).toBe(true);
      console.log(`Route ${route} -> ${currentUrl} (auth: ${isAuthPage}, unauth: ${isUnauthorized})`);
    }
  });

  test('should load auth page correctly', async ({ page }) => {
    await page.goto('/auth');
    
    // Check for auth page elements
    const hasSignInForm = await page.locator('input[type="email"], input[placeholder*="email" i]').isVisible({ timeout: 5000 });
    const hasPasswordInput = await page.locator('input[type="password"], input[placeholder*="password" i]').isVisible({ timeout: 5000 });
    const hasAuthButton = await page.locator('button:has-text("Sign"), button:has-text("Login"), button:has-text("Auth")').isVisible({ timeout: 5000 });
    
    expect(hasSignInForm || hasPasswordInput || hasAuthButton).toBe(true);
  });

  test('should handle non-existent routes with 404', async ({ page }) => {
    const nonExistentRoutes = [
      '/non-existent-page',
      '/random-route',
      '/admin/non-existent',
      '/dashboard/invalid'
    ];

    for (const route of nonExistentRoutes) {
      await page.goto(route);
      
      // Should show NotFound component or 404-like content
      const isNotFound = await page.locator('text=/not found|404|page.*not.*exist/i').isVisible({ timeout: 3000 });
      
      expect(isNotFound).toBe(true);
      console.log(`Route ${route} correctly shows 404`);
    }
  });

  test('should have working navigation links on main page', async ({ page }) => {
    await page.goto('/');
    
    // Find navigation links
    const navLinks = await page.locator('nav a, header a').all();
    
    for (const link of navLinks) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      
      if (href && !href.startsWith('http') && !href.startsWith('#')) {
        console.log(`Testing navigation link: ${text} -> ${href}`);
        
        // Click the link and verify it navigates
        await link.click();
        await page.waitForTimeout(1000);
        
        const currentUrl = page.url();
        console.log(`Navigation result: ${currentUrl}`);
        
        // Go back to home page for next test
        await page.goto('/');
        await page.waitForTimeout(500);
      }
    }
  });

  test('should handle React Router browser history', async ({ page }) => {
    // Test browser back/forward with React Router
    await page.goto('/');
    await page.goto('/about');
    await page.goto('/contact');
    
    // Go back
    await page.goBack();
    expect(page.url()).toContain('/about');
    
    // Go forward
    await page.goForward();
    expect(page.url()).toContain('/contact');
    
    // Go back to home
    await page.goBack();
    await page.goBack();
    expect(page.url()).toMatch(/\/$|\/index/);
  });

  test('should have proper meta tags and SEO elements', async ({ page }) => {
    const routes = ['/', '/about', '/service', '/contact'];
    
    for (const route of routes) {
      await page.goto(route);
      
      // Check for basic SEO elements
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
      
      // Check for meta description
      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
      if (metaDescription) {
        expect(metaDescription.length).toBeGreaterThan(0);
      }
      
      console.log(`Route ${route}: Title="${title}", Description="${metaDescription || 'none'}"`);
    }
  });
});