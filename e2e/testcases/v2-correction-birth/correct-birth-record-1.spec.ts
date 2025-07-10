import { expect, test, type Page } from '@playwright/test'
import {
  formatDateTo_dMMMMyyyy,
  getLocationNameFromFhirId,
  getToken,
  goBackToReview,
  loginToV2,
  uploadImage
} from '../../helpers'
import { faker } from '@faker-js/faker'
import { format, parseISO, subDays } from 'date-fns'
import { CREDENTIALS } from '../../constants'
import {
  createDeclaration,
  Declaration
} from '../v2-test-data/birth-declaration'
import { ensureAssigned, expectInUrl, selectAction } from '../../v2-utils'
import { formatV2ChildName } from '../v2-birth/helpers'

test.describe('1. Correct record - 1', () => {
  let declaration: Declaration
  let trackingId: string | undefined
  let registrationNumber: string | undefined
  let eventId: string

  const updatedChildDetails = {
    firstNames: faker.person.firstName('male'),
    familyName: faker.person.firstName('male'),
    gender: 'Male',
    birthDate: format(
      subDays(new Date(), Math.ceil(15 * Math.random()) + 5),
      'yyyy-MM-dd'
    ),
    birthLocation: 'Tembwe Rural Health Centre',
    attendantAtBirth: 'Nurse',
    typeOfBirth: 'Twin',
    weightAtBirth: '3.1'
  }

  test.beforeAll(async () => {
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    const res = await createDeclaration(
      token,
      undefined,
      undefined,
      'HEALTH_FACILITY'
    )
    declaration = res.declaration
    trackingId = res.trackingId
    registrationNumber = res.registrationNumber
    eventId = res.eventId
  })

  test.describe('1.1 Validate verbiage', async () => {
    test.beforeEach(async ({ page }) => {
      await loginToV2(page, CREDENTIALS.REGISTRATION_AGENT)
      await page.getByRole('button', { name: 'Ready to print' }).click()
      await page
        .getByRole('button', { name: formatV2ChildName(declaration) })
        .click()
      await ensureAssigned(page)
    })

    test('1.1.1 Validate record audit page', async ({ page }) => {
      /*
       * Expected result: should
       * - See in header child's name and action button
       * - Navigate to record audit page
       * - See status, event, trackingId, BRN, DOB, Place of birth, Informant contact
       */
      await expect(page.getByText(formatV2ChildName(declaration))).toBeVisible()
      await expect(
        page.getByRole('button', { name: 'Action' }).first()
      ).toBeVisible()

      expect(page.url().includes(`/events/overview/${eventId}`)).toBeTruthy()

      await expect(page.getByText(`StatusRegistered`)).toBeVisible()
      await expect(page.getByText(`EventBirth`)).toBeVisible()
      await expect(page.getByText(`Tracking ID${trackingId}`)).toBeVisible()
      await expect(
        page.getByText(`Registration Number${registrationNumber}`)
      ).toBeVisible()
      await expect(
        page.getByText(`Date of birth${format(
          parseISO(declaration['child.dob']),
          'd MMMM yyyy'
        )}
    `)
      ).toBeVisible()

      const birthLocationId = declaration['child.birthLocation']

      if (!birthLocationId) {
        throw new Error('Birth location ID is undefined')
      }

      const childBirthLocationName =
        await getLocationNameFromFhirId(birthLocationId)
      await expect(
        page.getByText(`Place of birth${childBirthLocationName}`)
      ).toBeVisible()
      await expect(
        page.getByText(`Contact${declaration['informant.email']}`)
      ).toBeVisible()

      await selectAction(page, 'Correct record')
    })

    test('1.1.2 Validate correction requester page', async ({ page }) => {
      await selectAction(page, 'Correct record')

      /*
       * Expected result: should
       * - Navigate to Correction Requester Page
       */
      await expect(page.getByText('Correction details')).toBeVisible()
      await expectInUrl(
        page,
        `/events/request-correction/${eventId}/onboarding/details`
      )

      await expect(page.getByText('Requester *')).toBeVisible()
      await expect(page.getByText('Reason for correction *')).toBeVisible()
    })

    test('1.1.3 Validate identity verification page for Mother', async ({
      page
    }) => {
      await selectAction(page, 'Correct record')

      await page.locator('#requester____type').click()
      await page.getByText('Informant (Mother)', { exact: true }).click()

      await page.locator('#reason____option').click()
      await page
        .getByText('Myself or an agent made a mistake (Clerical error)', {
          exact: true
        })
        .click()

      await page.getByRole('button', { name: 'Continue' }).click()

      /*
       * Expected result: should show
       * Text: Verify their identity
       * Button: Verified
       * Button: Identity does not match
       */
      await expect(page.getByText('Verify their identity')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Verified' })).toBeVisible()
      await expect(
        page.getByRole('button', { name: 'Identity does not match' })
      ).toBeVisible()

      /*
       * Expected result: should Confirm
       * ID
       * First Name
       * Last Name
       * Date of Birth
       * Nationality
       */
      await expect(page.getByText('Type of ID')).toBeVisible()
      await expect(page.getByText('National ID')).toBeVisible()
      await expect(page.getByText(declaration['mother.nid'])).toBeVisible()
      await expect(
        page.getByText(
          `${declaration['mother.name'].firstname} ${declaration['mother.name'].surname}`
        )
      ).toBeVisible()
    })
  })

  test.describe
    .serial('1.2 Record correction by informant (mother)', async () => {
    let page: Page

    let childBirthLocationName: string | undefined

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()

      await loginToV2(page, CREDENTIALS.REGISTRATION_AGENT)
      await page.getByRole('button', { name: 'Ready to print' }).click()
      await page
        .getByRole('button', { name: formatV2ChildName(declaration) })
        .click()
      await ensureAssigned(page)
      await selectAction(page, 'Correct record')

      await page.locator('#requester____type').click()
      await page.getByText('Informant (Mother)', { exact: true }).click()

      await page.locator('#reason____option').click()
      await page
        .getByText('Myself or an agent made a mistake (Clerical error)', {
          exact: true
        })
        .click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test.afterAll(async () => {
      await page.close()
    })

    test('1.2.1 Verify identity', async () => {
      await page.getByRole('button', { name: 'Verified' }).click()

      /*
       * Expected result: should navigate to 'Upload supporting documents' -page
       */
      await expectInUrl(
        page,
        `/events/request-correction/${eventId}/onboarding/documents`
      )
    })

    test('1.2.2 Upload supporting documents', async () => {
      const imageUploadSectionTitles = ['Affidavit', 'Court Document', 'Other']

      for (const sectionTitle of imageUploadSectionTitles) {
        await page.getByTestId('select__documents____supportingDocs').click()
        await page.getByText(sectionTitle, { exact: true }).click()
        await uploadImage(page, page.getByRole('button', { name: 'Upload' }))
      }

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    const fee = faker.number.int({ min: 1, max: 1000 })

    test('1.2.3 Fees', async () => {
      await expectInUrl(
        page,
        `/events/request-correction/${eventId}/onboarding/fees`
      )

      // Clicking continue without filling required fields should cause validation errors
      await page.getByRole('button', { name: 'Continue' }).click()
      await expect(page.locator('#fees____amount_error')).toBeVisible()

      await page.locator('#fees____amount').fill(fee.toString())

      await page.getByRole('button', { name: 'Continue' }).click()

      await expectInUrl(page, `/events/request-correction/${eventId}/review`)
    })

    test.describe('1.2.4 Correction made on child details', async () => {
      test('1.2.4.1 Change name', async () => {
        await page.getByTestId('change-button-child.name').click()

        /*
         * Expected result: should
         * - redirect to child's details page
         * - focus on child's family name
         */
        await expectInUrl(
          page,
          `/events/request-correction/${eventId}/pages/child?from=review#child____name`
        )

        await page
          .getByTestId('text__firstname')
          .fill(updatedChildDetails.firstNames)

        await page
          .getByTestId('text__surname')
          .fill(updatedChildDetails.familyName)

        await goBackToReview(page)

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous name with strikethrough
         * - show updated name
         */
        await expectInUrl(page, `/events/request-correction/${eventId}/review`)

        await expect(
          await page.getByTestId('row-value-child.name').getByRole('deletion')
        ).toHaveText(
          `${declaration['child.name'].firstname} ${declaration['child.name'].surname}`
        )

        await expect(
          page
            .getByTestId('row-value-child.name')
            .getByText(
              `${updatedChildDetails.firstNames} ${updatedChildDetails.familyName}`
            )
        ).toBeVisible()
      })

      test('1.2.4.2 Change gender', async () => {
        await page.getByTestId('change-button-child.gender').click()

        /*
         * Expected result: should
         * - redirect to child's details page
         * - focus on child's gender
         */

        await expectInUrl(
          page,
          `/events/request-correction/${eventId}/pages/child?from=review#child____gender`
        )

        await page.getByTestId('select__child____gender').locator('svg').click()
        await page.getByText('Male', { exact: true }).click()

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous gender with strikethrough
         * - show updated gender
         */

        await expectInUrl(page, `/events/request-correction/${eventId}/review`)

        await expect(
          page.getByTestId('row-value-child.gender').getByRole('deletion')
        ).toHaveText(declaration['child.gender'], { ignoreCase: true })

        await expect(
          page
            .getByTestId('row-value-child.gender')
            .getByText(updatedChildDetails.gender)
        ).toBeVisible()
      })

      test('1.2.4.3 Change date of birth', async () => {
        await page.getByTestId('change-button-child.dob').click()

        /*
         * Expected result: should
         * - redirect to child's details page
         * - focus on child's date of birth
         */
        await expectInUrl(
          page,
          `/events/request-correction/${eventId}/pages/child?from=review#child____dob`
        )

        const birthDay = updatedChildDetails.birthDate.split('-')

        await page.getByPlaceholder('dd').fill(birthDay[2])
        await page.getByPlaceholder('mm').fill(birthDay[1])
        await page.getByPlaceholder('yyyy').fill(birthDay[0])

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous gender with strikethrough
         * - show updated gender
         */

        await expectInUrl(page, `/events/request-correction/${eventId}/review`)

        await expect(
          page.getByTestId('row-value-child.dob').getByRole('deletion')
        ).toHaveText(formatDateTo_dMMMMyyyy(declaration['child.dob']))

        await expect(
          page
            .getByTestId('row-value-child.dob')
            .getByText(formatDateTo_dMMMMyyyy(updatedChildDetails.birthDate))
        ).toBeVisible()
      })

      test('1.2.4.4 Change place of delivery', async () => {
        await page.getByTestId('change-button-child.placeOfBirth').click()

        /*
         * Expected result: should
         * - redirect to child's details page
         * - focus on child's place of birth
         */
        await expectInUrl(
          page,
          `/events/request-correction/${eventId}/pages/child?from=review#child____placeOfBirth`
        )

        await page
          .getByTestId('child____birthLocation')
          .fill(updatedChildDetails.birthLocation.slice(0, 2))
        await page.getByText(updatedChildDetails.birthLocation).click()

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous place of birth with strikethrough
         * - show updated place of birth
         */

        await expectInUrl(page, `/events/request-correction/${eventId}/review`)

        childBirthLocationName = await getLocationNameFromFhirId(
          declaration['child.birthLocation']!
        )
        expect(childBirthLocationName).toBeDefined()

        await expect(
          page
            .getByTestId('row-value-child.birthLocation')
            .getByRole('deletion')
            .getByText(childBirthLocationName!)
        ).toBeVisible()

        await expect(
          page
            .getByTestId('row-value-child.birthLocation')
            .getByText(updatedChildDetails.birthLocation)
        ).toBeVisible()
      })

      test('1.2.4.5 Change attendant at birth', async () => {
        await page.getByTestId('change-button-child.attendantAtBirth').click()

        /*
         * Expected result: should
         * - redirect to child's details page
         * - focus on child's Attendant at birth
         */

        await expectInUrl(
          page,
          `/events/request-correction/${eventId}/pages/child?from=review#child____attendantAtBirth`
        )

        await page.getByTestId('select__child____attendantAtBirth').click()
        await page.getByText(updatedChildDetails.attendantAtBirth).click()

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous Attendant at birth with strikethrough
         * - show updated Attendant at birth
         */

        await expectInUrl(page, `/events/request-correction/${eventId}/review`)

        await expect(
          page
            .getByTestId('row-value-child.attendantAtBirth')
            .getByRole('deletion')
        ).toHaveText('')

        await expect(
          page
            .getByTestId('row-value-child.attendantAtBirth')
            .getByText(updatedChildDetails.attendantAtBirth)
        ).toBeVisible()
      })

      test('1.2.4.6 Change type of birth', async () => {
        await page.getByTestId('change-button-child.birthType').click()

        /*
         * Expected result: should
         * - redirect to child's details page
         * - focus on child's type of birth
         */

        await expectInUrl(
          page,
          `/events/request-correction/${eventId}/pages/child?from=review#child____birthType`
        )

        await page.getByTestId('select__child____birthType').click()
        await page.getByText(updatedChildDetails.typeOfBirth).click()

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous type of birth with strikethrough
         * - show updated type of birth
         */

        await expectInUrl(page, `/events/request-correction/${eventId}/review`)

        await expect(
          page.getByTestId('row-value-child.birthType').getByRole('deletion')
        ).toHaveText('')

        await expect(
          page
            .getByTestId('row-value-child.birthType')
            .getByText(updatedChildDetails.typeOfBirth)
        ).toBeVisible()
      })
    })

    test.describe('1.2.5 Correction summary', async () => {
      test('1.2.5.1 Go back to review', async () => {
        await page
          .getByRole('button', { name: 'Continue', exact: true })
          .click()

        /* Expected result: should
         * - navigate to correction summary
         */
        await expectInUrl(page, `/events/request-correction/${eventId}/summary`)

        await page
          .getByRole('button', { name: 'Back to review', exact: true })
          .click()

        /* Expected result: should
         * - navigate to correction review
         */
        await expectInUrl(page, `/events/request-correction/${eventId}/review`)
      })

      test('1.2.5.2 Change weight at birth', async () => {
        await page.getByTestId('change-button-child.weightAtBirth').click()

        /*
         * Expected result: should
         * - redirect to child's details page
         * - focus on child's weight at birth
         */

        await expectInUrl(
          page,
          `/events/request-correction/${eventId}/pages/child?from=review#child____weightAtBirth`
        )

        await page
          .locator('#child____weightAtBirth')
          .fill(updatedChildDetails.weightAtBirth)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous weight at birth with strikethrough
         * - show updated weight at birth
         */

        await expectInUrl(page, `/events/request-correction/${eventId}/review`)

        await expect(
          page.getByTestId('row-value-child.birthType').getByRole('deletion')
        ).toHaveText('')

        await expect(
          page
            .getByTestId('row-value-child.weightAtBirth')
            .getByText(updatedChildDetails.weightAtBirth)
        ).toBeVisible()
      })

      test('1.2.5.3 Validate information in correction summary page', async () => {
        await page
          .getByRole('button', { name: 'Continue', exact: true })
          .click()

        /*
         * Expected result: should
         * - navigate to correction summary
         */
        await expectInUrl(page, `/events/request-correction/${eventId}/summary`)

        /*
         * Expected result: should show
         * - Requested by
         * - Reason for request
         * - Original vs correction
         */

        await expect(page.getByText('Informant (Mother)')).toBeVisible()
        await expect(
          page.getByText('Myself or an agent made a mistake (Clerical error)')
        ).toBeVisible()
        await expect(page.getByText(`$${fee}`)).toBeVisible()

        await expect(
          page.locator('#listTable-corrections-table-child')
        ).toContainText(
          `Child's name${declaration['child.name'].firstname} ${declaration['child.name'].surname}${updatedChildDetails.firstNames} ${updatedChildDetails.familyName}`
        )
        await expect(
          page.locator('#listTable-corrections-table-child')
        ).toContainText(
          `Sex${declaration['child.gender']}${updatedChildDetails.gender}`,
          { ignoreCase: true }
        )

        await expect(
          page.locator('#listTable-corrections-table-child')
        ).toContainText(
          `Date of birth${formatDateTo_dMMMMyyyy(declaration['child.dob'])}${formatDateTo_dMMMMyyyy(updatedChildDetails.birthDate)}`
        )

        await expect(
          page.locator('#listTable-corrections-table-child')
        ).toContainText(
          `Location of birth${await getLocationNameFromFhirId(declaration['child.birthLocation']!)}`
        )

        await expect(
          page.locator('#listTable-corrections-table-child')
        ).toContainText(`${updatedChildDetails.birthLocation}`)

        await expect(
          page.locator('#listTable-corrections-table-child')
        ).toContainText(
          `Attendant at birth${updatedChildDetails.attendantAtBirth}`
        )

        await expect(
          page.locator('#listTable-corrections-table-child')
        ).toContainText(`Type of birth${updatedChildDetails.typeOfBirth}`)

        await expect(
          page.locator('#listTable-corrections-table-child')
        ).toContainText(`Weight at birth${updatedChildDetails.weightAtBirth}`)

        /*
         * Expected result: should enable the Send for approval button
         */
        await page
          .getByRole('button', { name: 'Submit correction request' })
          .click()
        await page.getByRole('button', { name: 'Confirm' }).click()

        /*
         * Expected result: should be navigated to event overview
         */
        await expectInUrl(page, `/events/overview/${eventId}`)

        /*
         * Expected result: should
         * - be navigated to Sent for approval workqueue
         * - include the declaration in this tab
         */
        await page.getByRole('button', { name: 'Sent for approval' }).click()

        await expect(
          page.getByRole('button', { name: formatV2ChildName(declaration) })
        ).toBeVisible()
      })
    })

    // @TODO: use this after its implemented
    // test.describe.skip('1.2.6 Correction Approval', async () => {
    //   test.beforeAll(async ({ browser }) => {
    //     await page.close()
    //     page = await browser.newPage()

    //     await login(
    //       page,
    //       CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
    //       CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    //     )
    //     await createPIN(page)
    //   })

    //   test('1.2.6.1 Record audit by local registrar', async () => {
    //     await auditRecord({
    //       page,
    //       name: formatName(declaration.child.name[0]),
    //       trackingId
    //     })
    //     await assignRecord(page)
    //   })

    //   test('1.2.6.2 Correction review', async () => {
    //     await page.getByRole('button', { name: 'Action' }).first().click()
    //     await getAction(page, 'Review correction request').click()
    //     /*
    //      * Expected result: should show
    //      * - Submitter
    //      * - Requested by
    //      * - Reason for request
    //      * - Comments
    //      * - Original vs correction
    //      */

    //     await expect(
    //       page.getByText('Submitter' + 'Felix Katongo')
    //     ).toBeVisible()

    //     await expect(
    //       page.getByText(
    //         'Requested by' + formatName(declaration.mother.name[0])
    //       )
    //     ).toBeVisible()

    //     await expect(
    //       page.getByText(
    //         'Reason for request' +
    //           'Myself or an agent made a mistake (Clerical error)'
    //       )
    //     ).toBeVisible()
    //     await expect(
    //       page.getByText(
    //         'Comments' + declaration.registration.registrationNumber
    //       )
    //     ).toBeVisible()

    //     await expect(
    //       page.getByText(
    //         'Full name (Child)' +
    //           formatName(declaration.child.name[0]) +
    //           formatName(updatedChildDetails)
    //       )
    //     ).toBeVisible()

    //     await expect(
    //       page.getByText(
    //         'Sex (Child)' +
    //           declaration.child.gender +
    //           updatedChildDetails.gender
    //       )
    //     ).toBeVisible()

    //     await expect(
    //       page.getByText(
    //         'Date of birth (Child)' +
    //           formatDateTo_ddMMMMyyyy(declaration.child.birthDate) +
    //           formatDateTo_ddMMMMyyyy(updatedChildDetails.birthDate)
    //       )
    //     ).toBeVisible()

    //     await expect(
    //       page.getByText(
    //         'Place of delivery (Child)' +
    //           'Health Institution' +
    //           childBirthLocationName +
    //           'Health Institution' +
    //           updatedChildDetails.birthLocation
    //       )
    //     ).toBeVisible()

    //     await expect(
    //       page.getByText(
    //         'Attendant at birth (Child)' +
    //           declaration.attendantAtBirth +
    //           updatedChildDetails.attendantAtBirth
    //       )
    //     ).toBeVisible()

    //     await expect(
    //       page.getByText(
    //         'Type of birth (Child)' +
    //           declaration.birthType +
    //           updatedChildDetails.typeOfBirth
    //       )
    //     ).toBeVisible()

    //     await expect(
    //       page.getByText(
    //         'Weight at birth (Child)' +
    //           declaration.weightAtBirth +
    //           updatedChildDetails.weightAtBirth
    //       )
    //     ).toBeVisible()
    //   })

    //   test('1.2.6.3 Approve correction', async () => {
    //     await page.getByRole('button', { name: 'Approve', exact: true }).click()
    //     await page.getByRole('button', { name: 'Confirm', exact: true }).click()

    //     /*
    //      * Expected result: should
    //      * - be navigated to ready to print tab
    //      * - include the updated declaration in this tab
    //      */
    //     expect(page.url().includes('registration-home/print')).toBeTruthy()
    //     await page.getByRole('button', { name: 'Outbox' }).click()
    //     await expectOutboxToBeEmpty(page)
    //     await page.getByRole('button', { name: 'Ready to print' }).click()
    //     await expect(
    //       page.getByText(formatName(updatedChildDetails))
    //     ).toBeVisible()
    //   })
    //   test.describe('1.2.6.4 Validate history in record audit', async () => {
    //     test('1.2.6.4.1 Validate entries in record audit', async () => {
    //       await auditRecord({
    //         page,
    //         name: formatName(updatedChildDetails),
    //         trackingId
    //       })

    //       await assignRecord(page)

    //       /*
    //        * Expected result: should show in task history
    //        * - Correction requested
    //        * - Correction approved
    //        */

    //       await expect(
    //         page
    //           .locator('#listTable-task-history')
    //           .getByRole('button', { name: 'Correction requested' })
    //       ).toBeVisible()

    //       await expect(
    //         page
    //           .locator('#listTable-task-history')
    //           .getByRole('button', { name: 'Correction approved' })
    //       ).toBeVisible()
    //     })

    //     test('1.2.6.4.2 Validate correction requested modal', async () => {
    //       const correctionRequestedRow = page.locator(
    //         '#listTable-task-history div[id^="row_"]:has-text("Correction requested")'
    //       )
    //       await correctionRequestedRow.getByText('Correction requested').click()

    //       const time = await correctionRequestedRow
    //         .locator('span')
    //         .nth(1)
    //         .innerText()

    //       const requester = await correctionRequestedRow
    //         .locator('span')
    //         .nth(2)
    //         .innerText()

    //       /*
    //        * Expected result: Should show
    //        * - Correction requested header
    //        * - Requester & time
    //        * - Requested by
    //        * - Id check
    //        * - Reason
    //        * - Comment
    //        * - Original vs Correction
    //        */

    //       await expect(
    //         page.getByRole('heading', { name: 'Correction requested' })
    //       ).toBeVisible()

    //       await expect(page.getByText(requester + ' — ' + time)).toBeVisible()

    //       await expect(page.getByText('Requested by' + 'Mother')).toBeVisible()
    //       await expect(page.getByText('ID check' + 'Verified')).toBeVisible()
    //       await expect(
    //         page.getByText(
    //           'Reason for request' +
    //             'Myself or an agent made a mistake (Clerical error)'
    //         )
    //       ).toBeVisible()

    //       await expect(
    //         page.getByText(
    //           'Comment' + declaration.registration.registrationNumber
    //         )
    //       ).toBeVisible()

    //       await expect(
    //         page.getByText(
    //           'First name(s) (Child)' +
    //             declaration.child.name[0].firstNames +
    //             updatedChildDetails.firstNames
    //         )
    //       ).toBeVisible()

    //       await expect(
    //         page.getByText(
    //           'Last name (Child)' +
    //             declaration.child.name[0].familyName +
    //             updatedChildDetails.familyName
    //         )
    //       ).toBeVisible()

    //       await expect(
    //         page.getByText(
    //           'Sex (Child)' +
    //             declaration.child.gender +
    //             updatedChildDetails.gender
    //         )
    //       ).toBeVisible()

    //       await expect(
    //         page.getByText(
    //           'Date of birth (Child)' +
    //             formatDateTo_yyyyMMdd(declaration.child.birthDate) +
    //             formatDateTo_yyyyMMdd(updatedChildDetails.birthDate)
    //         )
    //       ).toBeVisible()

    //       await expect(
    //         page.getByText(
    //           'Health Institution (Child)' +
    //             childBirthLocationName +
    //             updatedChildDetails.birthLocation
    //         )
    //       ).toBeVisible()

    //       await expect(
    //         page.getByText(
    //           'Attendant at birth (Child)' +
    //             declaration.attendantAtBirth +
    //             updatedChildDetails.attendantAtBirth
    //         )
    //       ).toBeVisible()

    //       await expect(
    //         page.getByText(
    //           'Type of birth (Child)' +
    //             declaration.birthType +
    //             updatedChildDetails.typeOfBirth
    //         )
    //       ).toBeVisible()

    //       await expect(
    //         page.getByText(
    //           'Weight at birth (Child)' +
    //             declaration.weightAtBirth +
    //             updatedChildDetails.weightAtBirth
    //         )
    //       ).toBeVisible()

    //       await page
    //         .getByRole('heading', { name: 'Correction requested' })
    //         .locator('xpath=following-sibling::*[1]')
    //         .click()
    //     })

    //     test('1.2.6.4.3 Validate correction approved modal', async () => {
    //       const correctionApprovedRow = page.locator(
    //         '#listTable-task-history div[id^="row_"]:has-text("Correction approved")'
    //       )
    //       await correctionApprovedRow.getByText('Correction approved').click()

    //       const time = await correctionApprovedRow
    //         .locator('span')
    //         .nth(1)
    //         .innerText()

    //       const reviewer = await correctionApprovedRow
    //         .locator('span')
    //         .nth(2)
    //         .innerText()

    //       /*
    //        * Expected result: Should show
    //        * - Correction approved header
    //        * - Reviewer & time
    //        */

    //       await expect(
    //         page.getByRole('heading', { name: 'Correction approved' })
    //       ).toBeVisible()

    //       await expect(page.getByText(reviewer + ' — ' + time)).toBeVisible()
    //       await page
    //         .getByRole('heading', { name: 'Correction approved' })
    //         .locator('xpath=following-sibling::*[1]')
    //         .click()
    //     })
    //   })
    // })
  })
})
