import { expect, test, type Page } from '@playwright/test'
import { CREDENTIALS } from '../../../constants'
import { getToken, loginToV2 } from '../../../helpers'
import {
  createDeclaration,
  CreateDeclarationResponse
} from './data/birth-declaration'
import { selectAction } from '../../../v2-utils'

test.describe.serial('3.0 Validate "Certify record" page', () => {
  let declaration: CreateDeclarationResponse
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    declaration = await createDeclaration(token)
    page = await browser.newPage()
    await loginToV2(page)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('3.1 should navigate to Verify their identity page', async () => {
    const childName = `${declaration.declaration['child.firstname']} ${declaration.declaration['child.surname']}`
    await page.getByRole('button', { name: childName }).click()
    await selectAction(page, 'Assign')
    await selectAction(page, 'Print Certificate')

    await expect(
      page
        .url()
        .includes(`/print-certificate/${declaration.eventId}/pages/collector`)
    ).toBeTruthy()

    await page.locator('#certificateTemplateId svg').click()
    await page.getByText('Birth Certificate').nth(1).click()

    await page.locator('#collector____requesterId div').nth(4).click()
    await page
      .getByText('Print and issue to informant', { exact: true })
      .click()

    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page
        .url()
        .includes(
          `/print-certificate/${declaration.eventId}/pages/collector.identity.verify`
        )
    ).toBeTruthy()
  })

  test('3.2 should see informant Id, names, nationality and dob', async () => {
    await expect(
      page
        .url()
        .includes(
          `/print-certificate/${declaration.eventId}/pages/collector.identity.verify`
        )
    ).toBeTruthy()

    await expect(page.locator('#content-name')).toContainText(
      'Verify their identity'
    )

    await expect(page.getByText('Verify their identity')).toBeVisible()

    await expect(page.locator('#maincontent')).toContainText(
      declaration.declaration['mother.nid']
    )
    await expect(page.locator('#maincontent')).toContainText(
      declaration.declaration['mother.firstname']
    )
    await expect(page.locator('#maincontent')).toContainText(
      declaration.declaration['mother.surname']
    )

    await expect(
      page.getByRole('button', { name: 'Identity does not match' })
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Verified' })).toBeVisible()
  })

  test('3.3 should navigate to collect payment page on "Verified" button click', async () => {
    await page.getByRole('button', { name: 'Verified' }).click()

    await expect(page.locator('#content-name')).toContainText('Collect Payment')

    await expect(page.locator('#maincontent')).toContainText('Service')
    await expect(page.locator('#maincontent')).toContainText(
      'Birth registration before 30 days of date of birth'
    )
    await expect(page.locator('#maincontent')).toContainText('Fee')
    await expect(page.locator('#maincontent')).toContainText('$5.00')

    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()
    await page.getByRole('button', { name: 'Back' }).click()
  })

  test('3.4 should open warning modal on "Identity does not match" button click', async () => {
    await page.getByRole('button', { name: 'Identity does not match' }).click()
    await expect(page.getByRole('dialog')).toContainText(
      'Print without proof of ID?'
    )
    await expect(page.getByRole('dialog')).toContainText(
      'Please be aware that if you proceed, you will be responsible for issuing a certificate without the necessary proof of ID from the collector'
    )
  })

  test('3.5 click warning modal confirm button should take to payment page', async () => {
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page.locator('#content-name')).toContainText('Collect Payment')
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()

    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(
      page
        .url()
        .includes(
          `/print-certificate/${declaration.eventId}/review?templateId=v2.birth-certificate`
        )
    ).toBeTruthy()
    await page.goBack()
    await page.getByRole('button', { name: 'Back' }).click()
  })

  test('3.6 click warning modal cancel button should close the modal', async () => {
    await page.getByRole('button', { name: 'Identity does not match' }).click()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(
      page
        .url()
        .includes(
          `/print-certificate/${declaration.eventId}/pages/collector.identity.verify`
        )
    ).toBeTruthy()
  })
})
