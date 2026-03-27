import { expect, test } from '@playwright/test'
import { login, getToken } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { expectInUrl, type } from '../../utils'
import { ActionType } from '@opencrvs/toolkit/events'

test('Navigating in and out of dashboard', async ({ browser }) => {
  const token = await getToken(
    CREDENTIALS.REGISTRAR.USERNAME,
    CREDENTIALS.REGISTRAR.PASSWORD
  )
  const res = await createDeclaration(token, undefined, ActionType.DECLARE)
  const page = await browser.newPage()
  const declaration: Declaration = res.declaration

  await test.step('Login', async () => {
    await login(page)
  })

  await test.step('Navigate to the "Pending registration" -workqueue', async () => {
    await page.getByRole('button', { name: 'Pending registration' }).click()
  })

  await test.step("Enter the 'Registration Dashboard' - from workqueue", async () => {
    await page.getByText('Registrations Dashboard').click()
    await page.waitForURL(`**/performance/dashboard/registrations`)
    await expectInUrl(page, `/performance/dashboard/registrations`)

    await page.locator('#page-title button').click()

    await page.waitForURL(`**/workqueue/pending-registration`)
    await expectInUrl(page, '/workqueue/pending-registration')
  })

  await test.step("Enter the 'Registration Dashboard' - from search result", async () => {
    await test.step('2.5.1 - Fill in advanced search form with child details', async () => {
      await page.click('#searchType')
      await expect(page).toHaveURL(/.*\/advanced-search/)
      await page.getByText('Birth').click()

      await page.getByText('Child details').click()

      await type(page, '#firstname', declaration['child.name'].firstname)
      await type(page, '#surname', declaration['child.name'].surname)

      const [yyyy, mm, dd] = declaration['child.dob'].split('-')
      await type(page, '[data-testid="child____dob-dd"]', dd)
      await type(page, '[data-testid="child____dob-mm"]', mm)
      await type(page, '[data-testid="child____dob-yyyy"]', yyyy)

      await page.click('#search')
    })

    await test.step('2.5.2 - Navigate to Registration Dashboard from search result', async () => {
      await page.getByText('Registrations Dashboard').click()
      await page.waitForURL(`**/performance/dashboard/registrations`)
      await expectInUrl(page, `/performance/dashboard/registrations`)

      await page.locator('#page-title button').click()

      await page.waitForURL(
        `**/search-result/birth?child.dob=${declaration['child.dob']}&child.name=%7B%22firstname%22%3A%22${declaration['child.name'].firstname}%22%2C%22middlename%22%3A%22%22%2C%22surname%22%3A%22${declaration['child.name'].surname}%22%7D`
      )
      await expectInUrl(
        page,
        `/search-result/birth?child.dob=${declaration['child.dob']}&child.name=%7B%22firstname%22%3A%22${declaration['child.name'].firstname}%22%2C%22middlename%22%3A%22%22%2C%22surname%22%3A%22${declaration['child.name'].surname}%22%7D`
      )
    })
  })

  await page.close()
})
