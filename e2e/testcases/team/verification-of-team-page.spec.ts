import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
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
        page.locator('.LocationInfoValue-sc-1ou3q8c-5.cCnjTR')
      ).toHaveText('Ibombo, Central')
    })

    test('1.1.1 Verify Team Members List', async () => {
      const teamMembers = page.locator('//button[@id="profile-link"]')
      const assignedOffice = page.locator('//button[@id="office-link"]')

      await expect(teamMembers).toHaveCount(5)
      await expect(teamMembers.nth(0)).toHaveText('Mitchell Owen')
      await teamMembers.nth(0).click()
      await expect(page.getByText('Mitchell Owen')).toBeVisible()
      await assignedOffice.nth(0).click()
      await expect(page.locator('#content-name')).toHaveText(
        'Ibombo District Office'
      )

      await expect(teamMembers.nth(1)).toHaveText('Emmanuel Mayuka')
      await teamMembers.nth(1).click()
      await expect(page.getByText('Emmanuel Mayuka')).toBeVisible()
      await page.goBack()

      await expect(teamMembers.nth(2)).toHaveText('Kennedy Mweene')
      await teamMembers.nth(2).click()
      // await page.waitForTimeout(6000);
      await expect(page.locator('#content-name')).toHaveText('Kennedy Mweene')
      // await expect(page.getByText('Kennedy Mweene')).toBeVisible()
      await page.goBack()

      await expect(teamMembers.nth(3)).toHaveText('Felix Katongo')
      await teamMembers.nth(3).click()
      await expect(page.getByText('Felix Katongo')).toBeVisible()
      await page.goBack()

      await expect(teamMembers.nth(4)).toHaveText('Kalusha Bwalya')
      await teamMembers.nth(4).click()
      await expect(page.getByText('Kalusha Bwalya')).toBeVisible()
      await page.goBack()
    })
    test('1.1.2 Verify Team Member role varification', async () => {
      await expect(
        page.getByRole('cell', { name: 'Provincial Registrar' })
      ).toHaveText('Provincial Registrar')
      await expect(
        page.getByRole('cell', { name: 'Administrator' })
      ).toHaveText('Administrator')
      await expect(
        page.getByRole('cell', { name: 'Local Registrar' })
      ).toHaveText('Local Registrar')
      await expect(
        page.getByRole('cell', { name: 'Registration Officer' })
      ).toHaveText('Registration Officer')
      await expect(
        page.getByRole('cell', { name: 'Hospital Clerk' })
      ).toHaveText('Hospital Clerk')
    })
    test('1.1.3 Verify Team Member Status', async () => {
      await expect(page.locator('//span[@type="active"]').nth(0)).toBeVisible()
      await expect(page.locator('//span[@type="active"]').nth(1)).toBeVisible()
      await expect(page.locator('//span[@type="active"]').nth(2)).toBeVisible()
      await expect(page.locator('//span[@type="active"]').nth(3)).toBeVisible()
      await expect(page.locator('//span[@type="active"]').nth(4)).toBeVisible()
    })
  })
})
