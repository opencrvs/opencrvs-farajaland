import { Page, expect } from '@playwright/test'
import {
  SAFE_INPUT_CHANGE_TIMEOUT_MS,
  SAFE_OUTBOX_TIMEOUT_MS
} from './constants'

export async function selectAction(
  page: Page,
  action:
    | 'Print certificate'
    | 'Declare'
    | 'Validate'
    | 'Register'
    | 'Assign'
    | 'Unassign'
    | 'Delete'
) {
  if ((await page.getByTestId('status-value').innerText()) !== 'Draft') {
    await ensureAssigned(page)
  }

  // Keep retrying the click until the dropdown is visible
  let isVisible = false
  let attempts = 0
  const maxAttempts = 10

  while (!isVisible && attempts < maxAttempts) {
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    isVisible = await page
      .locator('#action-Dropdown-Content')
      .getByText(action, { exact: true })
      .isVisible()

    if (!isVisible) {
      // Small wait before retrying
      await page.waitForTimeout(500)
      attempts++
    }
  }

  await page
    .locator('#action-Dropdown-Content')
    .getByText(action, { exact: true })
    .click()
}

export async function ensureAssigned(page: Page) {
  await page.waitForTimeout(SAFE_INPUT_CHANGE_TIMEOUT_MS)

  await page.getByRole('button', { name: 'Action' }).click()

  const unAssignAction = page
    .locator('#action-Dropdown-Content li')
    .filter({ hasText: new RegExp(`^Unassign$`, 'i') })
    .first()

  let assignAction = page
    .locator('#action-Dropdown-Content li')
    .filter({ hasText: new RegExp(`^Assign$`, 'i') })
    .first()

  // Wait until either "Unassign" or "Assign" is visible
  await Promise.race([
    unAssignAction.waitFor({ state: 'visible' }),
    assignAction.waitFor({ state: 'visible' })
  ])

  if (await unAssignAction.isVisible()) {
    await unAssignAction.click()
    await ensureOutboxIsEmpty(page)
    await expect(page.getByTestId('assignedTo-value')).toHaveText(
      'Not assigned'
    )
    await page.getByRole('button', { name: 'Action' }).click()

    assignAction = page
      .locator('#action-Dropdown-Content li')
      .filter({ hasText: new RegExp(`^Assign$`, 'i') })
      .first()
  }

  if (await assignAction.isVisible()) {
    await assignAction.click()
    await ensureOutboxIsEmpty(page)
  }

  await expect(page.getByTestId('assignedTo-value')).not.toHaveText(
    'Not assigned'
  )
}

export async function expectInUrl(page: Page, assertionString: string) {
  await expect(page.url().includes(assertionString)).toBeTruthy()
}

export async function ensureOutboxIsEmpty(page: Page) {
  await page.waitForTimeout(SAFE_INPUT_CHANGE_TIMEOUT_MS)

  await expect(page.locator('#navigation_workqueue_outbox')).not.toContainText(
    '1',
    {
      timeout: SAFE_OUTBOX_TIMEOUT_MS
    }
  )
}
