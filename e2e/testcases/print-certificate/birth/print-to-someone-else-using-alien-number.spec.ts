import { expect, test, type Page } from '@playwright/test'
import { CREDENTIALS } from '../../../constants'
import { login } from '../../../helpers'
import { getToken } from '../../../helpers'
import {
  createDeclaration,
  Declaration
} from '../../test-data/birth-declaration'
import {
  selectRequesterType,
  selectCertificationType,
  navigateToCertificatePrintAction,
  printAndExpectPopup
} from './helpers'
import { ensureAssigned, type } from '../../../utils'
import { formatV2ChildName } from '../../birth/helpers'

async function selectIdType(page: Page, idType: string) {
  await page.locator('#collector____OTHER____idType').click()
  await page.getByText(idType, { exact: true }).click()
}

test('Print to someone else using Alien Number as ID type', async ({
  browser
}) => {
  const token = await getToken(
    CREDENTIALS.REGISTRAR.USERNAME,
    CREDENTIALS.REGISTRAR.PASSWORD
  )
  const res = await createDeclaration(token)
  const declaration: Declaration = res.declaration
  const trackingId: string | undefined = res.trackingId
  const page = await browser.newPage()

  await test.step('Log in', async () => {
    await login(page)
  })

  await test.step('Navigate to certificate print action', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await navigateToCertificatePrintAction(page, declaration)
  })

  await test.step('Fill details, including Alien Number', async () => {
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to someone else')

    await selectIdType(page, 'Alien Number')
    await page.fill('#collector____ALIEN-NUMBER____details', '1234567')
    await page.getByRole('heading', { name: 'Birth', exact: true }).click()

    await page.fill('#firstname', 'Muhammed Tareq')
    await page.fill('#surname', 'Aziz')
    await page.fill('#collector____OTHER____relationshipToChild', 'Uncle')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Print', async () => {
    await printAndExpectPopup(page)
  })

  await test.step('Validate Certified -modal', async () => {
    if (!trackingId) {
      throw new Error('Tracking ID is undefined')
    }
    await type(page, '#searchText', trackingId)
    await page.locator('#searchIconButton').click()
    await page
      .getByRole('button', { name: formatV2ChildName(declaration) })
      .click()
    await ensureAssigned(page)
    await page.getByRole('button', { name: 'Audit' }).click()
    await page.getByRole('button', { name: 'Certified', exact: true }).click()

    await expect(page.getByText('Type' + 'Birth Certificate')).toBeVisible()
    await expect(
      page.getByText('Requester' + 'Print and issue to someone else')
    ).toBeVisible()

    await expect(page.getByText('Type of ID' + 'Alien Number')).toBeVisible()
    await expect(page.getByText('Alien Number' + '1234567')).toBeVisible()
    await expect(
      page.getByText("Collector's name" + 'Muhammed Tareq Aziz')
    ).toBeVisible()

    await expect(
      page.getByText('Relationship to child' + 'Uncle')
    ).toBeVisible()

    await expect(page.getByText('Payment details')).toBeVisible()
    await expect(page.getByText('Fee')).toBeVisible()
    await expect(page.getByText('$5.00')).toBeVisible()
  })

  await page.close()
})
