import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'

test('4. Team Page -1', async ({ browser }) => {
  const page: Page = await browser.newPage()

  await test.step('4.1 Basic UI check', async () => {
    await test.step('4.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.REGISTRAR_GENERAL)

      await page.getByRole('button', { name: 'Team' }).click()

      await expect(page.locator('#content-name')).toHaveText('HQ Office')
    })

    const team = [
      { name: 'Chipo Lungu', role: 'Registrar General' },
      { name: 'Jonathan Campbell', role: 'National Administrator' },
      { name: 'Mutale Musonda', role: 'Operations Manager' }
    ]

    await test.step('4.1.1 Verify Team Members, Roles and their statuses', async () => {
      const rows = page.locator('#user_list tr:has(td)')

      await expect(rows).toHaveCount(team.length)

      for (let i = 0; i < team.length; i++) {
        const cells = rows.nth(i).locator('td')
        await expect(cells.nth(1)).toHaveText(team[i].name)
        await expect(cells.nth(2)).toHaveText(team[i].role)
        await expect(cells.nth(3)).toHaveText('Active')
      }
    })

    await test.step('4.1.2 Clicking member navigates to profile', async () => {
      await page.getByRole('button', { name: 'Chipo Lungu' }).click()

      await expect(page.locator('#content-name')).toHaveText('Chipo Lungu')
    })
  })

  await page.close()
})
