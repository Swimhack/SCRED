import { test, expect } from '@playwright/test';

test.describe('Contact Form Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test('should show validation error for empty form submission', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    const toast = page.locator('[data-radix-toast-viewport] [role="alert"]');
    await expect(toast).toBeVisible({ timeout: 3000 });
    await expect(toast).toContainText('Missing required fields');
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('textarea[name="message"]', 'Test message');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    const toast = page.locator('[data-radix-toast-viewport] [role="alert"]');
    await expect(toast).toBeVisible({ timeout: 3000 });
    await expect(toast).toContainText('Invalid email address');
  });

  test('should show missing fields error when message is empty', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    const toast = page.locator('[data-radix-toast-viewport] [role="alert"]');
    await expect(toast).toBeVisible({ timeout: 3000 });
    await expect(toast).toContainText('Missing required fields');
  });

  test('should attempt form submission with valid data', async ({ page }) => {
    await page.fill('input[name="name"]', 'John Smith');
    await page.fill('input[name="email"]', 'john.smith@example.com');
    await page.fill('input[name="phone"]', '555-123-4567');
    await page.fill('textarea[name="message"]', 'Test message for contact form validation.');
    
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toHaveText('Send Message');
    
    await submitButton.click();
    
    // Button should show loading state
    await expect(submitButton).toHaveText('Sending...', { timeout: 1000 });
    await expect(submitButton).toBeDisabled();
    
    // Wait for response
    await page.waitForTimeout(6000);
    
    // Button should return to normal state
    await expect(submitButton).toHaveText('Send Message');
    await expect(submitButton).not.toBeDisabled();
  });});