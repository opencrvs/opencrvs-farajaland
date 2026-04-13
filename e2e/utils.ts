import { Locator, Page, expect } from '@playwright/test'
import {
  CLIENT_URL,
  SAFE_IN_EXTERNAL_VALIDATION_MS,
  SAFE_INPUT_CHANGE_TIMEOUT_MS,
  SAFE_OUTBOX_TIMEOUT_MS
} from './constants'
import { isMobile } from './mobile-helpers'

type Workqueue =
  | 'Outbox'
  | 'Drafts'
  | 'Assigned to you'
  | 'Recent'
  | 'Notifications'
  | 'Potential duplicate'
  | 'Pending updates'
  | 'Pending approval'
  | 'Escalated'
  | 'Pending registration'
  | 'Pending external validation'
  | 'Pending certification'
  | 'Pending issuance'
  | 'Pending corrections'
  | 'Team'
  | 'Organisation'

export async function navigateToWorkqueue(page: Page, workqueue: Workqueue) {
  if (isMobile(page)) {
    await page.goto(CLIENT_URL)
    await page.getByRole('button', { name: 'Toggle menu', exact: true }).click()
  }

  await page.getByRole('button', { name: workqueue }).click()
}

export async function selectAction(
  page: Page,
  action:
    | 'Print'
    | 'Declare'
    | 'Validate'
    | 'Review'
    | 'Register'
    | 'Assign'
    | 'Unassign'
    | 'Delete'
    | 'Correct'
    | 'Archive'
    | 'Reject'
    | 'Review correction request'
    | 'Approve'
    | 'Edit'
    | 'Escalate'
    | 'Registrar general feedback'
    | 'Provincial registrar feedback'
    | 'Revoke registration'
    | 'Reinstate registration'
    | 'Update'
    | 'Issue certified copy'
) {
  await page.getByRole('button', { name: 'Action', exact: true }).click()

  if (isMobile(page)) {
    await page.locator('#page-title').getByText(action, { exact: true }).click()
    return
  }

  await page
    .locator('#action-Dropdown-Content')
    .getByText(action, { exact: true })
    .click()
}

const usernameToFullNameMap = {
  'k.cwalya': 'Kalusha Cwalya',
  'g.phiri': 'Gift Phiri',
  'f.katongo': 'Felix Katongo',
  'm.simbaya': 'Mapalo Simbaya',
  'v.katongo': 'Velix Katongo',
  'k.mweene': 'Kennedy Mweene',
  'v.mweene': 'Venedy Mweene',
  'm.owen': 'Mitchel Owen',
  'c.lungu': 'Chipo Lungu',
  'n.siame': 'Njavwa Siame',
  'j.campbell': 'Jonathan Campbell',
  'e.mayuka': 'Emmanuel Mayuka',
  'm.musonda': 'Mutale Musonda',
  't.mwila': 'Toukira Mwila'
} as const
/**
 *
 * Ensures that the record is assigned to the user and it is reflected in the event summary.
 * @param username name of the user record is assigned. Used for assertion after assignment. Checking absence of something will burn the whole timeout in CI.
 */
export async function ensureAssignedToUser(
  page: Page,
  username: keyof typeof usernameToFullNameMap
) {
  const userFullName = usernameToFullNameMap[username]

  const assignedTo = page.getByTestId('assignedTo-value').locator('span')

  if (await assignedTo.filter({ hasText: userFullName }).isVisible()) {
    return
  }

  await page.getByRole('button', { name: 'Action', exact: true }).click()

  const assignAction = page
    .locator('#action-Dropdown-Content li')
    .filter({ hasText: new RegExp(`^Assign$`, 'i') })
    .first()

  await assignAction.waitFor({ state: 'visible' })

  await assignAction.click()
  // Wait for the assign modal to appear
  await page.getByRole('button', { name: 'Assign', exact: true }).click()

  await expect(
    page.getByTestId('assignedTo-value').locator('span')
  ).toContainText(userFullName, { timeout: SAFE_OUTBOX_TIMEOUT_MS })
}

export async function expectInUrl(page: Page, assertionString: string) {
  await expect(page.url().includes(assertionString)).toBeTruthy()
}

/**
 * Checks if user has pending item visible in outbox sidebar.
 * @deprecated This will make every test flaky. Outbox is user dependent. When running tests in parallel, there will be interference between tests and they will fail.
 *
 * Consider using `await page.waitForResponse((response) => response.url() === 'https://example.com' && response.status() === 200)` if you cannot find another UI element to wait for.
 */
export async function ensureOutboxIsEmpty(page: Page) {
  await page.waitForTimeout(SAFE_INPUT_CHANGE_TIMEOUT_MS)

  await expect(page.locator('#navigation_workqueue_outbox')).toHaveText(
    'Outbox',
    {
      timeout: SAFE_OUTBOX_TIMEOUT_MS
    }
  )
}

/**
 * Checks if user has pending item visible in external validation sidebar.
 * @deprecated This will make every test flaky. External validation is user dependent. When running tests in parallel, there will be interference between tests and they will fail.
 *
 * Consider using `await page.waitForResponse((response) => response.url() === 'https://example.com' && response.status() === 200)` if you cannot find another UI element to wait for.
 */
export async function ensureInExternalValidationIsEmpty(page: Page) {
  await page.waitForTimeout(SAFE_INPUT_CHANGE_TIMEOUT_MS)

  await expect(
    page.locator('#navigation_workqueue_in-external-validation')
  ).toHaveText('Pending external validation', {
    timeout: SAFE_IN_EXTERNAL_VALIDATION_MS
  })
}

export async function type(page: Page, locator: string, text: string) {
  await page.locator(locator).fill(text)
  await page.locator(locator).blur()
}

export const assertTexts = async ({
  root,
  texts,
  locator,
  testId
}: {
  root: Page | Locator
  texts: string[]
  locator?: string
  testId?: string
}) => {
  for (const text of texts) {
    if (locator) {
      await expect(root.locator(locator).getByText(text)).toBeVisible()
    } else if (testId) {
      await expect(root.getByTestId(testId).getByText(text)).toBeVisible()
    } else {
      await expect(root.getByText(text)).toBeVisible()
    }
  }
}
