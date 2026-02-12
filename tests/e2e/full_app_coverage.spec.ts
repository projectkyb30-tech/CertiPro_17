import { test, expect } from '@playwright/test';

test.describe('Full Application User Flow Coverage', () => {
  
  test('Complete User Journey: Login -> Profile -> Planner -> Courses -> Exam -> Logout', async ({ page }) => {
    // 1. Login Phase
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'test@certipro.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Verify Dashboard access
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Cursuri')).toBeVisible();

    // 2. Profile Management
    console.log('Testing Profile Management...');
    await page.click('a[href="/profile"]'); // Assuming sidebar link
    await expect(page).toHaveURL('/profile');
    
    // Edit Bio (or similar field if available)
    // Note: Adjust selectors based on actual Profile implementation
    const bioInput = page.locator('textarea[name="bio"]').or(page.locator('textarea'));
    if (await bioInput.count() > 0) {
      await bioInput.fill('Test User Bio Updated by Robot');
      await page.getByRole('button', { name: /salveaza|save/i }).click();
      // Verify toast or success message if possible
    }

    // 3. Planner & Notes System
    console.log('Testing Planner System...');
    await page.goto('/planner'); // Direct nav or click
    await expect(page.getByText('Planificator')).toBeVisible();
    
    // Create a new note
    const testNoteTitle = `Test Note ${Date.now()}`;
    await page.getByRole('button', { name: /notă nouă|new note/i }).click();
    await page.fill('input[placeholder*="titlu"]', testNoteTitle);
    await page.fill('textarea', 'This is a test note content.');
    await page.getByRole('button', { name: /salveaza|save/i }).click();
    
    // Verify note creation
    await expect(page.getByText(testNoteTitle)).toBeVisible();
    
    // Delete the note to clean up
    await page.getByText(testNoteTitle).click();
    await page.getByRole('button', { name: /șterge|delete/i }).click();
    // Confirm delete if modal exists
    const confirmDelete = page.getByRole('button', { name: /confirm/i });
    if (await confirmDelete.isVisible()) {
      await confirmDelete.click();
    }
    await expect(page.getByText(testNoteTitle)).not.toBeVisible();

    // 4. Course Browsing & Interaction
    console.log('Testing Course Browsing...');
    await page.goto('/courses');
    await expect(page.getByText('Toate Cursurile')).toBeVisible();
    
    // Search functionality
    const searchInput = page.getByPlaceholder(/caută|search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Python');
      await page.keyboard.press('Enter');
      // Wait for results
      await page.waitForTimeout(1000); 
    }

    // Click on first course
    const firstCourse = page.locator('a[href^="/course/"]').first();
    if (await firstCourse.isVisible()) {
      await firstCourse.click();
      // Should be on course detail or player
      await expect(page).toHaveURL(/\/course\//);
    }

    // 5. Exam Center Access
    console.log('Testing Exam Center...');
    await page.goto('/exam-center');
    await expect(page.getByText(/Examen|Evaluare/i)).toBeVisible();

    // 6. Settings & Logout
    console.log('Testing Settings & Logout...');
    await page.goto('/settings');
    await expect(page.getByText(/Setări/i)).toBeVisible();
    
    // Toggle a setting if possible (e.g. theme)
    // await page.click('button[aria-label="Toggle Theme"]'); 

    // Logout
    await page.click('button:has-text("Deconectare")');
    
    // Verify Redirect to Auth
    await expect(page).toHaveURL('/auth');
  });

});
