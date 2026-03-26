import { expect, test } from '@playwright/test'
import { getToken, login, logout } from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../constants'
import {
  createDeclaration,
  Declaration
} from '../test-data/birth-declaration-with-mother-father'
import {
  ensureAssigned,
  ensureOutboxIsEmpty,
  expectInUrl,
  selectAction,
  type
} from '../../utils'
import { formatV2ChildName, REQUIRED_VALIDATION_ERROR } from '../birth/helpers'

test('Birth correction flow', async ({ browser }) => {
  const token = await getToken(
    CREDENTIALS.REGISTRAR.USERNAME,
    CREDENTIALS.REGISTRAR.PASSWORD
  )
  const res = await createDeclaration(
    token,
    undefined,
    undefined,
    'HEALTH_FACILITY'
  )

  const declaration: Declaration = res.declaration

  const eventId: string = res.eventId

  const page = await browser.newPage()

  await login(page, CREDENTIALS.REGISTRATION_OFFICER)

  await test.step('Navigate to the correction form', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()

    await page
      .getByRole('button', { name: formatV2ChildName(declaration) })
      .click()

    await ensureAssigned(page)

    await selectAction(page, 'Correct')
  })

  await test.step('Try to continue without filling in required fields', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.locator('#requester____type_error')).toHaveText(
      REQUIRED_VALIDATION_ERROR
    )

    await expect(page.locator('#reason____option_error')).toHaveText(
      REQUIRED_VALIDATION_ERROR
    )
  })

  await test.step('Fill in the correction details form', async () => {
    await page.locator('#requester____type').click()

    await page.getByText('Informant (Mother)', { exact: true }).click()

    await page.locator('#reason____option').click()

    await page
      .getByText('Myself or an agent made a mistake (Clerical error)', {
        exact: true
      })
      .click()

    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: 'Verified' }).click()
  })

  await test.step('Fill in the supporting documents form', async () => {
    const path = require('path')

    const attachmentPath = path.resolve(__dirname, './image.png')

    const inputFile = await page.locator(
      'input[name="documents____supportingDocs"][type="file"]'
    )

    await page.getByTestId('select__documents____supportingDocs').click()

    await page.getByText('Affidavit', { exact: true }).click()

    await inputFile.setInputFiles(attachmentPath)

    await page.getByTestId('select__documents____supportingDocs').click()

    await page.getByText('Court Document', { exact: true }).click()

    await inputFile.setInputFiles(attachmentPath)

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Fill in the fees form', async () => {
    await page
      .locator('#fees____amount')
      .fill(faker.number.int({ min: 1, max: 1000 }).toString())

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Review page should be displayed and continue button should be disabled', async () => {
    await expectInUrl(page, `/events/request-correction/${eventId}/review`)

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  await test.step('Go through the declaration correction form without changing any details', async () => {
    await page
      .getByRole('button', { name: 'Change all', exact: true })
      .first()
      .click()

    await expect(
      page.getByRole('button', { name: 'Back to review' })
    ).toBeEnabled()

    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(
      page.getByRole('button', { name: 'Back to review' })
    ).toBeEnabled()

    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(
      page.getByRole('button', { name: 'Back to review' })
    ).toBeEnabled()

    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(
      page.getByRole('button', { name: 'Back to review' })
    ).toBeEnabled()

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('When back on review page, continue button should still be disabled', async () => {
    await expectInUrl(page, `/events/request-correction/${eventId}/review`)

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  await test.step('After changing a value, continue button should be enabled', async () => {
    await page.getByTestId('change-button-informant.email').click()

    await page
      .getByTestId('text__informant____email')
      .fill(faker.internet.email())

    await page.getByRole('button', { name: 'Back to review' }).click()

    await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  await test.step('After changing the value back to the original, continue button should be disabled', async () => {
    await page.getByTestId('change-button-informant.email').click()

    await page
      .getByTestId('text__informant____email')
      .fill(declaration['informant.email'])

    await page.getByRole('button', { name: 'Back to review' }).click()

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  await test.step('After changing another value to an invalid value, continue button should still be disabled', async () => {
    await page.getByTestId('change-button-child.dob').click()

    // Future date
    await page.getByTestId('child____dob-yyyy').fill('2045')

    await page.getByRole('button', { name: 'Back to review' }).click()

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await expect(page.getByText('Must be a valid birth date')).toBeVisible()
  })

  const newFirstName = faker.person.firstName()

  const reasonForDelayedRegistration = faker.lorem.sentence(4)

  await test.step('After changing the value to a valid value, continue button should be enabled', async () => {
    await page.getByTestId('change-button-child.dob').click()

    await page.getByTestId('child____dob-yyyy').fill('2024')

    await page.getByTestId('child____dob-mm').fill('6')

    await page.getByTestId('child____dob-dd').fill('24')

    await page
      .getByTestId('text__child____reason')
      .fill(reasonForDelayedRegistration)

    await type(page, '#firstname', newFirstName)

    await page.getByRole('button', { name: 'Back to review' }).click()

    await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  await test.step('Continue to the summary page', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    await expectInUrl(page, `/events/request-correction/${eventId}/summary`)

    await expect(
      page.getByRole('button', { name: 'Back to review' })
    ).toBeEnabled()

    await expect(
      page.getByRole('button', { name: 'Submit correction request' })
    ).toBeEnabled()
  })

  await test.step('Press Fees change link and change the fee amount', async () => {
    await page.getByTestId('change-fees.amount').click()

    await page
      .locator('#fees____amount')
      .fill(faker.number.int({ min: 1, max: 1000 }).toString())
  })

  await test.step('Return to summary page', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Preview a file on summary page', async () => {
    await expect(
      page.getByRole('button', { name: 'Court Document' })
    ).toBeVisible()

    await page.getByRole('button', { name: 'Affidavit' }).click()

    await expect(
      page.getByRole('img', { name: 'Supporting Document' })
    ).toBeVisible()

    await page.locator('#preview_close').click()
  })

  await test.step('Submit correction request', async () => {
    await page
      .getByRole('button', { name: 'Submit correction request' })
      .click()

    await expect(page.getByText('Request record correction?')).toBeVisible()

    await page.getByRole('button', { name: 'Confirm', exact: true }).click()

    await expectInUrl(page, `/workqueue/pending-certification`)

    await ensureOutboxIsEmpty(page)
  })

  await test.step("Event appears in 'Recent' workqueue", async () => {
    await page.getByText('Recent').click()

    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeVisible()
  })

  await test.step('Approve correction request', async () => {
    await test.step('Login as Registrar', async () => {
      await logout(page)

      await login(page, CREDENTIALS.REGISTRAR)
    })

    await test.step("Find the event in the 'Pending corrections' workflow", async () => {
      await page.getByRole('button', { name: 'Pending corrections' }).click()

      await page
        .getByRole('button', { name: formatV2ChildName(declaration) })
        .click()
    })

    await test.step('Correction request action appears in audit history', async () => {
      await ensureAssigned(page)

      await page.getByRole('button', { name: 'Audit' }).click()

      await expect(
        page.getByRole('button', { name: 'Correction requested', exact: true })
      ).toBeVisible()
    })

    await test.step('Correction request audit history modal opens when action is clicked', async () => {
      await page
        .getByRole('button', { name: 'Correction requested', exact: true })
        .click()

      await expect(page.getByText('RequesterInformant (Mother)')).toBeVisible()

      await expect(
        page.getByText(
          'Reason for correctionMyself or an agent made a mistake (Clerical error)'
        )
      ).toBeVisible()

      await expect(page.getByText("Child's details")).toBeVisible()

      await expect(
        page.getByText(
          `Reason for delayed registration-${reasonForDelayedRegistration}`
        )
      ).toBeVisible()

      await page.locator('#close-btn').click()
    })

    await test.step('Navigate to correction review', async () => {
      await selectAction(page, 'Review correction request')

      await expect(page.getByText('RequesterInformant (Mother)')).toBeVisible()

      await expect(
        page.getByText(
          'Reason for correctionMyself or an agent made a mistake (Clerical error)'
        )
      ).toBeVisible()

      await expect(
        page.getByRole('heading', { name: "Child's details" })
      ).toBeVisible()
    })

    await test.step('Approve correction request', async () => {
      await page.getByRole('button', { name: 'Approve', exact: true }).click()

      await page.getByRole('button', { name: 'Confirm', exact: true }).click()

      await expectInUrl(page, `/workqueue/correction-requested`)

      await ensureOutboxIsEmpty(page)

      await page.getByRole('button', { name: 'Pending certification' }).click()

      await page
        .getByRole('button', {
          name: formatV2ChildName({
            'child.name': {
              firstname: newFirstName,
              surname: declaration['child.name'].surname
            }
          })
        })
        .click()

      await expect(page.locator('#content-name')).toHaveText(
        formatV2ChildName({
          'child.name': {
            firstname: newFirstName,
            surname: declaration['child.name'].surname
          }
        }),
        { timeout: 60_000 }
      )
    })

    await test.step('Correction approved action appears in audit history', async () => {
      await ensureAssigned(page)

      await page.getByRole('button', { name: 'Audit' }).click()

      // Go to second page of audit history list
      await page.getByRole('button', { name: 'Next page' }).click()

      await expect(
        page.getByRole('button', { name: 'Correction approved', exact: true })
      ).toBeVisible()
    })

    await test.step('Enter the direct correction form to ensure form is reset', async () => {
      await selectAction(page, 'Correct')

      await expect(page.locator('#requester____type')).toHaveText('Select...')

      await expect(page.locator('#reason____option')).toHaveText('Select...')

      await page.locator('#crcl-btn').click()
    })
  })
})
