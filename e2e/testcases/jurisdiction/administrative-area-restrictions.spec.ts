import { test, expect } from '@playwright/test'
import { getToken, login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { formatV2ChildName } from '../birth/helpers'
import { ActionType } from '@opencrvs/toolkit/events'

test('Record declared in one administrative area should not appear for users in another administrative area', async ({
  browser
}) => {
  let declaration: Declaration
  let childName: string
  const page = await browser.newPage()

  await test.step('Register record in Pualula District Office', async () => {
    const token = await getToken(CREDENTIALS.REGISTRATION_OFFICER_PUALULA)
    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    declaration = res.declaration
    childName = formatV2ChildName(declaration)
  })

  await test.step('Registrar from Ibombo District Office', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await test.step('Record should not be visible on workqueues', async () => {
      await page.getByRole('button', { name: 'Pending registration' }).click()
      await expect(
        page.getByRole('button', { name: childName })
      ).not.toBeVisible()
    })

    await test.step('User should not be able to find the record via search', async () => {})
  })

  await test.step('Registrar from Pualula District Office', async () => {
    await login(page, CREDENTIALS.REGISTRAR_PUALULA)

    await test.step('Record should be visible on workqueues', async () => {
      await page.getByRole('button', { name: 'Pending registration' }).click()
      await expect(page.getByRole('button', { name: childName })).toBeVisible()
    })

    await test.step('User should be able to find the record via search', async () => {})
  })
})
