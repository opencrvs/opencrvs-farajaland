import { test, type Page, expect } from '@playwright/test'
import { Declaration } from '../../test-data/birth-declaration'
import { login } from '../../../helpers'
import { createDeclaration } from '../../test-data/birth-declaration'
import { CREDENTIALS } from '../../../constants'
import { getToken } from '../../../helpers'
import {
  navigateToCertificatePrintAction,
  selectRequesterType
} from './helpers'
import { selectCertificationType } from './helpers'
import { selectAction } from '../../../utils'
import { formatV2ChildName } from '../../birth/helpers'
test("Validate 'Birth Certificate Certified Copy' PDF details", async ({
  browser
}) => {
  const token = await getToken(
    CREDENTIALS.REGISTRAR.USERNAME,
    CREDENTIALS.REGISTRAR.PASSWORD
  )
  // Create a declaration with a health facility place of birth
  const res = await createDeclaration(
    token,
    undefined,
    undefined,
    'HEALTH_FACILITY'
  )
  const declaration: Declaration = res.declaration
  const page: Page = await browser.newPage()

  await test.step('Log in', async () => {
    await login(page)
  })
  await test.step('Print birth certificate once', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await navigateToCertificatePrintAction(page, declaration)
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Yes, print certificate' }).click()
    await page.getByRole('button', { name: 'Print', exact: true }).click()
  })
  await test.step('Go to review', async () => {
    await page
      .getByRole('textbox', { name: 'Search for a record' })
      .fill(formatV2ChildName(declaration))
    await page.getByRole('button', { name: 'Search' }).click()
    await page
      .getByRole('button', {
        name: formatV2ChildName(declaration),
        exact: true
      })
      .click()
    await selectAction(page, 'Print')
    await selectCertificationType(page, 'Birth Certificate Certified Copy')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })
  await test.step('Validate child place of birth', async () => {
    await expect(page.locator('#print')).toContainText('Klow Village Hospital')
    await expect(page.locator('#print')).toContainText(
      'Ibombo, Central, Farajaland'
    )
  })
  await page.close()
})
test("Validate 'Birth Certificate' PDF details", async ({ browser }) => {
  const token = await getToken(
    CREDENTIALS.REGISTRAR.USERNAME,
    CREDENTIALS.REGISTRAR.PASSWORD
  )
  // Create a declaration
  const res = await createDeclaration(
    token,
    undefined,
    undefined,
    'HEALTH_FACILITY'
  )
  const declaration: Declaration = res.declaration
  const page: Page = await browser.newPage()

  await test.step('Log in', async () => {
    await login(page)
  })
  await test.step('Go to review', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await navigateToCertificatePrintAction(page, declaration)
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })
  await test.step('Validate child place of birth', async () => {
    await expect(page.locator('#print')).toContainText('Klow Village Hospital')
    await expect(page.locator('#print')).toContainText(
      'Ibombo, Central, Farajaland'
    )
  })
  await page.close()
})
