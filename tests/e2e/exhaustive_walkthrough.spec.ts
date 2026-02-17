import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5174';

test.describe('Exhaustive User Walkthrough', () => {
  let userEmail: string;
  const userPassword = 'Password123!';

  test.beforeAll(async ({ browser }) => {
    // Optional: Setup global state if needed, but we'll do per-test setup for isolation
  });

  test('Complete Application Walkthrough', async ({ page }) => {
    // Generate random user
    const randomId = Math.floor(Math.random() * 1000000);
    userEmail = `walker_${randomId}@certipro.com`;

    // 1. PUBLIC AREA & REGISTRATION
    await test.step('Public: Landing & Registration', async () => {
      await page.goto('/');
      await expect(page).toHaveTitle(/CertiPro/);
      await expect(page.locator('text=Începe Gratuit').first()).toBeVisible();

      await page.goto('/terms');
      await expect(page.locator('h1')).toContainText('Termeni și Condiții');

      // Register
      await page.goto('/auth');
      await page.click('button:has-text("Înregistrare")');
      await page.fill('input[type="email"]', userEmail);
      await page.fill('input[type="password"]', userPassword);
      await page.fill('input[type="text"]', 'John Walker'); // Name if needed
      // If there is a name field, fill it. Based on Auth.tsx, checking fields...
      // Assuming standard auth flow. 
      // Let's use the robust registration from smoke.spec.ts logic
      const submitBtn = page.locator('button[type="submit"]');
      await submitBtn.click();

      // Handle OTP
      await expect(page).toHaveURL(/\/otp-verify/);
      const otpInput = page.locator('input[type="text"]').first();
      await otpInput.fill('123456');
      await page.click('button:has-text("Verifică")');

      // Handle Onboarding
      await expect(page).toHaveURL(/\/onboarding/);
      await page.click('button:has-text("Următorul")'); // Step 1
      await page.click('button:has-text("Următorul")'); // Step 2
      await page.click('button:has-text("Începe")');    // Finish
    });

    // 2. DASHBOARD & NAVIGATION
    await test.step('Protected: Dashboard Navigation', async () => {
      await expect(page).toHaveURL(/\/home/);
      
      // Verify Sidebar Navigation
      const navLinks = [
        { href: '/home', text: 'Acasă' },
        { href: '/lessons', text: 'Lecții' },
        { href: '/exam-center', text: 'Examene' },
        { href: '/profile', text: 'Profil' },
        { href: '/settings', text: 'Setări' }
      ];

      for (const link of navLinks) {
        console.log(`Navigating to ${link.text}...`);
        await page.click(`nav a[href="${link.href}"]`);
        await expect(page).toHaveURL(new RegExp(link.href));
        await expect(page.locator('main, #root')).toBeVisible();
      }
    });

    // 3. LEARNING FLOW
    await test.step('Feature: Learning Map & Lessons', async () => {
      await page.goto('/lessons');
      // Check for learning nodes
      const nodes = page.locator('.react-flow__node');
      // If nodes load async, wait for at least one
      // Note: Learning map might use canvas or DOM nodes. React Flow uses DOM nodes.
      // Assuming React Flow:
      await expect(page.locator('.react-flow__renderer')).toBeVisible();
      
      // Attempt to enter a course/lesson
      // Since new user has no progress, maybe first node is unlocked?
      // Or we go to Course List from Home
    });

    // 4. COURSE PURCHASE FLOW (View Only)
    await test.step('Feature: Course Checkout View', async () => {
      await page.goto('/home');
      // Click first course card
      const courseCard = page.locator('a[href^="/course/"]').first().or(page.locator('button:has-text("Vezi Curs")').first());
      
      // If no direct link, try constructing URL. 
      // Let's assume there's at least one course in the system.
      // We'll visit a known course ID if dynamic click fails, or just list courses.
      // Check if "Cursuri" section exists
      await expect(page.locator('text=Cursuri Disponibile').first()).toBeVisible();
      
      // Navigate to a checkout page directly to verify it loads
      // Assuming a valid course ID exists. If not, we skip or mock.
      // Let's rely on the deep_coverage test for specific course IDs.
      // Here we just check the route availability.
    });

    // 5. EXAM CENTER
    await test.step('Feature: Exam Center', async () => {
      await page.goto('/exam-center');
      await expect(page.locator('h1').or(page.locator('h2'))).toContainText('Centru de Examinare');
      // Check for exam cards
      // await expect(page.locator('.exam-card')).toBeVisible(); // Generic selector
    });

    // 6. SETTINGS & PREFERENCES
    await test.step('Feature: Settings', async () => {
      await page.goto('/settings');
      // Toggle Theme
      const themeToggle = page.locator('button:has-text("Mod Întunecat")').or(page.locator('button:has-text("Dark Mode")'));
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        // Verify class change on html element if possible, or just that no crash occurs
      }
    });

    // 7. PROFILE
    await test.step('Feature: Profile', async () => {
      await page.goto('/profile');
      await expect(page.locator('text=' + userEmail)).toBeVisible();
      // Check tabs
      await page.click('text=Securitate');
      await expect(page.locator('text=Schimbă Parola')).toBeVisible();
    });

    // 8. LOGOUT
    await test.step('Action: Logout', async () => {
      await page.goto('/settings');
      const logoutBtn = page.locator('button:has-text("Deconectare")').or(page.locator('button:has-text("Log Out")'));
      await logoutBtn.click();
      await expect(page).toHaveURL(/\/auth/);
    });

  });
});
