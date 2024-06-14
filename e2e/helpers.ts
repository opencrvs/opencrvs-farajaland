import { Locator, Page, expect } from '@playwright/test'
import { AUTH_URL, CLIENT_URL, GATEWAY_HOST } from './constants'

export async function login(page: Page, username: string, password: string) {
  const token = await getToken(username, password)
  await page.goto(`${CLIENT_URL}?token=${token}`)
  await expect(page.locator('#appSpinner')).toBeVisible()
}

export async function createPIN(page: Page) {
  await page.click('#pin-input')
  for (let i = 1; i <= 8; i++) {
    await page.type('#pin-input', `${i % 2}`)
  }
}

export async function getToken(username: string, password: string) {
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

export const goToSection = async (
  page: Page,
  section: 'child' | 'informant' | 'father' | 'mother' | 'documents' | 'preview'
) => {
  while (!page.url().includes(section)) {
    await page.getByRole('button', { name: 'Continue' }).click()
  }
}

/*
  Generates a random past date 
  at least 'minAge' years ago 
  and up to an additional 'range' days earlier
*/
export const getRandomDate = (minAge: number, range: number) => {
  const randomDate = new Date()
  randomDate.setDate(
    new Date().getDate() -
      Math.random() * range -
      minAge * 365 -
      (minAge + 3) / 4
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
    const img = document.querySelector<HTMLImageElement>('#Box img')!
    return img && img.src && img.src.trim() !== ''
  })
}

export async function validateSectionButtons(page: Page) {
  await expect(page.getByText('Continue', { exact: true })).toBeVisible()
  await expect(page.getByText('Exit', { exact: true })).toBeVisible()
  await expect(page.getByText('Save & Exit', { exact: true })).toBeVisible()
  await expect(page.locator('#eventToggleMenuToggleButton')).toBeVisible()
}

export const uploadImage = async (
  page: Page,
  locator: Locator,
  image = './e2e/assets/528KB-random.png'
) => {
  const fileChooserPromise = page.waitForEvent('filechooser')
  locator.click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(image)
}

export const getLocationNameFromFhirId = async (fhirId: string) => {
  const res = await fetch(`${GATEWAY_HOST}/location/${fhirId}`)
  const location = (await res.json()) as fhir.Location
  return location.name
}
