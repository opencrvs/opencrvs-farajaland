/**
 * Custom Playwright `test` for the intermittent-connectivity experiment
 * (https://github.com/opencrvs/opencrvs-core/issues/12837).
 *
 * Wraps the built-in `page` fixture so every test runs under CDP-throttled
 * cellular2G conditions. Re-exports the other Playwright surfaces tests use
 * so existing files only need their `@playwright/test` import path swapped.
 *
 * Temporary — do not commit. Once the experiment is done, restore the
 * original `@playwright/test` imports and delete this file.
 */
import { test as base } from '@playwright/test'
import { mockNetworkConditions } from './mock-network-conditions'

const THROTTLED_CONDITION = 'cellular2G' as const

export { expect, type Page, type Locator } from '@playwright/test'

export const test = base.extend({
  page: async ({ page }, use) => {
    await mockNetworkConditions(page, THROTTLED_CONDITION)
    await use(page)
  }
})
