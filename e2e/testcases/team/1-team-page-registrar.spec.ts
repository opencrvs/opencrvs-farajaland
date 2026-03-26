import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'

test('1. Team Page -1', async ({ browser }) => {
  const page: Page = await browser.newPage()

  await test.step('1.1 Team Page', async () => {
    await test.step('1.1.0 Verify UI', async () => {
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

    const team = [
      { name: 'Felix Katongo', role: 'Registration Officer' },
      { name: 'Kennedy Mweene', role: 'Registrar' }
    ]

    await test.step('1.1.1 Verify Team Members, Roles and their statuses', async () => {
      const rows = page.locator('#user_list tr:has(td)')

      await expect(rows).toHaveCount(team.length)

      for (let i = 0; i < team.length; i++) {
        const cells = rows.nth(i).locator('td')
        await expect(cells.nth(1)).toHaveText(team[i].name)
        await expect(cells.nth(2)).toHaveText(team[i].role)
        await expect(cells.nth(3)).toHaveText('Active')
      }
    })
  })

  await page.close()
})
