import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// Automated accessibility scan: zero critical or serious violations
// on the fully loaded dashboard (both viewports via projects).
test('dashboard has no critical accessibility violations', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /manila/i }),
  ).toBeVisible({ timeout: 15000 })
  // Let lazy sections (charts) settle so their DOM is scanned too.
  await expect(
    page.getByRole('tablist', { name: /weather charts/i }),
  ).toBeVisible({ timeout: 15000 })

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  const blocking = results.violations.filter((v) =>
    ['critical', 'serious'].includes(v.impact ?? ''),
  )
  expect(
    blocking,
    blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`).join('\n'),
  ).toEqual([])
})
