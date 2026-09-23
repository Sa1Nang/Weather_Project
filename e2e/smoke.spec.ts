import { expect, test } from '@playwright/test'

test('app shell boots with default location', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /manila/i }),
  ).toBeVisible({ timeout: 15000 })
  await expect(
    page.getByRole('navigation', { name: /weather controls/i }),
  ).toBeVisible()
})

test('search → select → display workflow', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /manila/i }),
  ).toBeVisible()

  const search = page.getByRole('combobox')
  await search.fill('Cebu City')
  await expect(page.getByRole('listbox')).toBeVisible()
  await expect(
    page.getByRole('option', { name: /cebu city/i }).first(),
  ).toBeVisible()
  await page.getByRole('option', { name: /cebu city/i }).first().click()

  // Dashboard fetches and displays the selected location's weather.
  await expect(
    page.getByRole('heading', { name: /cebu city/i }),
  ).toBeVisible({ timeout: 15000 })
})

test('forecast sections render with hourly strip and expandable days', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /manila/i }),
  ).toBeVisible()

  await expect(
    page.getByRole('heading', { name: /hourly/i }),
  ).toBeVisible({ timeout: 15000 })
  await expect(
    page.getByRole('region', {
      name: /hourly forecast, scroll vertically/i,
    }),
  ).toBeVisible()

  const sevenDay = page.getByRole('list', { name: /7-day forecast/i })
  await expect(sevenDay).toBeVisible()
  await expect(sevenDay.getByRole('button').first()).toHaveAttribute(
    'aria-expanded',
    'true',
  )

  // Expand the second day and confirm extra details appear.
  const secondDay = sevenDay.getByRole('button').nth(1)
  await secondDay.click()
  await expect(secondDay).toHaveAttribute('aria-expanded', 'true')
})

test('charts render with switchable tabs', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /charts/i }),
  ).toBeVisible({ timeout: 15000 })

  const tablist = page.getByRole('tablist', { name: /weather charts/i })
  await expect(tablist).toBeVisible({ timeout: 15000 })
  await expect(
    page.getByRole('img', { name: /temperature chart/i }),
  ).toBeVisible()

  await page.getByRole('tab', { name: 'Rain' }).click()
  await expect(
    page.getByRole('img', { name: /rain probability/i }),
  ).toBeVisible()

  await page.getByRole('tab', { name: 'Wind' }).click()
  await expect(
    page.getByRole('img', { name: /wind speed chart/i }),
  ).toBeVisible()
})

test('alerts section renders guidance state without official-feed card', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /condition-based guidance/i }),
  ).toBeVisible({ timeout: 15000 })

  // Government-feed card was removed — it only ever rendered a placeholder.
  await expect(
    page.getByRole('heading', { name: /official warnings/i }),
  ).toHaveCount(0)
  await expect(
    page.getByText(/no official alerts available/i),
  ).toHaveCount(0)

  // Derived guidance depends on live conditions — interact only if present.
  const firstGuidance = page
    .getByRole('list', { name: /condition-based guidance/i })
    .getByRole('button')
    .first()
  if ((await firstGuidance.count()) > 0) {
    await expect(firstGuidance).toHaveAttribute('aria-expanded', 'true')
  } else {
    await expect(
      page.getByText(/no weather guidance right now/i),
    ).toBeVisible()
  }
})

test('philippine cities resolve with correct disambiguation', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /manila/i }),
  ).toBeVisible({ timeout: 15000 })

  // "Baguio" has provincial namesakes — the city itself must rank first.
  await page.getByRole('combobox').fill('Baguio')
  await expect(page.getByRole('listbox')).toBeVisible()
  await expect(
    page.getByRole('option', { name: /baguio city/i }).first(),
  ).toBeVisible()
  await page.getByRole('option', { name: /baguio city/i }).first().click()
  await expect(
    page.getByRole('heading', { name: /baguio/i }),
  ).toBeVisible({ timeout: 15000 })

  // "Iloilo" collides with a Papua New Guinea namesake — country labels decide.
  // Wait for the fresh Iloilo results (not stale Baguio options) first.
  await page.getByRole('combobox').fill('Iloilo')
  const iloiloCity = page.getByRole('option', { name: /iloilo city/i })
  await expect(iloiloCity).toBeVisible()
  const iloiloPH = page
    .getByRole('option', { name: /iloilo.*philippines/i })
    .first()
  await expect(iloiloPH).toBeVisible()
  await iloiloPH.click()
  await expect(
    page.getByRole('heading', { name: /iloilo/i }),
  ).toBeVisible({ timeout: 15000 })
})

test('favorite round-trip persists the selected location', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /manila/i }),
  ).toBeVisible({ timeout: 15000 })

  await page
    .getByRole('button', { name: /save manila to favorites/i })
    .click()
  await expect(
    page.getByRole('status').getByText(/manila saved to favorites/i),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: /show weather for manila/i }),
  ).toBeVisible()

  await page.reload()
  await expect(
    page.getByRole('button', { name: /show weather for manila/i }),
  ).toBeVisible({ timeout: 15000 })
})

test('theme, units, and refresh flows', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /manila/i }),
  ).toBeVisible({ timeout: 15000 })

  // Theme: dark toggle flips the document class.
  await page.getByRole('button', { name: /^dark theme/i }).click()
  await expect(page.locator('html.dark')).toBeAttached()

  // Units: switching to Fahrenheit re-renders the hero temperature.
  const hero = page.getByLabel(/current temperature/i)
  await expect(hero).toContainText('°C')
  await page.getByRole('button', { name: /unit settings/i }).click()
  // Units: switching to Fahrenheit re-renders the hero temperature
  // (temperature select is the first of three in the dialog).
  await page.getByRole('dialog').locator('select').first().selectOption('fahrenheit')
  await expect(hero).toContainText('°F')

  // Refresh: fetches again and stamps an updated time
  // (timestamp hidden on small screens — attached is enough).
  await page.getByRole('button', { name: /refresh weather data/i }).click()
  await expect(page.getByText(/updated /i)).toBeAttached({ timeout: 15000 })
})
