import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { verifyTeamMembers } from '../birth/helpers'

test.describe.serial('4. Team Page -1', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('4.1 Basic UI check', async () => {
    test('4.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.REGISTRAR_GENERAL)
      await page.getByRole('button', { name: 'Team' }).click()
      await expect(page.locator('#content-name')).toHaveText('HQ Office')

      await expect(
        page.getByText('Embe, Pualula', {
          exact: true
        })
      ).toBeVisible()
    })

    const team = [
      { name: 'Joseph Musonda', role: 'Registrar General' },
      { name: 'Edgar Kazembe', role: 'Operations Manager' },
      { name: 'Jonathan Campbell', role: 'National Administrator' }
    ]

    test('4.1.1 Verify Team Members, Roles and their statuses', async () => {
     await verifyTeamMembers(page, team)
    })

    test('4.1.2 Clicking member navigates to profile', async () => {
      await page.getByRole('button', { name: 'Joseph Musonda' }).click()
      await expect(page.locator('#content-name')).toHaveText('Joseph Musonda')
    })
  })
})
