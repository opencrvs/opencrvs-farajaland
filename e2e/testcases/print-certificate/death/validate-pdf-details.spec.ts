import { expect, test, type Page } from '@playwright/test'
import { getToken, login } from '../../../helpers'
import { CREDENTIALS } from '../../../constants'
import {
  createDeclaration,
  Declaration
} from '../../test-data/death-declaration'
import {
  navigateToCertificatePrintAction,
  selectCertificationType,
  selectRequesterType
} from './helpers'

async function expectInPdf(page: Page, text: string) {
  await expect(page.locator('#print')).toContainText(text)
}

test("Validate 'Death Certificate' PDF details", async ({ browser }) => {
  const token = await getToken(
    CREDENTIALS.REGISTRAR.USERNAME,
    CREDENTIALS.REGISTRAR.PASSWORD
  )
  const res = await createDeclaration(token)
  const page = await browser.newPage()
  const declaration: Declaration = res.declaration

  await test.step('Log in', async () => {
    await login(page)
  })

  await test.step('Go to review', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await navigateToCertificatePrintAction(page, declaration)
    await selectCertificationType(page, 'Death Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Spouse)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Validate deceased name', async () => {
    await expectInPdf(
      page,
      `${declaration['deceased.name'].firstname} ${declaration['deceased.name'].surname}`
    )
  })

  await test.step('Validate deceased place of death', async () => {
    await expectInPdf(page, 'Ibombo, Central, Farajaland')
  })

  await test.step('Validate registrar name', async () => {
    await expectInPdf(page, 'Kennedy Mweene')
  })

  await page.close()
})

test("Validate 'Death Certificate Certified Copy' PDF details", async ({
  browser
}) => {
  const page = await browser.newPage()
  const token = await getToken(
    CREDENTIALS.REGISTRAR.USERNAME,
    CREDENTIALS.REGISTRAR.PASSWORD
  )
  const res = await createDeclaration(token)
  const declaration: Declaration = res.declaration

  try {
    await test.step('Log in', async () => {
      await login(page)
    })
    await test.step('Go to review', async () => {
      await page.getByRole('button', { name: 'Pending certification' }).click()
      await navigateToCertificatePrintAction(page, declaration)
      await selectCertificationType(page, 'Death Certificate Certified Copy')
      await selectRequesterType(page, 'Print and issue to Informant (Spouse)')
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Verified' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })
    await test.step('Validate deceased name', async () => {
      await expectInPdf(
        page,
        `${declaration['deceased.name'].firstname} ${declaration['deceased.name'].surname}`
      )
    })
    await test.step('Validate deceased place of death', async () => {
      await expectInPdf(page, 'Ibombo, Central, Farajaland')
    })
    await test.step('Validate registrar name', async () => {
      await expectInPdf(page, 'Registrar: Kennedy Mweene')
    })
    await test.step('Validate spouse name', async () => {
      await expectInPdf(
        page,
        `${declaration['deceased.name'].firstname} ${declaration['deceased.name'].surname}`
      )
      await expectInPdf(page, 'Spouse')
    })
  } finally {
    await page.close()
    await page.close()
  }
})
