import { test, expect } from '@playwright/test'
import {
  formatName,
  goToSection,
  login,
  switchEventTab,
  triggerDeclarationAction
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'
import { ensureAssignedToUser, selectAction } from '../../../utils'
import { fillDate } from '../helpers'
import { openRecordByTitle } from '../../print-certificate/birth/helpers'

test('Cleared field values are removed after editing and re-notifying a declaration', async ({
  page
}) => {
  const childName = {
    firstNames: faker.person.firstName(),
    familyName: faker.person.lastName()
  }
  const formattedChildName = formatName(childName)
  const childDob = { dd: '12', mm: '03', yyyy: '2015' }
  let dobValueBefore = ''

  await test.step('Login as Community Leader', async () => {
    await login(page, CREDENTIALS.COMMUNITY_LEADER)
  })

  await test.step('Initiate birth declaration', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step("Fill child's name and date of birth", async () => {
    await page.locator('#firstname').fill(childName.firstNames)
    await page.locator('#surname').fill(childName.familyName)
    await fillDate(page, childDob)
  })

  await test.step('Continue to review and Notify', async () => {
    await goToSection(page, 'review')
    await triggerDeclarationAction(page, 'Notify')
  })

  await test.step('Open the notified record and capture the date of birth shown', async () => {
    await page.getByText('Recent').click()
    await openRecordByTitle(page, formattedChildName)
    await expect(page.getByTestId('status-value')).toHaveText('Notified')
    await ensureAssignedToUser(page, CREDENTIALS.COMMUNITY_LEADER)

    await switchEventTab(page, 'Record')
    const dob = page.getByTestId('row-value-child.dob')
    await expect(dob).toContainText(childDob.yyyy)
    dobValueBefore = (await dob.innerText()).trim()
  })

  await test.step('Edit the notification and clear the date of birth', async () => {
    await selectAction(page, 'Edit')

    await page.getByTestId('change-button-child.dob').click()
    await fillDate(page, { dd: '', mm: '', yyyy: '' })

    await page.getByRole('button', { name: 'Go to review' }).click()
  })

  await test.step('Notify again with the cleared field', async () => {
    await triggerDeclarationAction(page, 'Notify with edits')
  })

  await test.step('Record no longer shows the previously entered date of birth', async () => {
    await openRecordByTitle(page, formattedChildName)
    await ensureAssignedToUser(page, CREDENTIALS.COMMUNITY_LEADER)
    await switchEventTab(page, 'Record')

    // The cleared value must not persist: the date of birth row must no longer display the value entered before the edit.
    await expect(page.getByTestId('row-value-child.dob')).not.toHaveText(
      dobValueBefore
    )
  })
})
