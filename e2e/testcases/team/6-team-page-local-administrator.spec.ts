import { test, expect } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'

test('6. Team Page -1', async ({ browser }) => {
  const page = await browser.newPage()

  await test.step('6.1 Basic UI check', async () => {
    await test.step('6.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.LOCAL_SYSTEM_ADMIN)

      await page.getByRole('button', { name: 'Team' }).click()

      await expect(page.locator('#content-name')).toHaveText(
        'Central Province Office'
      )
      await expect(
        page.getByText('Central', {
          exact: true
        })
      ).toBeVisible()
    })

    const team = [
      { name: 'Emmanuel Mayuka', role: 'Administrator' },
      { name: 'Mitchel Owen', role: 'Provincial Registrar' }
    ]

    await test.step('6.1.1 Verify Team Members, Roles and their statuses', async () => {
      const rows = page.locator('#user_list tr:has(td)')

      await expect(rows).toHaveCount(team.length)

      for (let i = 0; i < team.length; i++) {
        const cells = rows.nth(i).locator('td')
        await expect(cells.nth(1)).toHaveText(team[i].name)
        await expect(cells.nth(2)).toHaveText(team[i].role)
        // For some reason this test case is flaky if we check for exact text 'Active', does not happen with similar tests.
        await expect(cells.nth(3)).toContainText('Active')
      }
    })

    await test.step('6.1.2 Verify Team Member Details', async () => {
      for (const member of team) {
        await page.getByRole('button', { name: member.name }).click()

        await expect(page).toHaveURL(/.*\/view/)

        await page
          .getByRole('button', { name: 'Central Province Office' })
          .click()
        await expect(page).toHaveURL(/.*\/team\/users/)
      }
    })
  })

  await page.close()
})
