const { test, expect } = require('@playwright/test');
const path = require('path');

const filePath = `file://${path.resolve(__dirname, 'index.html')}`;

test.describe('Portfolio Modernization Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(filePath);
  });

  test('Hero section should have the leadership narrative and gradient text', async ({ page }) => {
    const heroHeadline = page.getByRole('heading', { level: 1 }).first();
    await expect(heroHeadline).toContainText('Leading the evolution of legacy systems');

    const gradientText = page.locator('.text-gradient');
    await expect(gradientText).toBeVisible();
    await expect(gradientText).toHaveText('high-performance ecosystems.');
  });

  test('About section should have 8/4 responsive grid on desktop', async ({ page }) => {
    const aboutText = page.locator('.about-text');
    const aboutImage = page.locator('.about-image');

    const textSpan = await aboutText.evaluate(el => window.getComputedStyle(el).gridColumnStart);
    const imageSpan = await aboutImage.evaluate(el => window.getComputedStyle(el).gridColumnStart);

    expect(textSpan).toContain('span 8');
    expect(imageSpan).toContain('span 4');
  });

  test('Experience section should quantify impact with seniority metrics', async ({ page }) => {
    const stats = page.locator('stats-span');
    await expect(stats).toHaveCount(4);

    const labels = await stats.evaluateAll(list => list.map(el => JSON.parse(el.getAttribute('article')).statsLabel));
    expect(labels).toContain('Years of Experience');
    expect(labels).toContain('Production Releases Led');
    expect(labels).toContain('Production Incidents Solved');
  });

  test('Education section should display STI College details and Awardee badge', async ({ page }) => {
    const educationSection = page.locator('#education');
    await expect(educationSection).toBeVisible();

    const schoolName = educationSection.getByRole('heading', { level: 3 });
    await expect(schoolName).toHaveText('STI College Fairview');

    const award = educationSection.locator('.award-text');
    await expect(award).toContainText('Academic Awardee');
  });

  test('Bento grid should highlight Optimization and Security and is hidden', async ({ page }) => {
    const bentoGrid = page.locator('.bento-grid');
    await expect(bentoGrid).not.toBeVisible();

    const labels = await page.locator('.bento-label').evaluateAll(list => list.map(el => el.textContent));
    expect(labels).toContain('Optimization & Latency');
    expect(labels).toContain('Security & Compliance');
  });

  test('Project section should highlight high-stakes architecture', async ({ page }) => {
    const projects = page.locator('project-article');
    const descriptions = await projects.evaluateAll(list => list.map(el => JSON.parse(el.getAttribute('article')).description));

    expect(descriptions.some(d => d.includes('frontend modernization')) || descriptions.some(d => d.includes('microservices architecture'))).toBeTruthy();
    expect(descriptions.some(d => d.includes('sub-second data processing'))).toBeTruthy();
  });

  test('Critical assets should be preloaded', async ({ page }) => {
    const preloads = page.locator('link[rel="preload"]');
    const hrefs = await preloads.evaluateAll(list => list.map(el => el.getAttribute('href')));

    expect(hrefs).toContain('./styles.css');
    expect(hrefs).toContain('./script.js');
  });
});
