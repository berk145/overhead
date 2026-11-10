import { expect, test } from '@playwright/test'

test.use({ colorScheme: 'dark' })

test('tracks the ISS with live services', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      !/favicon\.ico|webgl context/i.test(message.text())
    ) {
      errors.push(message.text())
    }
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/')
  const live = page.locator('[data-testid="live-indicator"][data-state="live"]')
  const unavailable = page
    .locator('[data-testid="live-indicator"][data-state="stale"], [data-testid="live-indicator"][data-state="error"]')
    .and(page.locator(':visible'))
  const errorState = page.getByTestId('error-state')
  await expect
    .poll(
      async () =>
        (await live.isVisible()) ||
        ((await unavailable.isVisible()) && (await errorState.isVisible())),
      { timeout: 60_000 },
    )
    .toBe(true)
  if (!(await live.isVisible())) {
    expect(errors).toEqual([])
    return
  }

  const visual = page.getByTestId('main-viz')
  await expect(visual).toBeVisible()
  await expect
    .poll(
      async () => (await visual.locator('canvas').boundingBox())?.width ?? 0,
    )
    .toBeGreaterThan(300)
  const globeCanvas = await visual.locator('canvas').elementHandle()
  expect(globeCanvas).not.toBeNull()
  await expect(
    page.getByRole('button', { name: /ISS \(ZARYA\)/ }),
  ).toBeVisible()
  await expect(
    page.getByText('NORAD 25544', { exact: false }).first(),
  ).toBeVisible()
  await expect(page.getByText(/9[0-5]\.\d{2} min/).first()).toBeVisible()

  const passes = page.getByTestId('pass-list').getByRole('option')
  const emptyPasses = page.getByTestId('pass-list-empty')
  await expect
    .poll(
      async () => (await passes.count()) > 0 || (await emptyPasses.isVisible()),
      { timeout: 30_000 },
    )
    .toBe(true)
  if (await passes.count()) {
    await passes.first().click()
    await expect
      .poll(() => page.getByTestId('sky-dome').locator('path').count())
      .toBeGreaterThan(0)
  }

  await page.getByRole('button', { name: '2D track' }).click()
  await expect
    .poll(() => visual.getByTestId('ground-track').locator('path').count())
    .toBeGreaterThanOrEqual(4)
  await expect(visual.getByTestId('ground-track-land')).toBeVisible()
  await page.getByRole('button', { name: '3D globe' }).click()
  await expect(visual.locator('canvas')).toBeVisible()
  expect(
    await visual
      .locator('canvas')
      .evaluate((canvas, original) => canvas === original, globeCanvas),
  ).toBe(true)
  await page.getByRole('button', { name: /Amsterdam, Netherlands/ }).click()
  await page.getByLabel('Search for a city').fill('Oslo')
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /Oslo/ })
    .first()
    .click()
  await expect(page).toHaveURL(/lat=59\.9/)
  await page.getByRole('button', { name: 'Switch to light theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload()
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBe(390)
  expect(errors).toEqual([])
})

test('shows an error when CelesTrak is unavailable', async ({ page }) => {
  await page.route('https://celestrak.org/NORAD/elements/gp.php?*', (route) =>
    route.fulfill({ status: 503, headers: { 'access-control-allow-origin': '*' } }),
  )
  await page.goto('/')
  await expect(
    page.locator('[data-testid="live-indicator"][data-state="error"]'),
  ).toBeVisible({ timeout: 60_000 })
  const errorState = page.getByTestId('error-state')
  await expect(errorState).toBeVisible()
  await expect(errorState).toContainText('CelesTrak data is unavailable')
  await expect(errorState.getByRole('button', { name: 'Retry' })).toBeVisible()
})

for (const colorScheme of ['light', 'dark'] as const) {
  test(`defaults to the ${colorScheme} system theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme })
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme)
  })
}
