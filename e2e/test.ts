/**
 * Custom Playwright `test` for the intermittent-connectivity experiment
 * (https://github.com/opencrvs/opencrvs-core/issues/12837).
 *
 * Wraps the built-in `page` fixture so every test runs with a background loop
 * that randomly drops the page offline and brings it back online — simulating
 * a flapping connection rather than a consistently slow one.
 *
 * Re-exports the other Playwright surfaces tests use so existing files only
 * need their `@playwright/test` import path swapped.
 *
 * Temporary — do not commit. Once the experiment is done, restore the
 * original `@playwright/test` imports and delete this file.
 */
import { test as base, type Page } from '@playwright/test'
import { mockNetworkConditions } from './mock-network-conditions'

// Tunables. Online windows are several seconds (long enough for most user
// actions to complete) and offline windows are short (long enough to abort
// an in-flight request but not so long that the app gives up entirely).
const ONLINE_MIN_MS = 4_000
const ONLINE_MAX_MS = 10_000
const OFFLINE_MIN_MS = 500
const OFFLINE_MAX_MS = 2_000

function randomBetween(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min))
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function startNetworkChaos(page: Page): () => Promise<void> {
  let stopped = false

  const loop = (async () => {
    while (!stopped) {
      try {
        await sleep(randomBetween(ONLINE_MIN_MS, ONLINE_MAX_MS))
        if (stopped) return
        await mockNetworkConditions(page, 'offline')

        await sleep(randomBetween(OFFLINE_MIN_MS, OFFLINE_MAX_MS))
        if (stopped) return
        await mockNetworkConditions(page, 'default')
      } catch {
        // Page may have closed or navigated — stop quietly so the test result
        // reflects what the test itself did, not chaos plumbing errors.
        return
      }
    }
  })()

  return async () => {
    stopped = true
    await loop
    // Always end online so teardown (trace, screenshot, etc.) can still
    // talk to the page if it's still around.
    try {
      await mockNetworkConditions(page, 'default')
    } catch {
      // ignore
    }
  }
}

export { expect, type Page, type Locator } from '@playwright/test'

export const test = base.extend({
  page: async ({ page }, use) => {
    const stopChaos = startNetworkChaos(page)
    try {
      await use(page)
    } finally {
      await stopChaos()
    }
  }
})
