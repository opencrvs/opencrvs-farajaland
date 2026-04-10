import { expect, test } from '@playwright/test'
import { getToken, login, searchFromSearchBar } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { ensureAssigned, ensureOutboxIsEmpty, selectAction } from '../../utils'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { formatV2ChildName } from '../birth/helpers'

test('Revoke and reinstate record', async ({ browser }) => {
  const page = await browser.newPage()
  let declaration: Declaration
  let childName: string

  await test.step('Setup declaration', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    declaration = (await createDeclaration(token)).declaration
    childName = formatV2ChildName(declaration)
  })

  await test.step('Login as Registrar General', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)
  })

  await test.step('Navigate to the declaration overview page', async () => {
    await searchFromSearchBar(page, childName)
  })

  await test.step('Revoke record', async () => {
    await ensureAssigned(page, CREDENTIALS.REGISTRAR_GENERAL)
    await selectAction(page, 'Revoke registration')

    await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled()

    await page.locator('#reason').fill('Revoking record for testing purposes.')

    await page.getByRole('button', { name: 'Confirm' }).click()
    await ensureOutboxIsEmpty(page)
  })

  await test.step('Assert "Revoked" -flag is present', async () => {
    await searchFromSearchBar(page, childName)
    await expect(page.getByText('Revoked')).toBeVisible()
  })

  await test.step('Reinstate record', async () => {
    await ensureAssigned(page, CREDENTIALS.REGISTRAR_GENERAL)
    await selectAction(page, 'Reinstate registration')
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled()

    await page
      .locator('#reason')
      .fill('Reinstating record for testing purposes.')

    await page.getByRole('button', { name: 'Confirm' }).click()

    await ensureOutboxIsEmpty(page)
  })
})
