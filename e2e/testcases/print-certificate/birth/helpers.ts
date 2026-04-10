import { Page, expect } from '@playwright/test'
import { Declaration } from '../../test-data/birth-declaration'
import { ensureAssigned, selectAction } from '../../../utils'
import { formatName } from '../../../helpers'
import { formatV2ChildName } from '../../birth/helpers'
import { CREDENTIALS } from '../../../constants'

export async function selectCertificationType(page: Page, type: string) {
  await page.locator('#certificateTemplateId svg').click()
  await page
    .locator('.react-select__menu')
    .getByText(type, { exact: true })
    .click()
}

export async function selectRequesterType(page: Page, type: string) {
  await page.locator('#collector____requesterId').click()
  await page.getByText(type, { exact: true }).click()
}

export async function navigateToCertificatePrintAction(
  page: Page,
  declaration: {
    'child.name': {
      firstname: string
      surname: string
    }
    [key: string]: any
  },
  username: (typeof CREDENTIALS)[keyof typeof CREDENTIALS]
) {
  const childName = formatV2ChildName(declaration)
  await page.getByRole('button', { name: childName }).click()

  await ensureAssigned(page, username)
  await selectAction(page, 'Print')
}

export function getRowByTitle(page: Page, title: string) {
  const button = page.getByRole('button', {
    name: title
  })
  const parentRow = button.locator(
    'xpath=ancestor::*[starts-with(@id, "row_")]'
  )
  return parentRow
}

export async function printAndExpectPopup(page: Page) {
  await page.getByRole('button', { name: 'Yes, print certificate' }).click()
  const popupPromise = page.waitForEvent('popup')
  await page.getByRole('button', { name: 'Print', exact: true }).click()
  const popup = await popupPromise
  const downloadPromise = popup.waitForEvent('download')
  const download = await downloadPromise

  // Check that the popup URL contains PDF content
  await expect(popup.url()).toBe('about:blank')
  await expect(download.suggestedFilename()).toMatch(/^.*\.pdf$/)
}
