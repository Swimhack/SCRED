import { test, expect } from '@playwright/test';

test('Debug horizontal overflow on mobile', async ({ page }) => {
  // Set viewport to iPhone SE size
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Navigate to the landing page
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Get all elements and their widths
  const elementWidths = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    const results: { tag: string, id: string, class: string, scrollWidth: number, offsetWidth: number, clientWidth: number }[] = [];
    
    elements.forEach(el => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.scrollWidth > 375 || htmlEl.offsetWidth > 375) {
        results.push({
          tag: htmlEl.tagName,
          id: htmlEl.id || '',
          class: htmlEl.className || '',
          scrollWidth: htmlEl.scrollWidth,
          offsetWidth: htmlEl.offsetWidth,
          clientWidth: htmlEl.clientWidth
        });
      }
    });
    
    return results.sort((a, b) => b.scrollWidth - a.scrollWidth);
  });
  
  console.log('Elements causing horizontal overflow (width > 375px):');
  elementWidths.forEach((el, index) => {
    if (index < 20) { // Show top 20 problematic elements
      console.log(`${el.tag}${el.id ? '#' + el.id : ''}${el.class ? '.' + el.class.split(' ').join('.') : ''}: scrollWidth=${el.scrollWidth}, offsetWidth=${el.offsetWidth}`);
    }
  });
  
  // Check specific layout containers
  const bodyInfo = await page.evaluate(() => ({
    body: {
      scrollWidth: document.body.scrollWidth,
      offsetWidth: document.body.offsetWidth,
      clientWidth: document.body.clientWidth
    },
    html: {
      scrollWidth: document.documentElement.scrollWidth,
      offsetWidth: document.documentElement.offsetWidth,
      clientWidth: document.documentElement.clientWidth
    },
    viewport: {
      innerWidth: window.innerWidth,
      outerWidth: window.outerWidth
    }
  }));
  
  console.log('Layout debug info:', bodyInfo);
  
  // Take a screenshot
  await page.screenshot({ 
    path: 'test-screenshots/overflow-debug-mobile.png',
    fullPage: true 
  });
  
  // Add visual indicators for overflowing elements
  await page.addStyleTag({
    content: `
      * {
        box-sizing: border-box !important;
      }
      body {
        border: 2px solid red !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .overflow-debug {
        outline: 3px solid lime !important;
        background: rgba(255, 0, 0, 0.1) !important;
      }
    `
  });
  
  // Mark elements that exceed viewport width
  await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    elements.forEach(el => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.scrollWidth > 375 || htmlEl.offsetWidth > 375) {
        htmlEl.classList.add('overflow-debug');
      }
    });
  });
  
  await page.screenshot({ 
    path: 'test-screenshots/overflow-debug-highlighted.png',
    fullPage: true 
  });
});