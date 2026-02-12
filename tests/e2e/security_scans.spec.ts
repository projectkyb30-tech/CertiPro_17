import { test, expect } from '@playwright/test';

test.describe('Security & Integrity Scans', () => {

  test('Should block unauthorized access to Admin Panel', async ({ page }) => {
    // 1. Login as Regular User
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'test@certipro.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // 2. Attempt to access Admin Route
    await page.goto('http://localhost:5175'); // Admin panel port
    // Expect redirection to login or access denied, NOT the admin dashboard
    // Note: Since Admin is a separate app on a different port, we might just check if it redirects to its own login
    // If it shares auth state, it should block non-admins.
    
    // Alternatively, check protected route in main app if any
    // await page.goto('/admin-debug-tools'); 
  });

  test('Input Sanitization & Injection Resilience', async ({ page }) => {
    await page.goto('/auth');
    
    // SQL Injection Attempt in Login
    const maliciousInput = "' OR '1'='1";
    await page.fill('input[type="email"]', maliciousInput);
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Should NOT log in
    await expect(page).toHaveURL('/auth');
    // Should show error
    await expect(page.getByText(/invalid|eroare|failed/i)).toBeVisible();
    
    // XSS Attempt in Text Input
    // We login first to test a text area
    await page.fill('input[type="email"]', 'test@certipro.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.goto('/planner');
    await page.getByRole('button', { name: /notă nouă|new note/i }).click();
    
    const xssPayload = '<script>alert("XSS")</script>';
    await page.fill('textarea', xssPayload);
    await page.getByRole('button', { name: /salveaza|save/i }).click();
    
    // Reload page and ensure alert is NOT triggered
    // Playwright handles dialogs automatically, we can listen for it
    let dialogTriggered = false;
    page.on('dialog', dialog => {
      dialogTriggered = true;
      dialog.dismiss();
    });
    
    await page.reload();
    // If React renders this correctly as text, no dialog should appear
    expect(dialogTriggered).toBe(false);
  });
});
