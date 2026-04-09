import { Locator, Page, expect } from '@playwright/test'
import {
  AUTH_URL,
  CLIENT_URL,
  CREDENTIALS,
  GATEWAY_HOST,
  LOGIN_URL,
  SAFE_INPUT_CHANGE_TIMEOUT_MS,
  SAFE_OUTBOX_TIMEOUT_MS,
  TEST_USER_PASSWORD
} from './constants'
import { format, parseISO } from 'date-fns'
import { random } from 'lodash'
import fetch from 'node-fetch'
import { isMobile } from './mobile-helpers'
import { createClient } from '@opencrvs/toolkit/api'
import { UUID } from 'crypto'

export async function createPIN(page: Page) {
  await page.click('#pin-input')
  for (let i = 1; i <= 8; i++) {
    await page.type('#pin-input', `${i % 2}`)
  }
}

export async function logout(page: Page) {
  if (await page.getByTestId('exit-event').isVisible()) {
    await page.getByTestId('exit-event').click()
  }

  if (isMobile(page)) {
    await page.goto(CLIENT_URL)
    await page.getByRole('button', { name: 'Toggle menu', exact: true }).click()
    await page.getByRole('button', { name: 'Logout', exact: true }).click()
    return
  }

  await page.locator('#ProfileMenu-dropdownMenu').click()
  await page
    .locator('#ProfileMenu-dropdownMenu')
    .getByRole('listitem')
    .filter({
      hasText: new RegExp('Logout')
    })
    .click()
  await page.context().clearCookies()
  await page.waitForURL((url) => url.origin === LOGIN_URL)
}

export async function login(
  page: Page,
  username: (typeof CREDENTIALS)[keyof typeof CREDENTIALS] = CREDENTIALS.REGISTRAR,
  skipPin?: boolean
) {
  const token = await getToken(username)
  expect(token).toBeDefined()
  await page.goto(`${CLIENT_URL}?token=${token}`)

  await page.waitForSelector('#pin-input, #appSpinner', { state: 'visible' })

  if (!skipPin) {
    await createPIN(page)
  }

  await page.goto(CLIENT_URL)

  return token
}

export async function getToken(
  username: string,
  password: string = TEST_USER_PASSWORD
) {
  const authUrl = `${AUTH_URL}/authenticate`
  const verifyUrl = `${AUTH_URL}/verifyCode`

  const authResponse = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  })

  const authBody = await authResponse.json()
  const verifyResponse = await fetch(verifyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nonce: authBody.nonce,
      code: '000000'
    })
  })

  const verifyBody = await verifyResponse.json()

  return verifyBody.token
}

export async function getClientToken(client_id: string, client_secret: string) {
  const authUrl = `${GATEWAY_HOST}/auth/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=client_credentials`

  const authResponse = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const authBody = await authResponse.json()
  const token = authBody.token ?? authBody.access_token

  if (!token) {
    throw new Error('Client token missing from gateway /auth/token response')
  }

  return token
}

type DeclarationSection =
  | 'child'
  | 'informant'
  | 'father'
  | 'mother'
  | 'documents'
  | 'preview'
  | 'groom'
  | 'bride'
  | 'marriageEvent'
  | 'witnessOne'
  | 'witnessTwo'
type CorrectionSection = 'summary'
type V2ReviewSection = 'review'

export const goToSection = async (
  page: Page,
  section: DeclarationSection | CorrectionSection | V2ReviewSection
) => {
  while (!page.url().includes(`/${section}`)) {
    await page.getByRole('button', { name: 'Continue' }).click()
  }
}

/*
  Generates a random past date
  at least 'minAge' years + 'offset' days ago
  and up to an additional 'range' days earlier
*/
export const getRandomDate = (
  minAge: number,
  range: number,
  offset: number = 0
) => {
  const randomDate = new Date()
  randomDate.setDate(
    new Date().getDate() -
      Math.random() * range -
      minAge * 365 -
      (minAge + 3) / 4 -
      offset
  )
  const [yyyy, mm, dd] = randomDate.toISOString().split('T')[0].split('-')
  return { dd, mm, yyyy }
}

export async function ensureLoginPageReady(page: Page) {
  /*
   * Wait until config for loading page has been loaded
   */
  await page.waitForSelector('#Box img', { state: 'attached' })
  await page.waitForFunction(() => {
    // eslint-disable-next-line no-undef
    const img = document.querySelector<HTMLImageElement>('#Box img')!
    return img && img.src && img.src.trim() !== ''
  })
}

export const uploadImage = async (
  page: Page,
  locator: Locator,
  image = './e2e/assets/528KB-random.png'
) => {
  const fileChooserPromise = page.waitForEvent('filechooser')
  await locator.click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(image)
  return fileChooser
}

/**
 * @page - page object
 * @sectionLocator - locator for the section e.g. mother / father
 * @sectionTitle - title of the section to  e.g. National ID / Passport
 * @buttonLocator - locator for the button to upload the image
 */
export const uploadImageToSection = async ({
  page,
  sectionLocator,
  sectionTitle,
  buttonLocator
}: {
  page: Page
  sectionLocator: Locator
  buttonLocator: Locator
  sectionTitle: string
}) => {
  await sectionLocator.getByText('Select...').click()
  await sectionLocator.getByText(sectionTitle, { exact: true }).click()

  await uploadImage(page, buttonLocator)
}

export const getLocationNameFromId = async (id: UUID, token: string) => {
  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)
  const [location] = await client.locations.list.query({
    locationIds: [id]
  })

  return location.name
}
export async function continueUntilReview(
  page: Page,
  label: string = 'Continue'
) {
  //
  // while url doesnt contain review
  while (!page.url().includes('review')) {
    await page.waitForTimeout(SAFE_INPUT_CHANGE_TIMEOUT_MS)
    await page.getByText(label, { exact: true }).click()
  }
}

export async function continueForm(page: Page, label: string = 'Continue') {
  await page.waitForTimeout(SAFE_INPUT_CHANGE_TIMEOUT_MS)
  return page.getByText(label, { exact: true }).click()
}

export async function goBackToReview(page: Page) {
  await page.waitForTimeout(SAFE_INPUT_CHANGE_TIMEOUT_MS)
  await page.getByRole('button', { name: 'Back to review' }).click()
}

export const joinValuesWith = (
  values: (string | number | null | undefined)[],
  separator = ' '
) => {
  return values.filter(Boolean).join(separator)
}

type PersonOrName = {
  firstNames?: string
  familyName?: string
  [key: string]: any
}
export const formatName = (name: PersonOrName) => {
  const nameArray = []
  if (name.firstNames) nameArray.push(name.firstNames)
  if (name.familyName) nameArray.push(name.familyName)
  return joinValuesWith(nameArray)
}

export const drawSignature = async (
  page: Page,
  modalLocator:
    | 'review____signature_canvas_element'
    | 'brideSignature_modal'
    | 'groomSignature_modal'
    | 'witnessOneSignature_modal'
    | 'witnessTwoSignature_modal'
    | 'informantSignature_modal' = 'informantSignature_modal',
  includeCanvas: boolean = true
) => {
  const canvasLocator = includeCanvas
    ? `#${modalLocator} canvas`
    : `#${modalLocator}`

  const canvas = page.locator(canvasLocator)
  const rect = await canvas.boundingBox()

  expect(rect).toBeTruthy()
  if (rect) {
    const center = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    }

    const points = Array(10)
      .fill(null)
      .map(() => ({
        x: random(0.05, 0.95),
        y: random(0.05, 0.95)
      }))

    await page.mouse.move(center.x, center.y)
    await page.mouse.down()
    for (const point of points) {
      await page.mouse.move(
        rect.x + point.x * rect.width,
        rect.y + point.y * rect.height
      )
    }
    await page.mouse.up()
  }
}

/**
  Opens the record audit view of a record with given trackingId or name
 */
export const auditRecord = async ({
  page,
  trackingId,
  name
}: {
  page: Page
  trackingId?: string
  name: string
}) => {
  if (trackingId) {
    await page
      .getByRole('textbox', { name: 'Search for a record' })
      .fill(trackingId)

    await page.getByRole('button', { name: 'Search' }).click()
    await page.getByRole('button', { name, exact: true }).click()
  } else {
    await page.locator('#searchType').getByText('Tracking ID').click()
    await page.locator('li:has(svg) >> text=Name').click()
    await page.getByRole('textbox', { name: 'Search for a name' }).fill(name)
    await page.getByRole('button', { name: 'Search' }).click()
    await page.getByRole('button', { name, exact: true }).click()
  }
}

export const fetchUserLocationHierarchy = async (
  userId: string,
  { headers }: { headers: Record<string, any> }
) => {
  if (!headers.Authorization) {
    throw new Error('Authorization token not found')
  }
  const client = createClient(GATEWAY_HOST + '/events', headers.Authorization)

  const user = await client.user.get.query(userId)
  return await client.locations.getLocationHierarchy.query({
    locationId: user.primaryOfficeId!
  })
}

export async function expectRowValue(
  page: Page,
  fieldName: string,
  assertionText: string
) {
  await expect(page.getByTestId(`row-value-${fieldName}`)).toContainText(
    assertionText,
    { timeout: SAFE_OUTBOX_TIMEOUT_MS }
  )
}

export async function expectRowValueWithChangeButton(
  page: Page,
  fieldName: string,
  assertionText: string
) {
  await expect(page.getByTestId(`row-value-${fieldName}`)).toContainText(
    assertionText
  )

  await expect(page.getByTestId(`change-button-${fieldName}`)).toBeVisible()
}

export async function switchEventTab(page: Page, tab: 'Audit' | 'Record') {
  await page.getByRole('button', { name: tab, exact: true }).click()
}

/** Assert whether a button on the action menu exists and is enabled/disabled */
export async function validateActionMenuButton(
  page: Page,
  action:
    | 'Declare'
    | 'Notify'
    | 'Approve'
    | 'Register'
    | 'Declare with edits'
    | 'Register with edits',
  isEnabled = true
) {
  await page.getByRole('button', { name: 'Action', exact: true }).click()
  const actionButton = page.getByText(action, { exact: true })
  await expect(actionButton).toBeVisible()

  if (isEnabled) {
    await expect(actionButton).not.toHaveAttribute('disabled')
  } else {
    await expect(actionButton).toHaveAttribute('disabled')
  }

  await page.getByRole('button', { name: 'Action', exact: true }).click()
}

export async function selectDeclarationAction(
  page: Page,
  action:
    | 'Notify'
    | 'Declare'
    | 'Validate'
    | 'Register'
    | 'Delete declaration'
    | 'Save & Exit'
    | 'Declare with edits'
    | 'Notify with edits'
    | 'Register with edits',
  confirm = true
) {
  await page.getByRole('button', { name: 'Action', exact: true }).click()
  await page.getByText(action, { exact: true }).click()

  if (confirm) {
    const confirmBtn = page.getByRole('button', { name: 'Confirm' })

    if ((await confirmBtn.count()) > 0) {
      await confirmBtn.click()
    } else {
      await page.getByRole('button', { name: action, exact: true }).click()
    }
  }
}

export async function searchFromSearchBar(
  page: Page,
  searchText: string,
  expectToBeFound: boolean = true
) {
  const searchResultRegex = /Search result for “([^”]+)”/
  await page.locator('#searchText').fill(searchText)
  await page.locator('#searchIconButton').click()
  const searchResult = await page.locator('#content-name').textContent()
  expect(searchResult).toMatch(searchResultRegex)
  if (expectToBeFound) {
    await page.getByRole('button', { name: searchText, exact: true }).click()
  } else {
    await expect(
      page.getByRole('button', { name: searchText, exact: true })
    ).not.toBeVisible()
  }
}

export async function loginWithNewUser(page: Page, username: string) {
  const password = 'Bangladesh23'
  const question00 = 'What city were you born in?'
  const question01 = 'What is your favorite movie?'
  const question02 = 'What is your favorite food?'

  await page.goto(LOGIN_URL)
  await ensureLoginPageReady(page)

  await page.fill('#username', username)
  await page.fill('#password', 'test')
  await page.click('#login-mobile-submit')

  await expect(page.getByText('Welcome to Farajaland CRS')).toBeVisible({
    timeout: 30000
  })

  await page.getByRole('button', { name: 'Start' }).click()

  // set up password
  await page.fill('#NewPassword', password)
  await page.fill('#ConfirmPassword', password)
  await expect(page.getByText('Passwords match')).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()

  // set up security question
  await page.locator('#question-0').click()
  await page.getByText(question00, { exact: true }).click()
  await page.fill('#answer-0', 'Chittagong')

  await page.locator('#question-1').click()
  await page.getByText(question01, { exact: true }).click()
  await page.fill('#answer-1', 'Into the wild')

  await page.locator('#question-2').click()
  await page.getByText(question02, { exact: true }).click()
  await page.fill('#answer-2', 'Burger')

  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(page.getByText('Account setup complete')).toBeVisible()
}

export const formatDateTo_dMMMMyyyy = (date: string) =>
  format(parseISO(date), 'd MMMM yyyy')

/*
  Date() object takes 0-indexed month,
  but month coming to the method is 1-indexed
*/
export const formatDateObjectTo_dMMMMyyyy = ({
  yyyy,
  mm,
  dd
}: {
  yyyy: string
  mm: string
  dd: string
}) => format(new Date(Number(yyyy), Number(mm) - 1, Number(dd)), 'd MMMM yyyy')
