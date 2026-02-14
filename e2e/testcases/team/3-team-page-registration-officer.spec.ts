import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'

test.describe.serial('3. Team Page -1', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('3.1 Basic UI check', async () => {
    test('3.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
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

    test('3.1.1 Verify Team Members, Roles and their statuses', async () => {
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

  // @TODO:
  // test.describe('2.2 User Account Actions', () => {
  //   test('2.2.1 Edit User Details', async () => {
  //     await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
  //     await page.getByRole('button', { name: 'Team' }).click()
  //     await page.locator('//nav[@id="user-item-0-menu-dropdownMenu"]').click()
  //     await page
  //       .locator('//ul[@id="user-item-0-menu-Dropdown-Content"]')
  //       .getByText('Edit details')
  //       .click()

  //     await expect(page.getByText('Confirm details')).toBeVisible()
  //     await expect(
  //       page
  //         .getByTestId('list-view-label')
  //         .filter({ hasText: 'Registration Office' })
  //     ).toBeVisible()
  //   })

  //   test('2.2.2 Change Phone Number', async () => {
  //     await page.locator('#btn_change_phoneNumber:visible').click()
  //     await page.locator('input[name="phoneNumber"]').fill('0785963214')
  //     await page.getByRole('button', { name: 'Continue' }).click()
  //     await page.getByRole('button', { name: 'Continue' }).click()
  //     await page.getByRole('button', { name: 'Confirm' }).click()
  //   })

  //   test('2.2.3 Verify Phone Number Changed', async () => {
  //     await page.locator('//nav[@id="user-item-0-menu-dropdownMenu"]').click()
  //     await page
  //       .locator('//ul[@id="user-item-0-menu-Dropdown-Content"]')
  //       .getByText('Edit details')
  //       .click()
  //     await expect(
  //       page
  //         .locator('div')
  //         .filter({ hasText: /^Phone number0785963214$/ })
  //         .locator('#value_3')
  //     ).toBeVisible()
  //   })
  // })
})
