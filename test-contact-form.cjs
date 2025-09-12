const { chromium } = require('playwright');
const fs = require('fs');

async function testContactForm() {
  console.log('🧪 Starting StreetCredRx Contact Form Testing...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`🟦 CONSOLE [${msg.type()}]: ${msg.text()}`);
  });
  
  // Enable request/response logging
  page.on('request', request => {
    if (request.url().includes('supabase') || request.url().includes('contact') || request.url().includes('send-contact-email')) {
      console.log(`🟨 REQUEST: ${request.method()} ${request.url()}`);
      if (request.postData()) {
        console.log(`🟨 POST DATA: ${request.postData()}`);
      }
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('supabase') || response.url().includes('contact') || response.url().includes('send-contact-email')) {
      console.log(`🟩 RESPONSE: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('📍 Step 1: Navigating to contact page...');
    await page.goto('https://streetcred.fly.dev/contact', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('📸 Taking screenshot of contact page...');
    await page.screenshot({ path: 'contact-page-initial.png', fullPage: true });
    
    console.log('🔍 Checking for initial console errors...');
    const initialErrors = await page.evaluate(() => {
      return window.console._errors || [];
    });
    
    console.log('📍 Step 2: Locating form elements...');
    
    // Wait for form to be visible
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Check if form elements exist  
    let nameField, emailField, phoneField, messageField, submitButton;
    
    try {
      nameField = page.locator('input[name="name"]');
      if (await nameField.count() === 0) {
        nameField = page.locator('input').filter({ hasText: /name/i }).first();
      }
      
      emailField = page.locator('input[type="email"]');
      if (await emailField.count() === 0) {
        emailField = page.locator('input[name="email"]');
      }
      
      phoneField = page.locator('input[type="tel"]');
      if (await phoneField.count() === 0) {
        phoneField = page.locator('input[name="phone"]');
      }
      
      messageField = page.locator('textarea');
      
      submitButton = page.locator('button[type="submit"]');
      if (await submitButton.count() === 0) {
        submitButton = page.locator('button').filter({ hasText: /send|submit/i });
      }
    } catch (e) {
      console.log('⚠️ Error locating elements:', e.message);
    }
    
    console.log('✅ Found form elements, checking visibility...');
    
    const formElementsVisible = await page.evaluate(() => {
      const name = document.querySelector('input[name="name"]') || document.querySelector('input[id*="name"]') || document.querySelector('input[placeholder*="Name"]');
      const email = document.querySelector('input[name="email"]') || document.querySelector('input[type="email"]') || document.querySelector('input[placeholder*="Email"]');
      const phone = document.querySelector('input[name="phone"]') || document.querySelector('input[type="tel"]') || document.querySelector('input[placeholder*="Phone"]');
      const message = document.querySelector('textarea[name="message"]') || document.querySelector('textarea[placeholder*="Message"]');
      const submit = document.querySelector('button[type="submit"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Send') || b.textContent?.includes('Submit'));
      
      return {
        name: name ? 'found' : 'missing',
        email: email ? 'found' : 'missing',
        phone: phone ? 'found' : 'missing',
        message: message ? 'found' : 'missing',
        submit: submit ? 'found' : 'missing'
      };
    });
    
    console.log('🔍 Form elements status:', formElementsVisible);
    
    console.log('📍 Step 3: Filling out the form...');
    
    // Fill out the form
    await nameField.fill('Test User');
    await emailField.fill('test@example.com');
    await phoneField.fill('555-123-4567');
    await messageField.fill('This is a test submission to debug the contact form');
    
    console.log('📸 Taking screenshot after filling form...');
    await page.screenshot({ path: 'contact-form-filled.png', fullPage: true });
    
    console.log('📍 Step 4: Monitoring network and submitting form...');
    
    // Track network requests
    const requests = [];
    const responses = [];
    
    page.on('request', req => requests.push({
      url: req.url(),
      method: req.method(),
      headers: req.headers(),
      postData: req.postData()
    }));
    
    page.on('response', res => responses.push({
      url: res.url(),
      status: res.status(),
      statusText: res.statusText()
    }));
    
    // Click submit button
    console.log('🖱️ Clicking submit button...');
    await submitButton.click();
    
    // Wait for potential navigation or response
    await page.waitForTimeout(5000);
    
    console.log('📸 Taking screenshot after submission...');
    await page.screenshot({ path: 'contact-form-after-submit.png', fullPage: true });
    
    // Check for success/error messages
    const messages = await page.evaluate(() => {
      const toasts = Array.from(document.querySelectorAll('[role="alert"], .toast, .notification, .alert'));
      const errors = Array.from(document.querySelectorAll('.error, .invalid, [aria-invalid="true"]'));
      
      return {
        toasts: toasts.map(t => t.textContent?.trim()),
        errors: errors.map(e => e.textContent?.trim()),
        url: window.location.href
      };
    });
    
    console.log('💬 Messages found:', messages);
    
    // Get final console errors
    const finalErrors = await page.evaluate(() => {
      return {
        errors: window.console._errors || [],
        logs: window.console._logs || []
      };
    });
    
    console.log('\n📊 FINAL ANALYSIS:');
    console.log('==================');
    console.log('Form Elements:', formElementsVisible);
    console.log('Network Requests:', requests.length);
    console.log('Network Responses:', responses.length);
    console.log('Messages:', messages);
    
    // Save detailed results
    const results = {
      timestamp: new Date().toISOString(),
      formElements: formElementsVisible,
      networkRequests: requests,
      networkResponses: responses,
      messages: messages,
      consoleErrors: finalErrors
    };
    
    fs.writeFileSync('contact-form-test-results.json', JSON.stringify(results, null, 2));
    console.log('💾 Detailed results saved to contact-form-test-results.json');
    
    // Check for specific error patterns
    const supabaseRequests = requests.filter(req => 
      req.url.includes('supabase') || 
      req.url.includes('send-contact-email') ||
      req.url.includes('functions/v1')
    );
    
    const supabaseResponses = responses.filter(res => 
      res.url.includes('supabase') || 
      res.url.includes('send-contact-email') ||
      res.url.includes('functions/v1')
    );
    
    console.log('\n🔍 SUPABASE ANALYSIS:');
    console.log('====================');
    console.log('Supabase Requests:', supabaseRequests.length);
    console.log('Supabase Responses:', supabaseResponses.length);
    
    if (supabaseRequests.length === 0) {
      console.log('❌ No Supabase requests detected - form may not be connecting to backend');
    }
    
    supabaseResponses.forEach(res => {
      if (res.status >= 400) {
        console.log(`❌ Error response: ${res.status} ${res.statusText} - ${res.url}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'contact-form-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the test
testContactForm().catch(console.error);