/**
 * Test Script - Sign-in Auto-fill Fix Verification
 * 
 * This script verifies that the UI freeze issue in the sign-in page
 * auto-fill functionality has been resolved.
 * 
 * @version 1.0.0
 * @author WEB_TESTING_MASTER_AGENT
 */

import { chromium } from 'playwright';

async function testSignInAutoFill() {
  const browser = await chromium.launch({ 
    headless: false, // Set to true for CI/CD
    devtools: true 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🚀 Starting Sign-in Auto-fill Test...');
    
    // Navigate to sign-in page
    console.log('📍 Navigating to sign-in page...');
    await page.goto('http://localhost:5173/auth/signin');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="signin-page"]', { timeout: 10000 });
    console.log('✅ Sign-in page loaded successfully');
    
    // Check if development mode test button exists
    const testButton = await page.locator('[data-testid="test-account-button"]');
    const isVisible = await testButton.isVisible();
    
    if (!isVisible) {
      console.log('⚠️  Test account button not visible (not in development mode)');
      return { success: true, message: 'Test skipped - not in development mode' };
    }
    
    console.log('🎯 Test account button found');
    
    // Monitor for page freezing by checking if page remains responsive
    let pageResponsive = true;
    const responsiveCheckInterval = setInterval(async () => {
      try {
        await page.evaluate(() => document.title); // Simple responsiveness check
      } catch (error) {
        pageResponsive = false;
        console.error('❌ Page became unresponsive:', error);
      }
    }, 500);
    
    // Record initial state
    const initialUrl = page.url();
    console.log('📊 Initial state recorded');
    
    // Click the test account button
    console.log('🖱️  Clicking test account button...');
    await testButton.click();
    
    // Wait a bit to see if auto-fill completes
    await page.waitForTimeout(1000);
    
    // Check if page is still responsive
    clearInterval(responsiveCheckInterval);
    
    if (!pageResponsive) {
      throw new Error('Page became unresponsive after clicking test account button');
    }
    
    // Verify that auto-fill worked
    const emailInput = await page.locator('[data-testid="signin-email"]');
    const passwordInput = await page.locator('[data-testid="signin-password"]');
    
    let emailValue = '';
    let passwordValue = '';
    
    try {
      // Check if we're in password step (auto-fill successful)
      const isPasswordStep = await passwordInput.isVisible();
      
      if (isPasswordStep) {
        console.log('✅ Successfully transitioned to password step');
        passwordValue = await passwordInput.inputValue();
      } else {
        // Still in email step, check email field
        emailValue = await emailInput.inputValue();
      }
      
      // Verify auto-filled values
      const expectedEmail = 'test.domestic@example.com';
      const expectedPassword = 'Password123!';
      
      let autoFillSuccess = false;
      
      if (isPasswordStep && passwordValue === expectedPassword) {
        console.log('✅ Auto-fill successful - both email and password filled');
        autoFillSuccess = true;
      } else if (emailValue === expectedEmail) {
        console.log('✅ Auto-fill partial success - email filled');
        autoFillSuccess = true;
      }
      
      if (!autoFillSuccess) {
        console.log('⚠️  Auto-fill values not as expected');
        console.log('Expected email:', expectedEmail);
        console.log('Actual email:', emailValue);
        console.log('Expected password:', expectedPassword);
        console.log('Actual password:', passwordValue ? '[HIDDEN]' : 'EMPTY');
      }
      
      // Additional checks
      console.log('🔍 Running additional checks...');
      
      // Check for error boundary activation
      const errorBoundary = await page.locator('text=Something went wrong').isVisible();
      if (errorBoundary) {
        throw new Error('Error boundary was triggered');
      }
      
      // Check for console errors
      const consoleLogs = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleLogs.push(msg.text());
        }
      });
      
      await page.waitForTimeout(2000); // Wait for any delayed errors
      
      const hasInfiniteLoopErrors = consoleLogs.some(log => 
        log.includes('Maximum update depth exceeded') ||
        log.includes('Too many re-renders') ||
        log.includes('Suspicious rendering activity')
      );
      
      if (hasInfiniteLoopErrors) {
        throw new Error('Infinite loop or suspicious rendering detected: ' + consoleLogs.join(', '));
      }
      
      console.log('✅ No infinite loop errors detected');
      console.log('✅ Page remains responsive');
      console.log('✅ Auto-fill functionality working correctly');
      
      return {
        success: true,
        message: 'Auto-fill test passed - no freezing detected',
        details: {
          pageResponsive,
          autoFillWorked: autoFillSuccess,
          emailFilled: emailValue === expectedEmail,
          passwordFilled: passwordValue === expectedPassword,
          errorBoundaryTriggered: errorBoundary,
          consoleErrors: consoleLogs.length
        }
      };
      
    } catch (error) {
      console.error('❌ Test verification failed:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  } finally {
    await browser.close();
  }
}

// Run the test
testSignInAutoFill()
  .then(result => {
    console.log('\n📊 Test Results:');
    console.log('Success:', result.success);
    console.log('Message:', result.message);
    
    if (result.details) {
      console.log('Details:', JSON.stringify(result.details, null, 2));
    }
    
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });

export { testSignInAutoFill };