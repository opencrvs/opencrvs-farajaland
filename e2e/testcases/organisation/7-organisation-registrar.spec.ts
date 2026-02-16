import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
test.describe.serial('7. Organisation Page -1', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })
  test.describe.serial('7.1 Basic UI check', async () => {
    test('7.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.REGISTRAR)
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(page.locator('#content-name')).toHaveText('Organisation')
      await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
    })
    test('7.1.1 Verify Province -> District -> Health Facility(No Data)', async () => {
      await page.getByRole('button', { name: /Chuminga/ }).click()
      await page.getByRole('button', { name: /Soka/ }).click()
      const pageNavigator = page.getByRole('button', { name: '2', exact: true })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await expect(
        page.getByRole('button', { name: /Mulunda Health Post/ })
      ).toBeDisabled()
    })
    test('7.1.2 Verify Province -> District -> District Office', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }
      await page.getByRole('button', { name: /Organisation/ }).click()
      await page.getByRole('button', { name: /Pualula/ }).click()
      await page.getByRole('button', { name: /Funabuli/ }).click()
      const pageNavigator = page.getByRole('button', { name: '2', exact: true })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await expect(
        page.getByRole('button', { name: /Funabuli District Office/ })
      ).toBeDisabled()
    })
    test('7.1.3 Verify Province -> District -> Different District Office', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }
      await page.getByRole('button', { name: /Organisation/ }).click()

      await page.getByRole('button', { name: /Sulaka/ }).click()
      await page.getByRole('button', { name: /Ilanga/ }).click()
      const pageNavigator = page.getByRole('button', { name: '2', exact: true })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await expect(
        page.getByRole('button', { name: /Ilanga District Office/ })
      ).toBeDisabled()
    })

    test('7.1.4 Verify team page member list of District Office', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }
      await page.getByRole('button', { name: /Organisation/ }).click()
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Ibombo/ }).click()
      const pageNavigator = page.getByRole('button', { name: '4', exact: true })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()
      await page.getByRole('button', { name: /Ibombo District Office/ }).click()

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
    test('7.1.5 Verify Embassy Office', async () => {
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(
        page.getByRole('button', { name: 'France Embassy Office' })
      ).toBeDisabled()
    })
  })
})
