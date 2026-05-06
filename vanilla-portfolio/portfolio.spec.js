const { test, expect } = require('@playwright/test');
const path = require('path');

const filePath = `file://${path.resolve(__dirname, 'index.html')}`;

test.describe('Portfolio Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(filePath);
  });

  test('should have the correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Jommel Saligumba | Fullstack Developer/);
    await page.screenshot({ path: 'vanilla-portfolio/screenshots/title.png' });
  });

  test('should show the main headline', async ({ page }) => {
    const headline = page.locator('h1.hero-headline').first();
    await expect(headline).toBeVisible();
    await expect(headline).toContainText('Leading the evolution');
    await page.screenshot({ path: 'vanilla-portfolio/screenshots/headline.png' });
  });

  test('should have working navigation links', async ({ page }) => {
    const navLinks = page.locator('.nav-list a');
    await expect(navLinks).toHaveCount(7);

    const introLink = page.locator('.nav-list a[href="#intro"]');
    await expect(introLink).toBeVisible();

    const contactLink = page.locator('.nav-list a[href="#contact"]');
    await expect(contactLink).toBeVisible();
    await page.screenshot({ path: 'vanilla-portfolio/screenshots/navigation.png' });
  });

  test('should render custom elements', async ({ page }) => {
    // Check if stats-span elements are present
    const statsSpans = page.locator('stats-span');
    await expect(statsSpans).toHaveCount(4);

    // Check if project-article elements are present
    const projectArticles = page.locator('project-article');
    await expect(projectArticles).toHaveCount(4);

    // Check if experience-article elements are present
    const experienceArticles = page.locator('experience-article');
    await expect(experienceArticles).toHaveCount(4);
    await page.screenshot({ path: 'vanilla-portfolio/screenshots/custom-elements.png', fullPage: true });
  });

  test('should have a working contact email link', async ({ page }) => {
    const contactBtn = page.locator('a[href^="mailto:"]');
    await expect(contactBtn).toBeVisible();
    await expect(contactBtn).toHaveAttribute('href', 'mailto:jommelsaligumba@gmail.com');
  });

  test('should have the current year in the footer', async ({ page }) => {
    const currentYear = new Date().getFullYear().toString();
    const footer = page.locator('#app-footer p');
    await expect(footer).toContainText(currentYear);
    await footer.scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'vanilla-portfolio/screenshots/footer.png' });
  });

  test.describe('Feature Toggles', () => {
    test('should hide chat UI when toggled via URL', async ({ page }) => {
      await page.goto(`${filePath}?feature:chat=false`);
      const pill = page.locator('#chat-pill');
      await expect(pill).toBeHidden();
    });

    test('should hide MDB project when toggled via URL', async ({ page }) => {
      await page.goto(`${filePath}?feature:mdbProject=false`);
      const mdb = page.locator('[data-feature="mdbProject"]');
      await expect(mdb).toBeHidden();

      // Check visible projects
      const visibleProjects = page.locator('project-article:visible');
      await expect(visibleProjects).toHaveCount(3);
    });
  });
});
