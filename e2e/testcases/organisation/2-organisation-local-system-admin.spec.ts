import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
test.describe.serial('2. Organisation Page', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  //User: Local System Admin(e.mayuka)
  //Scope: Ibombo, Central,Farajaland

  test.describe.serial('2.1 UI check', async () => {
    test('2.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.LOCAL_SYSTEM_ADMIN)
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(page.locator('#content-name')).toHaveText('Organisation')
      await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
    })
    test('2.1.1 Verify Province -> District -> Health Facility(No Data)', async () => {
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Ibombo/ }).click()
      const pageNavigator = page.getByRole('button', { name: '2' })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await page.getByRole('button', { name: /Kapila Health Post/ }).click()
      await expect(page.locator('#content-name')).toHaveText(
        /Kapila Health Post/
      )
      await expect(
        page.getByText('Ibombo, Central', { exact: true })
      ).toBeVisible()
      await expect(page.getByText('No result')).toBeVisible()
    })
    test('2.1.2 Verify Province -> District -> District Office', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }

      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Ibombo/ }).click()
      const pageNavigator = page.getByRole('button', { name: '4' })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await page.getByRole('button', { name: /Ibombo District Office/ }).click()
      await expect(page.locator('#content-name')).toHaveText(
        /Ibombo District Office/
      )
      await expect(
        page.getByText('Ibombo, Central', { exact: true })
      ).toBeVisible()
    })
    test('2.1.3 Verify Team Members Status', async () => {
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

  test.describe.serial('2.2 Out of Scope Access', async () => {
    test('2.2.1 Verify Province -> District -> Health Facility', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }
      await page.getByRole('button', { name: /Organisation/ }).click()
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Itambo/ }).click()
      await expect(
        page.getByRole('button', { name: /KundamfumuRural Health Centre/ })
      ).toBeDisabled()
    })
    test('2.2.2 Verify Province -> District -> District Office', async () => {
      for (let i = 0; i < 2; i++) {
        await page.goBack()
      }

      await page.getByRole('button', { name: /Pualula/ }).click()
      await page.getByRole('button', { name: /Funabuli/ }).click()
      const pageNavigator = page.getByRole('button', { name: '2' })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()
      await expect(
        page.getByRole('button', { name: /Funabuli District Office/ })
      ).toBeDisabled()
    })

    //@TODO: https://github.com/opencrvs/opencrvs-core/issues/11756
    test.fail('2.2.3 Verify Embassy', async () => {
      await page.getByRole('button', { name: /Organisation/ }).click()

      await expect(
        page.getByRole('button', { name: /Farajaland Embassy/ })
      ).toBeDisabled()
    })
  })
})
