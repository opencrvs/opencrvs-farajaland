import { test, expect } from '@playwright/test'
import { createPIN, login } from '../../helpers'
import { validateName } from '../commons/validate-name'
test.describe("2. Validate the child's details page", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'k.mweene', 'test')
    await createPIN(page)

    await page.click('#header_new_event')

    await expect(page.getByText('New Declaration')).toBeVisible()
    await expect(page.getByText('Event type')).toBeVisible()
    await expect(page.getByLabel('Birth')).toBeVisible()

    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByText("Child's details")).toBeVisible()
  })

  validateName({
    titlePrefix: '2.1',
    fieldName: 'First Name(s)',
    inputLocator: '#firstNamesEng',
    errorLocator: '#firstNamesEng_error'
  })

  validateName({
    titlePrefix: '2.2',
    fieldName: 'Last Name',
    inputLocator: '#familyNameEng',
    errorLocator: '#familyNameEng_error'
  })
})
