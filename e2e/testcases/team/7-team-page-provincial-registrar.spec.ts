import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { verifyMembersClickable } from '../birth/helpers'
import { verifyTeamMembers } from '../birth/helpers'

test.describe.serial('7. Team Page -1', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('7.1 Basic UI check', async () => {
    test('7.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.PROVINCIAL_REGISTRAR)
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

    const team = [
      { name: 'Mitchell Owen', role: 'Provincial Registrar' },
      { name: 'Emmanuel Mayuka', role: 'Administrator' },
      { name: 'Kennedy Mweene', role: 'Registrar' },
      { name: 'Felix Katongo', role: 'Registration Officer' },
      { name: 'Kalusha Bwalya', role: 'Hospital Official' }
    ]

    test('7.1.1 Verify Team Members, Roles and their statuses', async () => {
       await verifyTeamMembers(page, team)
    })

    test('7.1.2 Verify team page member list', async () => {
      const members = [
        'Mitchell Owen',
        'Emmanuel Mayuka',
        'Kennedy Mweene',
        'Felix Katongo',
        'Kalusha Bwalya'
      ]

      await verifyMembersClickable(page, members, 'Ibombo District Office')
    })
  })
})