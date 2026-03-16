import { test, expect, type Page } from '@playwright/test'
import { login} from '../../helpers'
import { verifyTeamMembers } from '../birth/helpers'
import { CREDENTIALS } from '../../constants'

test.describe.serial('1. Team Page -1', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('1.1 Team Page', async () => {
    test('1.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.REGISTRAR)

      await page.getByRole('button', { name: 'Team' }).click()
      await expect(page.locator('#content-name')).toHaveText(
        'Ibombo District Office'
      )

      await expect(
        page.getByText('Ibombo, Central', {
          exact: true
        })
      ).toBeVisible()
    })

   
    test('1.1.1 Verify Team Members, Roles and their statuses', async () => {
      const team = [
        { name: 'Mitchell Owen', role: 'Provincial Registrar' },
        { name: 'Emmanuel Mayuka', role: 'Administrator' },
        { name: 'Kennedy Mweene', role: 'Registrar' },
        { name: 'Felix Katongo', role: 'Registration Officer' },
        { name: 'Kalusha Bwalya', role: 'Hospital Official' }
      ]

        await verifyTeamMembers(page, team)
    })
  })
})
