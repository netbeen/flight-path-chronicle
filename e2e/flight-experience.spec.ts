import { expect, test } from '@playwright/test';
import { stat } from 'node:fs/promises';

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

test('可以按城市查询多个机场的历史行程', async ({ page }) => {
  await page.getByLabel('城市或机场').fill('北京');
  await expect(page.getByRole('tab', { name: /行程/ })).toHaveAttribute('aria-selected', 'true');

  await expect(page.getByRole('button', { name: /CA1510/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /MU5458/ })).toBeVisible();
  await expect(page.getByText('PEK').first()).toBeVisible();
  await expect(page.getByText('PKX').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /MF8703/ })).toHaveCount(0);
});

test('纪念模式展示全量生涯数据并可导出 PNG', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'PNG 导出仅需在桌面项目验证一次');

  await page.getByLabel('城市或机场').fill('北京');
  await page.getByRole('tab', { name: '概览' }).click();
  await page.getByRole('button', { name: /生成职业飞行纪念图/ }).click();

  await expect(page.getByText('我的职业飞行纪事')).toBeVisible();
  await expect(page.getByText('44', { exact: true })).toBeVisible();
  await expect(page.getByText('111,874')).toBeVisible();
  await expect(page.locator('.career-airport-label')).toHaveCount(30);
  await expect(page.locator('.flight-path-poster')).toHaveCount(44);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载纪念图' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('flight-path-chronicle-2021-2026.png');
  const path = await download.path();
  expect(path).not.toBeNull();
  expect((await stat(path!)).size).toBeGreaterThan(100_000);
});

test('时间轴按真实航班前后导航', async ({ page }) => {
  await page.getByRole('button', { name: '下一段行程' }).click();
  await expect(page.getByText(/1 \/ 44/)).toBeVisible();

  await page.getByRole('button', { name: '下一段行程' }).click();
  await expect(page.getByText(/2 \/ 44/)).toBeVisible();

  await page.getByRole('button', { name: /查看全部/ }).first().click();
  await expect(page.getByText('全部行程')).toBeVisible();
});

test('高频新加坡往返航线保持逐条可见且几何不重叠', async ({ page }) => {
  const outgoing = page.locator('path.route-HGH-SIN');
  const returning = page.locator('path.route-SIN-HGH');

  await expect(outgoing).toHaveCount(7);
  await expect(returning).toHaveCount(8);

  const outgoingPaths = await outgoing.evaluateAll((paths) => paths.map((path) => path.getAttribute('d')));
  const returningPaths = await returning.evaluateAll((paths) => paths.map((path) => path.getAttribute('d')));

  expect(new Set(outgoingPaths).size).toBe(7);
  expect(new Set(returningPaths).size).toBe(8);
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
