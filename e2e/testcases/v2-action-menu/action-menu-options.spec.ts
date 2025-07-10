import { expect, test, type Page } from '@playwright/test'

import { loginToV2, getToken } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import {
  createDeclaration,
  Declaration
} from '../v2-test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'

async function getActionMenuOptions(page: Page, declaration: Declaration) {
  const childName = `${declaration['child.name'].firstname} ${declaration['child.name'].surname}`
  await page.getByRole('button', { name: childName }).click()
  await page.getByRole('button', { name: 'Action', exact: true }).click()
  const options = await page.locator('#action-Dropdown-Content li').all()
  const textContents = await Promise.all(
    options.map((option) => option.textContent())
  )
  return textContents
}

test.describe('Action menu options', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterEach(async () => {
    await page.close()
  })

  test.describe('Event status: DECLARED', async () => {
    let declaration: Declaration

    test.beforeAll(async () => {
      const token = await getToken(
        CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
        CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
      )
      const res = await createDeclaration(token, {}, ActionType.DECLARE)
      declaration = res.declaration
    })

    test('Registration Agent', async () => {
      await loginToV2(page, CREDENTIALS.REGISTRATION_AGENT)
      await page.getByRole('button', { name: 'Ready for review' }).click()
      const options = await getActionMenuOptions(page, declaration)
      expect(options).toStrictEqual(['Assign', 'View record', 'Validate'])
    })

    test('Local Registrar', async () => {
      await loginToV2(page, CREDENTIALS.LOCAL_REGISTRAR)
      await page.getByRole('button', { name: 'Ready for review' }).click()
      const options = await getActionMenuOptions(page, declaration)
      expect(options).toStrictEqual(['Assign', 'View record', 'Validate'])
    })
  })

  test.describe('Event status: VALIDATED', async () => {
    let declaration: Declaration

    test.beforeAll(async () => {
      const token = await getToken(
        CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
        CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
      )
      const res = await createDeclaration(token, {}, ActionType.VALIDATE)
      declaration = res.declaration
    })

    test('Local Registrar', async () => {
      await loginToV2(page, CREDENTIALS.LOCAL_REGISTRAR)
      await page.getByRole('button', { name: 'Ready for review' }).click()
      const options = await getActionMenuOptions(page, declaration)
      expect(options).toStrictEqual(['Unassign', 'View record', 'Register'])
    })
  })

  test.describe('Event status: REGISTERED', async () => {
    let declaration: Declaration

    test.beforeAll(async () => {
      const token = await getToken(
        CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
        CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
      )
      const res = await createDeclaration(token, {})
      declaration = res.declaration
    })

    test('Local Registrar', async () => {
      await loginToV2(page, CREDENTIALS.LOCAL_REGISTRAR)
      await page.getByRole('button', { name: 'Ready to print' }).click()
      const options = await getActionMenuOptions(page, declaration)
      expect(options).toStrictEqual([
        'Assign',
        'View record',
        'Print certificate',
        'Correct record'
      ])
    })
  })
})
