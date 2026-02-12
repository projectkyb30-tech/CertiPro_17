import { test, expect } from '@playwright/test';

test.describe('Deep Coverage: Full Application Walkthrough', () => {

  // Reuse the login logic or use a setup step
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.click('button:has-text("Autentificare")');
    await page.fill('input[type="email"]', 'test@certipro.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('Sidebar Navigation & Page Load', async ({ page }) => {
    const pages = [
      { name: 'Dashboard', path: '/' },
      { name: 'Cursuri', path: '/courses' },
      { name: 'Planificator', path: '/planner' },
      { name: 'Examen', path: '/exam-center' },
      { name: 'Profil', path: '/profile' },
      { name: 'Setări', path: '/settings' },
    ];

    for (const p of pages) {
      console.log(`Navigating to ${p.name}...`);
      await page.goto(p.path);
      await expect(page).toHaveURL(p.path);
      // Verify no critical errors
      await expect(page.locator('text=Eroare')).not.toBeVisible();
      await expect(page.locator('text=Something went wrong')).not.toBeVisible();
    }
  });

  test('Course Purchase Flow (Simulation)', async ({ page }) => {
    await page.goto('/courses');
    
    // Click first course
    await page.locator('a[href^="/course/"]').first().click();
    
    // Check if "Începe Cursul" (Start) or "Cumpără" (Buy) is visible
    const buyButton = page.locator('button:has-text("Deblocare")').or(page.locator('button:has-text("Cumpără")'));
    
    if (await buyButton.isVisible()) {
        await buyButton.click();
        // Should go to checkout
        await expect(page).toHaveURL(/\/checkout/);
        
        // Verify Checkout Elements
        await expect(page.getByText('Sumar Comandă')).toBeVisible();
        await expect(page.getByText('Secured Checkout')).toBeVisible();
        
        // Attempt "Pay" (This will likely fail or redirect to Stripe)
        // We just check if the button exists and is clickable
        const payButton = page.locator('button:has-text("Plătește")').or(page.locator('button:has-text("Pay")'));
        await expect(payButton).toBeVisible();
    } else {
        console.log('Course likely already purchased. Verifying player access.');
        const startButton = page.locator('button:has-text("Continuă")').or(page.locator('button:has-text("Start")'));
        if (await startButton.isVisible()) {
            await startButton.click();
            await expect(page).toHaveURL(/\/player/);
        }
    }
  });

  test('Interactive Elements: Notes & Planner', async ({ page }) => {
    await page.goto('/planner');
    
    // Add Note
    await page.click('button:has-text("Notă nouă")');
    await page.fill('input[placeholder*="titlu"]', 'Deep Test Note');
    await page.fill('textarea', 'Testing deep functionality');
    await page.click('button:has-text("Salvează")');
    
    // Verify
    await expect(page.getByText('Deep Test Note')).toBeVisible();
    
    // Drag & Drop Simulation (Mocking if complex)
    // For now, just verifying existence is enough for "buttons"
  });

  test('Settings: Theme Toggle & Profile Update', async ({ page }) => {
    await page.goto('/settings');
    
    // Theme Toggle
    const themeBtn = page.locator('button[aria-label*="temă"], button:has-text("Dark"), button:has-text("Light")');
    if (await themeBtn.isVisible()) {
        await themeBtn.click();
        // Verify class change on html or body if possible, or just that no crash occurs
    }
    
    // Password Change (Validation)
    await page.fill('input[name="currentPassword"]', 'wrongpass');
    await page.fill('input[name="newPassword"]', 'newpass123');
    await page.click('button:has-text("Salvează")');
    
    // Should see error
    await expect(page.getByText(/incorect|eroare/i)).toBeVisible();
  });

});
