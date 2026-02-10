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
      const row1 = page.getByRole('row', { name: /Mitchell Owen/ })
      await expect(row1.getByText('Active')).toBeVisible()
      const button1 = row1.getByRole('button', { name: 'Mitchell Owen' })
      await button1.click()
      await expect(page.locator('#content-name')).toHaveText('Mitchell Owen')
      await page.getByRole('button', { name: 'Ibombo District Office' }).click()
      await expect(page).toHaveURL(/.*\/team/)

      const row2 = page.getByRole('row', { name: /Emmanuel Mayuka/ })
      await expect(row2.getByText('Active')).toBeVisible()
      const button2 = row2.getByRole('button', { name: 'Emmanuel Mayuka' })
      await button2.click()
      await expect(page.locator('#content-name')).toHaveText('Emmanuel Mayuka')
      await page.getByRole('button', { name: 'Ibombo District Office' }).click()
      await expect(page).toHaveURL(/.*\/team/)

      const row3 = page.getByRole('row', { name: /Kennedy Mweene/ })
      await expect(row3.getByText('Active')).toBeVisible()
      const button3 = row3.getByRole('button', { name: 'Kennedy Mweene' })
      await button3.click()
      await expect(page.locator('#content-name')).toHaveText('Kennedy Mweene')
      await page.getByRole('button', { name: 'Ibombo District Office' }).click()
      await expect(page).toHaveURL(/.*\/team/)

      const row4 = page.getByRole('row', { name: /Felix Katongo/ })
      await expect(row4.getByText('Active')).toBeVisible()
      await row4.getByRole('button', { name: 'Felix Katongo' }).click()
      await expect(page.locator('#content-name')).toHaveText('Felix Katongo')
      await page.getByRole('button', { name: 'Ibombo District Office' }).click()
      await expect(page).toHaveURL(/.*\/team/)

      const row5 = page.getByRole('row', { name: /Kalusha Bwalya/ })
      await expect(row5.getByText('Active')).toBeVisible()
      await row5.getByRole('button', { name: 'Kalusha Bwalya' }).click()
      await expect(page.locator('#content-name')).toHaveText('Kalusha Bwalya')
      await page.getByRole('button', { name: 'Ibombo District Office' }).click()
      await expect(page).toHaveURL(/.*\/team/)
    })
  })
})
