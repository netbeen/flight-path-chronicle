import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '飞行纪事' })).toBeVisible();
  await expect(page.locator('.leaflet-container')).toBeVisible();
});

test('热门目的地只在点击后打开详情', async ({ page }) => {
  const destination = page.getByRole('button', { name: /杭州萧山/ }).first();

  await destination.hover();
  await expect(page.getByRole('dialog', { name: '行程详情' })).toHaveCount(0);

  await destination.click();
  await expect(page.getByRole('dialog', { name: '行程详情' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '杭州萧山' })).toBeVisible();
});

test('可以浏览并选择完整历史行程', async ({ page }) => {
  await page.getByRole('tab', { name: /行程/ }).click();
  await expect(page.getByRole('tab', { name: /行程 44/ })).toHaveAttribute('aria-selected', 'true');

  const newestFlight = page.getByRole('button', { name: /CA1723/ }).first();
  await expect(newestFlight).toBeVisible();
  await newestFlight.click();

  await expect(page.getByRole('dialog', { name: '行程详情' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'CA1723' })).toBeVisible();
  await expect(newestFlight).toHaveAttribute('aria-pressed', 'true');
});

test('时间轴按真实航班前后导航', async ({ page }) => {
  await page.getByRole('button', { name: '下一段行程' }).click();
  await expect(page.getByText(/1 \/ 44/)).toBeVisible();

  await page.getByRole('button', { name: '下一段行程' }).click();
  await expect(page.getByText(/2 \/ 44/)).toBeVisible();

  await page.getByRole('button', { name: /查看全部/ }).first().click();
  await expect(page.getByText('全部行程')).toBeVisible();
});

test('主要浮层在当前视口内且互不覆盖', async ({ page }) => {
  const panel = page.locator('.flight-panel');
  const timeline = page.locator('.timeline-shell');
  const panelBox = await panel.boundingBox();
  const timelineBox = await timeline.boundingBox();
  const viewport = page.viewportSize();

  expect(panelBox).not.toBeNull();
  expect(timelineBox).not.toBeNull();
  expect(viewport).not.toBeNull();

  expect(panelBox!.x).toBeGreaterThanOrEqual(0);
  expect(panelBox!.y).toBeGreaterThanOrEqual(0);
  expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(viewport!.width);
  expect(timelineBox!.y + timelineBox!.height).toBeLessThanOrEqual(viewport!.height);
  expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(timelineBox!.y);
});
