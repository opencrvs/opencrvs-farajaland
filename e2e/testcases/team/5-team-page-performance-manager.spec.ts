import { test, expect } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'

test('5. Team Page -1', async ({ browser }) => {
  const page = await browser.newPage()

  await test.step('5.1 Basic UI check', async () => {
    await test.step('5.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.PERFORMANCE_MANAGER)

      await page.getByRole('button', { name: 'Team' }).click()

      await expect(page.locator('#content-name')).toHaveText('HQ Office')
    })

    const team = [
      { name: 'Chipo Lungu', role: 'Registrar General', disabled: true },
      {
        name: 'Jonathan Campbell',
        role: 'National Administrator',
        disabled: true
      },
      { name: 'Mutale Musonda', role: 'Operations Manager', disabled: true }
    ]

    await test.step('5.1.1 Verify Team Members, Roles and their statuses', async () => {
      const rows = page.locator('#user_list tr:has(td)')

      await expect(rows).toHaveCount(team.length)

      for (let i = 0; i < team.length; i++) {
        const cells = rows.nth(i).locator('td')
        await expect(cells.nth(1)).toHaveText(team[i].name)
        await expect(cells.nth(2)).toHaveText(team[i].role)
        await expect(cells.nth(3)).toHaveText('Active')

        if (team[i].disabled) {
          await expect(
            rows.nth(i).getByRole('button', { name: team[i].name })
          ).toBeDisabled()
        }
      }
    })

    await test.step('5.2.2 Verify for different locations', async () => {
      await page.getByRole('button', { name: /HQ Office/ }).click()

      await page.getByTestId('locationSearchInput').fill('Il')

      await page.getByText(/Ilanga District Office/).click()

      await expect(page.locator('#content-name')).toHaveText(
        'Ilanga District Office'
      )
      await expect(
        page.getByText('Ilanga, Sulaka', {
          exact: true
        })
      ).toBeVisible()
    })
  })

  await page.close()
})
