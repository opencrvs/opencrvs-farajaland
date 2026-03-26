import { expect, test } from '@playwright/test'

import { login, getToken } from '../../helpers'
import { CREDENTIALS, SAFE_WORKQUEUE_TIMEOUT_MS } from '../../constants'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { ensureAssigned, selectAction } from '../../utils'

test('Assign & Unassign', async ({ browser }) => {
  const token = await getToken(
    CREDENTIALS.REGISTRAR.USERNAME,
    CREDENTIALS.REGISTRAR.PASSWORD
  )
  const res = await createDeclaration(token)

  const page = await browser.newPage()

  const declaration: Declaration = res.declaration

  await test.step('Login', async () => {
    await login(page)
  })

  await test.step('Click on "Assign" from action menu', async () => {
    await page.waitForTimeout(SAFE_WORKQUEUE_TIMEOUT_MS)

    // wait for the event to be in the workqueue.
    await page.getByText('Pending certification').click()

    const childName = `${declaration['child.name'].firstname} ${declaration['child.name'].surname}`

    await page.getByRole('button', { name: childName }).click()

    await ensureAssigned(page)

    await expect(page.getByTestId('assignedTo-value')).toHaveText(
      'Kennedy Mweene'
    )
  })

  await test.step('Click on "Unassign" from action menu', async () => {
    await selectAction(page, 'Unassign')

    // Wait for the unassign modal to appear
    await page.getByRole('button', { name: 'Unassign', exact: true }).click()

    await expect(page.getByTestId('assignedTo-value')).toHaveText(
      'Not assigned'
    )
  })

  await page.close()
})
