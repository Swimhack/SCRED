import { test, expect } from '@playwright/test';

test.describe('Admin Route Analysis', () => {
  test('/admin route redirects to dashboard then auth as expected', async ({ page }) => {
    // Navigate to /admin
    const response = await page.goto('/admin');
    
    console.log(`Response status: ${response?.status()}`);
    console.log(`Current URL: ${page.url()}`);
    
    // Wait for redirects to complete
    await page.waitForURL('**/auth', { timeout: 5000 });
    
    // The /admin route should redirect through dashboard to auth
    const finalUrl = page.url();
    const isOnAuthPage = finalUrl.includes('/auth');
    
    console.log('Admin redirect result:', {
      finalUrl,
      isOnAuthPage
    });
    
    // Should end up on auth page after redirect chain: /admin -> /dashboard -> /auth
    expect(isOnAuthPage).toBe(true);
    
    // Verify auth form is present
    const hasAuthForm = await page.locator('input[type="email"]').isVisible();
    expect(hasAuthForm).toBe(true);
  });

  test('/dashboard route should be the admin access point', async ({ page }) => {
    // Navigate to /dashboard (the actual admin route)
    await page.goto('/dashboard');
    
    console.log(`Dashboard URL: ${page.url()}`);
    
    // Should redirect to auth when not authenticated
    const isAuthPage = page.url().includes('/auth');
    const hasAuthForm = await page.locator('input[type="email"], input[placeholder*="email"]').isVisible({ timeout: 3000 });
    
    console.log('Dashboard redirect result:', {
      isAuthPage,
      hasAuthForm,
      currentUrl: page.url()
    });
    
    // Should redirect to auth for protected dashboard
    expect(isAuthPage || hasAuthForm).toBe(true);
  });

  test('Available admin routes should redirect to auth when not authenticated', async ({ page }) => {
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
      console.log(`Testing admin route: ${route}`);
      
      await page.goto(route);
      await page.waitForTimeout(1000);
      
      const currentUrl = page.url();
      const redirectedToAuth = currentUrl.includes('/auth');
      
      console.log(`${route} -> ${currentUrl} (auth redirect: ${redirectedToAuth})`);
      
      // All admin routes should redirect to auth when not authenticated
      expect(redirectedToAuth).toBe(true);
    }
  });

  test('Verify React Router catches all undefined routes', async ({ page }) => {
    const undefinedRoutes = [
      '/admin/dashboard', 
      '/admin/users',
      '/non-existent',
      '/random-path',
      '/undefined-route-test'
    ];
    
    for (const route of undefinedRoutes) {
      console.log(`Testing undefined route: ${route}`);
      
      await page.goto(route);
      await page.waitForTimeout(2000); // Give more time for route resolution
      
      // Check for NotFound component
      const has404 = await page.locator('h1:has-text("404")').isVisible();
      const hasNotFound = await page.locator('text="Page not found"').isVisible();
      const hasOopsMessage = await page.locator('text="Oops! Page not found"').isVisible();
      
      console.log(`${route} shows 404: ${has404 || hasNotFound || hasOopsMessage}`);
      console.log(`Current URL for ${route}: ${page.url()}`);
      
      expect(has404 || hasNotFound || hasOopsMessage).toBe(true);
    }
  });
});