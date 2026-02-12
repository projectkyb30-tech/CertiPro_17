import { test, expect } from '@playwright/test';

test.describe('Purchase Flow with Mocked Stripe', () => {

  let userEmail: string;

  test.beforeEach(async ({ page }) => {
    // 1. Setup New User
    const randomId = Math.floor(Math.random() * 1000000);
    userEmail = `buyer_${randomId}@certipro.com`;
    
    await page.goto('/auth');
    await page.click('button:has-text("Înregistrare")');
    await page.fill('input[type="email"]', userEmail);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Handle onboarding if necessary
    if (page.url().includes('onboarding')) {
        await page.click('button:has-text("Continuă")');
        await page.click('button:has-text("Start")');
    }
    
    await expect(page).toHaveURL('/home');
  });

  test('Should initiate purchase and redirect to success page (Mocked)', async ({ page }) => {
    
    // 2. Intercept and Mock the Billing API Call
    // When the frontend asks for a checkout session, we return a URL to our local success page
    await page.route('**/api/create-checkout-session', async route => {
      console.log('Intercepted checkout session request');
      const json = { url: 'http://localhost:5174/success?session_id=mock_session_123' };
      await route.fulfill({ json });
    });

    // 3. Navigate to a Course
    await page.goto('/courses');
    const courseCard = page.locator('a[href^="/course/"]').first();
    await courseCard.click();

    // 4. Click "Unlock" / "Buy"
    const buyButton = page.locator('button:has-text("Deblocare"), button:has-text("Cumpără")');
    await expect(buyButton).toBeVisible();
    await buyButton.click();

    // 5. Verify Checkout Page
    await expect(page).toHaveURL(/\/checkout\//);
    await expect(page.getByText('Sumar Comandă')).toBeVisible();

    // 6. Confirm Purchase (Click Pay)
    const payButton = page.locator('button:has-text("Plătește"), button:has-text("Pay")');
    await payButton.click();

    // 7. Verify Redirect to Success Page
    // Since we mocked the URL to be /success, the app should go there
    await expect(page).toHaveURL(/\/success/);
    
    // 8. Verify Success Page Content
    await expect(page.getByText('Plată Reușită!')).toBeVisible();
    // Verify link back to courses or dashboard
    await expect(page.locator('a[href="/"], button:has-text("Înapoi")').first()).toBeVisible();
  });

});
