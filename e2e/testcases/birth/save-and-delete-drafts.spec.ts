import { expect, test } from '@playwright/test'
import { goToSection, login, logout } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { fillChildDetails, openBirthDeclaration } from './helpers'
import { selectDeclarationAction } from '../../helpers'
import { ensureOutboxIsEmpty, selectAction } from '../../utils'

test('Save draft', async ({ browser }) => {
  const page = await browser.newPage()
  let childName = ''
  await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  await openBirthDeclaration(page)

  await test.step('Save draft via Save & Exit', async () => {
    childName = await fillChildDetails(page)
    await page.getByRole('button', { name: 'Save & Exit' }).click()
    await expect(
      page.getByText(
        'All inputted data will be kept secure for future editing. Are you ready to save any changes to this declaration form?'
      )
    ).toBeVisible()
    await page.getByRole('button', { name: 'Confirm' }).click()
    await ensureOutboxIsEmpty(page)
    await page.getByRole('button', { name: 'Drafts' }).click()
    await page.getByRole('button', { name: childName, exact: true }).click()
    await expect(page.locator('#content-name')).toHaveText(childName)
  })

  await test.step('Saved draft is not visible to other users', async () => {
    await logout(page)
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByText('Drafts').click()

    await expect(
      page.getByRole('button', { name: childName, exact: true })
    ).not.toBeVisible()
  })

  await test.step('Login as Registration Officer', async () => {
    await logout(page)
    await login(page, CREDENTIALS.REGISTRATION_OFFICER, true)
  })

  await test.step('Delete saved draft', async () => {
    await page.getByRole('button', { name: 'Drafts' }).click()
    await page.getByRole('button', { name: childName, exact: true }).click()
    await selectAction(page, 'Update')
    await selectDeclarationAction(page, 'Delete declaration', false)
    await expect(
      page.getByText('Are you sure you want to delete this declaration?')
    ).toBeVisible()
    await page.getByRole('button', { name: 'Confirm' }).click()
    await ensureOutboxIsEmpty(page)
    await page.getByText('Drafts').click()

    await expect(
      page.getByRole('button', { name: childName, exact: true })
    ).not.toBeVisible()
  })
})

test('Exit without saving', async ({ browser }) => {
  const page = await browser.newPage()
  await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  await openBirthDeclaration(page)

  await test.step('Exit without saving', async () => {
    const childName = await fillChildDetails(page)
    await goToSection(page, 'review')
    await page.getByTestId('exit-button').click()
    await expect(
      page.getByText(
        'You have unsaved changes on your declaration form. Are you sure you want to exit without saving?'
      )
    ).toBeVisible()
    await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    await ensureOutboxIsEmpty(page)
    await page.getByRole('button', { name: 'Assigned to you' }).click()

    await expect(
      page.getByRole('button', { name: childName, exact: true })
    ).not.toBeVisible()
  })
})
