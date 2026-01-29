import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import { ensureLoginPageReady, continueForm, login } from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS, LOGIN_URL } from '../../constants'
import { getUserByRole } from '@countryconfig/data-generator/users'
import _, { has, nth, slice } from 'lodash'
import { isPageHeaderFieldType } from '@opencrvs/toolkit/events'
import { type } from '../../utils'
import exp from 'constants'

test.describe.serial('2. Team Page -1', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('2.1 Basic UI check', async () => {
    test('2.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.REGISTRAR_GENERAL)
      await page.getByRole('button', { name: 'Team' }).click()
      await expect(page.locator('#content-name')).toHaveText('HQ Office')
      await expect(
        page.locator('.LocationInfoValue-sc-1ou3q8c-5.cCnjTR')
      ).toHaveText('Embe, Pualula')
    })
    test('2.1.1 Verify Team Members Status', async () => {
      const row1 = page.getByRole('row', { name: /Jay Douglas/ })
      await expect(row1.getByText('Active')).toBeVisible()
      const button1 = row1.getByRole('button', { name: 'Jay Douglas' })
      await button1.click()
      await expect(page.locator('#content-name')).toHaveText('Jay Douglas')
      await page.getByRole('button', { name: 'HQ Office' }).click()
      await expect(page).toHaveURL(/.*\/team/)

      const row2 = page.getByRole('row', { name: /Joseph Musonda/ })
      await expect(row2.getByText('Active')).toBeVisible()
      const button2 = row2.getByRole('button', { name: 'Joseph Musonda' })
      await button2.click()
      await expect(page.locator('#content-name')).toHaveText('Joseph Musonda')
      await page.getByRole('button', { name: 'HQ Office' }).click()
      await expect(page).toHaveURL(/.*\/team/)

      const row3 = page.getByRole('row', { name: /Edgar Kazembe/ })
      await expect(row3.getByText('Active')).toBeVisible()
      const button3 = row3.getByRole('button', { name: 'Edgar Kazembe' })
      await button3.click()
      await expect(page.locator('#content-name')).toHaveText('Edgar Kazembe')
      await page.getByRole('button', { name: 'HQ Office' }).click()
      await expect(page).toHaveURL(/.*\/team/)

      const row4 = page.getByRole('row', { name: /Jonathan Campbell/ })
      await expect(row4.getByText('Active')).toBeVisible()
      await row4.getByRole('button', { name: 'Jonathan Campbell' }).click()
      await expect(page.locator('#content-name')).toHaveText(
        'Jonathan Campbell'
      )
      await page.getByRole('button', { name: 'HQ Office' }).click()
      await expect(page).toHaveURL(/.*\/team/)
      await page.close()
    })
  })
})
