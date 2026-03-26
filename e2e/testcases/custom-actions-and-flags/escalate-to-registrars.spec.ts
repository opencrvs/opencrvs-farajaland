import { test, expect, type Page } from '@playwright/test'
import {
  formatName,
  getToken,
  login,
  searchFromSearchBar,
  switchEventTab
} from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../constants'
import { ensureAssigned, ensureOutboxIsEmpty, selectAction } from '../../utils'
import { createDeclaration } from '../test-data/birth-declaration-with-father-brother'

test('Escalation of birth registration by Registrar', async ({ browser }) => {
  const childNameForRegGeneral = {
    firstNames: faker.person.firstName('female'),
    familyName: faker.person.lastName('female')
  }

  const childNameForProvincialRegistrar = {
    firstNames: faker.person.firstName('female'),
    familyName: faker.person.lastName('female')
  }

  const childNameForRegGeneralFormatted = formatName(childNameForRegGeneral)

  const childNameForProvincialFormatted = formatName(
    childNameForProvincialRegistrar
  )

  const token = await getToken(
    CREDENTIALS.REGISTRAR.USERNAME,
    CREDENTIALS.REGISTRAR.PASSWORD
  )
  await createDeclaration(
    token,
    {
      'child.name': {
        firstname: childNameForRegGeneral.firstNames,
        surname: childNameForRegGeneral.familyName
      }
    },
    'REGISTER',
    'HEALTH_FACILITY'
  )
  await createDeclaration(
    token,
    {
      'child.name': {
        firstname: childNameForProvincialRegistrar.firstNames,
        surname: childNameForProvincialRegistrar.familyName
      }
    },
    'REGISTER',
    'HEALTH_FACILITY'
  )

  let page: Page
  page = await browser.newPage()
  await login(page, CREDENTIALS.REGISTRAR)

  await test.step('Escalate to Provincial Registrar', async () => {
    await test.step('Registrar assigns birth registration', async () => {
      await page.getByText('Pending certification').click()

      await page
        .getByRole('button', { name: childNameForProvincialFormatted })
        .click()

      await ensureAssigned(page)
    })

    await test.step("Event should not have the 'Escalated' -flag", async () => {
      await expect(
        page.getByText('Escalated', { exact: true })
      ).not.toBeVisible()
    })

    await test.step('Escalate to Provincial Registrar', async () => {
      await selectAction(page, 'Escalate')

      await expect(page.getByText('Escalate to')).toBeVisible()

      await expect(page.getByText('Reason')).toBeVisible()

      const confirmButton = page.getByRole('button', { name: 'Confirm' })

      await expect(confirmButton).toBeDisabled()

      await page.locator('#escalate-to').click()

      await page
        .getByText('My state provincial registrar', { exact: true })
        .first()
        .click()

      const notesField = page.locator('#reason')

      await notesField.fill(
        'Escalating this case to Provincial Registrar for further review.'
      )

      await expect(confirmButton).toBeEnabled()

      await confirmButton.click()

      await ensureOutboxIsEmpty(page)
    })
  })

  await test.step('Escalate to Registrar General', async () => {
    await test.step('Registrar assigns birth registration', async () => {
      await page
        .getByRole('button', { name: childNameForRegGeneralFormatted })
        .click()

      await ensureAssigned(page)
    })

    await test.step("Event should not have the 'Escalated' -flag", async () => {
      await expect(
        page.getByText('Escalated', { exact: true })
      ).not.toBeVisible()
    })

    await test.step('Escalate to Registrar General', async () => {
      await selectAction(page, 'Escalate')

      await expect(page.getByText('Escalate to')).toBeVisible()

      await expect(page.getByText('Reason')).toBeVisible()

      const confirmButton = page.getByRole('button', { name: 'Confirm' })

      await expect(confirmButton).toBeDisabled()

      await page.locator('#escalate-to').click()

      await page.getByText('Registrar General').click()

      const notesField = page.locator('#reason')

      await notesField.fill(
        'Escalating this case to Registrar General for further review.'
      )

      await expect(confirmButton).toBeEnabled()

      await confirmButton.click()

      await ensureOutboxIsEmpty(page)
    })
  })

  await test.step('Verify Escalated Status by Registrar General', async () => {
    await test.step('Verify Registrar General Escalated Status', async () => {
      await login(page, CREDENTIALS.REGISTRAR_GENERAL)

      await page.getByText('Pending feedback').click()

      await page
        .getByRole('button', { name: childNameForRegGeneralFormatted })
        .click()
    })

    await test.step('Assign', async () => {
      await ensureAssigned(page)
    })

    await test.step('Event should have the correct flag', async () => {
      await expect(
        page.getByText('Escalated to Registrar General')
      ).toBeVisible()

      await expect(
        page.getByText('Escalated to Provincial Registrar')
      ).not.toBeVisible()
    })

    await test.step('Registrar general should have the action Registrar General feedback', async () => {
      await selectAction(page, 'Registrar general feedback')

      const confirmButton = page.getByRole('button', { name: 'Confirm' })

      await expect(confirmButton).toBeDisabled()

      const notesField = page.locator('#notes')

      await notesField.fill('Approving after verifying record - by RG.')

      await expect(confirmButton).toBeEnabled()

      await confirmButton.click()

      await ensureOutboxIsEmpty(page)
    })
  })

  await test.step('Verify Escalated Status by Provincial Registrar', async () => {
    await test.step('Verify Provincial Registrar Escalated Status', async () => {
      await login(page, CREDENTIALS.PROVINCIAL_REGISTRAR)

      await page.getByText('Pending feedback').click()

      await page
        .getByRole('button', { name: childNameForProvincialFormatted })
        .click()
    })

    await test.step('Assign', async () => {
      await ensureAssigned(page)
    })

    await test.step('Event should have the correct flag', async () => {
      await expect(
        page.getByText('Escalated to Registrar General')
      ).not.toBeVisible()

      await expect(
        page.getByText('Escalated to Provincial Registrar')
      ).toBeVisible()
    })

    await test.step('Provincial Registrar should have the action Provincial registrar feedback', async () => {
      await selectAction(page, 'Provincial registrar feedback')

      const confirmButton = page.getByRole('button', { name: 'Confirm' })

      await expect(confirmButton).toBeDisabled()

      const notesField = page.locator('#notes')

      await notesField.fill('Approving after verifying record - by PR.')

      await expect(confirmButton).toBeEnabled()

      await confirmButton.click()

      await ensureOutboxIsEmpty(page)
    })
  })

  await test.step('Audit review by LR', async () => {
    await test.step('Verify audit trail of Registrar General feedback action', async () => {
      await test.step('Navigate to the declaration review page', async () => {
        await login(page, CREDENTIALS.REGISTRAR, true)

        await searchFromSearchBar(page, childNameForRegGeneralFormatted)
      })

      await test.step('Assign', async () => {
        await ensureAssigned(page)
      })

      await test.step('LR should still have the option to Escalate', async () => {
        await page.getByRole('button', { name: 'Action', exact: true }).click()

        await expect(page.getByText('Escalate', { exact: true })).toBeVisible()

        await switchEventTab(page, 'Audit')
      })

      await test.step('Verify audit of escalate action', async () => {
        await page
          .getByRole('button', { name: 'Escalated', exact: true })
          .click()

        await expect(
          page.getByText('Escalate to', { exact: true })
        ).toBeVisible()

        await expect(page.getByText('Reason', { exact: true })).toBeVisible()

        const modal = page.getByTestId('event-history-modal')

        await expect(
          modal.getByText('Registrar General', { exact: true })
        ).toBeVisible()

        await expect(
          page.getByText(
            'Escalating this case to Registrar General for further review.',
            { exact: true }
          )
        ).toBeVisible()

        await page.locator('#close-btn').click()
      })

      await test.step('Validate that action and form field value appearing in audit trail', async () => {
        await page.locator('#next-page-button').first().click()

        await page
          .getByRole('button', { name: 'Escalation feedback', exact: true })
          .click()

        await expect(
          page.getByText('Approving after verifying record - by RG.')
        ).toBeVisible()
      })

      await test.step('Exit to workqueue', async () => {
        await page.locator('#close-btn').click()

        await page.getByTestId('exit-event').click()
      })
    })

    await test.step('Verify audit trail of Provincial Registrar feedback action', async () => {
      await test.step('Navigate to the declaration review page', async () => {
        await searchFromSearchBar(page, childNameForProvincialFormatted)
      })

      await test.step('Assign', async () => {
        await ensureAssigned(page)
      })

      await test.step('LR should still have the option to Escalate', async () => {
        await page.getByRole('button', { name: 'Action', exact: true }).click()

        await expect(page.getByText('Escalate', { exact: true })).toBeVisible()

        await switchEventTab(page, 'Audit')
      })

      await test.step('Verify audit of escalate action', async () => {
        await page
          .getByRole('button', { name: 'Escalated', exact: true })
          .click()

        await expect(
          page.getByText('Escalate to', { exact: true })
        ).toBeVisible()

        await expect(page.getByText('Reason', { exact: true })).toBeVisible()

        const modal = page.getByTestId('event-history-modal')

        await expect(
          modal.getByText('My state provincial registrar', { exact: true })
        ).toBeVisible()

        await expect(
          page.getByText(
            'Escalating this case to Provincial Registrar for further review.',
            { exact: true }
          )
        ).toBeVisible()

        await page.locator('#close-btn').click()
      })

      await test.step('Validate that action and form field value appearing in audit trail', async () => {
        await page.locator('#next-page-button').first().click()

        await page
          .getByRole('button', { name: 'Escalation feedback', exact: true })
          .click()

        await expect(
          page.getByText('Approving after verifying record - by PR.')
        ).toBeVisible()
      })
    })
  })

  await page.close()
})
