import { test, expect, Page } from '@playwright/test'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { getToken, login, switchEventTab } from '../../helpers'
import { CREDENTIALS, SAFE_WORKQUEUE_TIMEOUT_MS } from '../../constants'
import { ensureAssigned } from '../../utils'
test('History rows when Registrar registers a birth from scratch', async ({
  browser
}) => {
  const page: Page = await browser.newPage()
  const token = await getToken(
    CREDENTIALS.REGISTRAR.USERNAME,
    CREDENTIALS.REGISTRAR.PASSWORD
  )
  const res = await createDeclaration(token)
  const declaration: Declaration = res.declaration

  await test.step('Login', async () => {
    await login(page)
  })
  await test.step('Assign', async () => {
    await page.waitForTimeout(SAFE_WORKQUEUE_TIMEOUT_MS) // wait for the event to be in the workqueue.
    await page.getByText('Pending certification').click()
    const childName = `${declaration['child.name'].firstname} ${declaration['child.name'].surname}`
    await page.getByRole('button', { name: childName }).click()
    await ensureAssigned(page)
    await expect(page.getByTestId('assignedTo-value')).toHaveText(
      'Kennedy Mweene'
    )
  })
  await test.step('validate Actions in history', async () => {
    await switchEventTab(page, 'Audit')
    const rows = page.locator('#listTable-task-history [id^="row_"]')
    const expectedActions = [
      'Assigned',
      'Declared',
      'Registered',
      'Unassigned',
      'Viewed',
      'Assigned'
    ]
    await expect(rows).toHaveCount(expectedActions.length)
    for (let i = 0; i < expectedActions.length; i++) {
      const actionCell = rows.nth(i).locator('span').first()
      await expect(actionCell).toHaveText(expectedActions[i])
      await actionCell.getByRole('button').click()
      const modal = page.getByTestId('event-history-modal')
      await expect(modal.getByRole('heading')).toHaveText(expectedActions[i])
      await modal.locator('#close-btn').click()
    }
  })
  await page.close()
})
