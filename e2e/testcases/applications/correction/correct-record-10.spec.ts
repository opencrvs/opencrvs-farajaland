import { expect, test, type Page } from '@playwright/test'
import { createPIN, getToken, login, uploadImage } from '../../../helpers'
import faker from '@faker-js/faker'
import { format, parseISO, subDays } from 'date-fns'
import { createDeathDeclaration, fetchDeclaration } from '../../death/helpers'
import { DeathDeclaration } from '../../death/types'

test.describe('10. Correct record - 10', () => {
  let declaration: DeathDeclaration
  let trackingId = ''

  const updatedDeceasedDetails = {
    firstNames: faker.name.firstName('female'),
    familyName: faker.name.firstName('female'),
    gender: 'Female',
    birthDate: format(
      subDays(new Date(), Math.ceil(50 * Math.random()) + 365 * 25),
      'yyyy-MM-dd'
    ),
    nationality: 'Canada',
    id: faker.random.numeric(10),
    idType: 'Passport',
    address: {
      province: 'Pualula',
      district: 'Pili',
      town: faker.address.city(),
      residentialArea: faker.address.county(),
      street: faker.address.streetName(),
      number: faker.address.buildingNumber(),
      zipCode: faker.address.zipCode()
    },
    maritalStatus: 'Married',
    NOdependants: '3'
  }

  test.beforeAll(async () => {
    let token = await getToken('k.mweene', 'test')

    const res = await createDeathDeclaration(token)
    expect(res).toStrictEqual({
      trackingId: expect.any(String),
      compositionId: expect.any(String),
      isPotentiallyDuplicate: false,
      __typename: 'CreatedIds'
    })

    trackingId = res.trackingId

    token = await getToken('f.katongo', 'test')

    declaration = (await fetchDeclaration(token, res.compositionId)).data
      .fetchDeathRegistration as DeathDeclaration
  })

  test.describe('10.1 Validate verbiage', async () => {
    test.beforeEach(async ({ page }) => {
      await login(page, 'f.katongo', 'test')
      await createPIN(page)

      await page.getByPlaceholder('Search for a tracking ID').fill(trackingId)
      await page.getByPlaceholder('Search for a tracking ID').press('Enter')
      await page.locator('#ListItemAction-0-icon').click()
      await page.locator('#name_0').click()
    })

    test('10.1.1 Validate record audit page', async ({ page }) => {
      /*
       * Expected result: should
       * - See in header deceased's name and correct record option
       * - Navigate to record audit page
       * - See status, event, trackingId, BRN, DOB, Place of birth, Informant contact
       */
      await expect(
        page.getByText(
          declaration.deceased.name[0].firstNames +
            ' ' +
            declaration.deceased.name[0].familyName
        )
      ).toBeVisible()
      await expect(
        page.getByRole('button', { name: 'Correct record' })
      ).toBeVisible()

      expect(page.url().includes('record-audit')).toBeTruthy()

      await expect(
        page.getByText(`Status${declaration.registration.status[0].type}`)
      ).toBeVisible()
      await expect(
        page.getByText(`Event${declaration.registration.type}`)
      ).toBeVisible()
      await expect(page.getByText(`Tracking ID${trackingId}`)).toBeVisible()
      await expect(
        page.getByText(
          `Registration No${declaration.registration.registrationNumber}`
        )
      ).toBeVisible()
      await expect(
        page.getByText(`Date of death${format(
          parseISO(declaration.deceased.deceased.deathDate),
          'MMMM dd, yyyy'
        )}
    `)
      ).toBeVisible()
      // await expect(page.getByText(`Place of birth${}`)).toBeVisible()
      await expect(
        page.getByText(declaration.registration.contactEmail)
      ).toBeVisible()
    })

    test('10.1.2 Validate correction requester page', async ({ page }) => {
      await page.getByRole('button', { name: 'Correct record' }).click()

      /*
       * Expected result: should
       * - Navigate to Correction Requester Page
       */
      await expect(page.getByText('Correction requester')).toBeVisible()
      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('corrector')).toBeTruthy()
    })

    test('10.1.3 Validate identity verification page for Informant (SPOUSE)', async ({
      page
    }) => {
      await page.getByRole('button', { name: 'Correct record' }).click()

      await page.getByLabel('Informant (SPOUSE)').check()
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
      await expect(
        page.getByText(
          `ID: National Id | ${declaration.informant.identifier[0].id}`
        )
      ).toBeVisible()
      await expect(
        page.getByText(
          `First name(s): ${declaration.informant.name[0].firstNames}`
        )
      ).toBeVisible()
      await expect(
        page.getByText(`Last name: ${declaration.informant.name[0].familyName}`)
      ).toBeVisible()
      await expect(
        page.getByText(
          `Date of Birth:
        ${format(parseISO(declaration.informant.birthDate), 'dd MMMM yyyy')}
        `
        )
      ).toBeVisible()
      await expect(
        page.getByText(`Nationality: ${declaration.informant.nationality}`)
      ).toBeVisible()
    })
  })

  test.describe.serial('10.2 Record correction by informant', async () => {
    let page: Page

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()

      await login(page, 'f.katongo', 'test')
      await createPIN(page)

      await page.getByPlaceholder('Search for a tracking ID').fill(trackingId)
      await page.getByPlaceholder('Search for a tracking ID').press('Enter')
      await page.locator('#ListItemAction-0-icon').click()
      await page.locator('#name_0').click()

      await page.getByRole('button', { name: 'Correct record' }).click()

      await page.getByLabel('Informant (SPOUSE)').check()
      await page.getByRole('button', { name: 'Continue' }).click()
    })
    test.afterAll(async () => {
      await page.close()
    })

    test('10.2.1 Verify identity', async () => {
      /*
       * Expected result: should Confirm
       * ID
       * First Name
       * Last Name
       * Date of Birth
       * Nationality
       */
      await expect(
        page.getByText(
          `ID: National Id | ${declaration.informant.identifier[0].id}`
        )
      ).toBeVisible()
      await expect(
        page.getByText(
          `First name(s): ${declaration.informant.name[0].firstNames}`
        )
      ).toBeVisible()
      await expect(
        page.getByText(`Last name: ${declaration.informant.name[0].familyName}`)
      ).toBeVisible()
      await expect(
        page.getByText(
          `Date of Birth:
        ${format(parseISO(declaration.informant.birthDate), 'dd MMMM yyyy')}
        `
        )
      ).toBeVisible()
      await expect(
        page.getByText(`Nationality: ${declaration.informant.nationality}`)
      ).toBeVisible()

      await page.getByRole('button', { name: 'Verified' }).click()

      /*
       * Expected result: should navigate to review page
       */
      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('review')).toBeTruthy()
    })

    test.describe('10.2.2 Correction made on deceased details', async () => {
      test('10.2.2.1 Change name', async () => {
        await page
          .locator('#deceased-content #Full')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to deceased's details page
         * - focus on deceased's family name
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('deceased-view-group')).toBeTruthy()
        expect(page.url().includes('#familyNameEng')).toBeTruthy()

        await page
          .locator('#firstNamesEng')
          .fill(updatedDeceasedDetails.firstNames)
        await page
          .locator('#familyNameEng')
          .fill(updatedDeceasedDetails.familyName)

        await page.waitForTimeout(500)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous name with strikethrough
         * - show updated name
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        const oldData = await page
          .locator('#deceased-content #Full')
          .getByRole('deletion')
          .all()

        await expect(oldData[0]).toHaveText(
          declaration.deceased.name[0].firstNames
        )
        await expect(oldData[1]).toHaveText(
          declaration.deceased.name[0].familyName
        )

        await expect(
          page
            .locator('#deceased-content #Full')
            .getByText(updatedDeceasedDetails.firstNames)
        ).toBeVisible()
        await expect(
          page
            .locator('#deceased-content #Full')
            .getByText(updatedDeceasedDetails.familyName)
        ).toBeVisible()
      })

      test('10.2.2.2 Change gender', async () => {
        await page
          .locator('#deceased-content #Sex')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to deceased's details page
         * - focus on deceased's gender
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('deceased-view-group')).toBeTruthy()
        expect(page.url().includes('#gender')).toBeTruthy()

        await page.locator('#gender').click()
        await page.getByText(updatedDeceasedDetails.gender).click()

        await page.waitForTimeout(500)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous gender with strikethrough
         * - show updated gender
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        await expect(
          page.locator('#deceased-content #Sex').getByRole('deletion')
        ).toHaveText(declaration.deceased.gender, { ignoreCase: true })

        await expect(
          page
            .locator('#deceased-content #Sex')
            .getByText(updatedDeceasedDetails.gender)
        ).toBeVisible()
      })

      test('10.2.2.3 Change date of birth', async () => {
        await page
          .locator('#deceased-content #Date')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to deceased's details page
         * - focus on deceased's date of birth
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('deceased-view-group')).toBeTruthy()
        expect(page.url().includes('#deceasedBirthDate')).toBeTruthy()

        const birthDay = updatedDeceasedDetails.birthDate.split('-')

        await page.getByPlaceholder('dd').fill(birthDay[2])
        await page.getByPlaceholder('mm').fill(birthDay[1])
        await page.getByPlaceholder('yyyy').fill(birthDay[0])

        await page.waitForTimeout(500)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous gender with strikethrough
         * - show updated gender
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        await expect(
          page.locator('#deceased-content #Date').getByRole('deletion')
        ).toHaveText(
          format(parseISO(declaration.deceased.birthDate), 'dd MMMM yyyy'),
          { ignoreCase: true }
        )

        await expect(
          page
            .locator('#deceased-content #Date')
            .getByText(
              format(parseISO(updatedDeceasedDetails.birthDate), 'dd MMMM yyyy')
            )
        ).toBeVisible()
      })

      test('10.2.2.4 Change nationality', async () => {
        await page
          .locator('#deceased-content #Nationality')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to deceased's details page
         * - focus on deceased's nationality
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('deceased-view-group')).toBeTruthy()
        expect(page.url().includes('#nationality')).toBeTruthy()

        await page.locator('#nationality').click()
        await page.getByText(updatedDeceasedDetails.nationality).click()

        await page.waitForTimeout(500)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous nationality with strikethrough
         * - show updated nationality
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        await expect(
          page.locator('#deceased-content #Nationality').getByRole('deletion')
        ).toHaveText('Farajaland', {
          ignoreCase: true
        })

        await expect(
          page
            .locator('#deceased-content #Nationality')
            .getByText(updatedDeceasedDetails.nationality)
        ).toBeVisible()
      })

      test('10.2.2.5 Change id type', async () => {
        await page
          .locator('#deceased-content #Type')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to deceased's details page
         * - focus on deceased's id type
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('deceased-view-group')).toBeTruthy()
        expect(page.url().includes('#deceasedIdType')).toBeTruthy()

        await page.locator('#deceasedIdType').click()
        await page.getByText(updatedDeceasedDetails.idType).click()

        await page.waitForTimeout(500)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous id type with strikethrough
         * - show updated id type
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        await expect(
          page.locator('#deceased-content #Type').getByRole('deletion')
        ).toHaveText('National Id', {
          ignoreCase: true
        })

        await expect(
          page
            .locator('#deceased-content #Type')
            .getByText(updatedDeceasedDetails.idType)
        ).toBeVisible()
      })

      test('10.2.2.6 Change id', async () => {
        await page
          .locator('#deceased-content #ID')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to deceased's details page
         * - focus on deceased's id
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('deceased-view-group')).toBeTruthy()
        expect(page.url().includes('#deceasedPassport')).toBeTruthy()

        await page.locator('#deceasedPassport').fill(updatedDeceasedDetails.id)

        await page.waitForTimeout(500)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous id with strikethrough
         * - show updated id
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        await expect(
          page
            .locator('#deceased-content #ID')
            .getByText(updatedDeceasedDetails.id)
        ).toBeVisible()
      })

      test('10.2.2.7 Change usual place of residence', async () => {
        await page
          .locator('#deceased-content #Usual')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to deceased's details page
         * - focus on deceased's Usual place of resiedence
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('deceased-view-group')).toBeTruthy()
        expect(page.url().includes('#countryPrimary')).toBeTruthy()

        await page.locator('#statePrimaryDeceased').click()
        await page.getByText(updatedDeceasedDetails.address.province).click()

        await page.locator('#districtPrimaryDeceased').click()
        await page.getByText(updatedDeceasedDetails.address.district).click()

        await page
          .locator('#cityPrimaryDeceased')
          .fill(updatedDeceasedDetails.address.town)

        await page
          .locator('#addressLine1UrbanOptionPrimaryDeceased')
          .fill(updatedDeceasedDetails.address.residentialArea)

        await page
          .locator('#addressLine2UrbanOptionPrimaryDeceased')
          .fill(updatedDeceasedDetails.address.street)

        await page
          .locator('#addressLine3UrbanOptionPrimaryDeceased')
          .fill(updatedDeceasedDetails.address.number)

        await page
          .locator('#postalCodePrimaryDeceased')
          .fill(updatedDeceasedDetails.address.zipCode)

        await page.waitForTimeout(500)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous Usual place of resiedence with strikethrough
         * - show updated Usual place of resiedence
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()
        await expect(
          page.locator('#deceased-content #Usual').getByRole('deletion').nth(1)
        ).toHaveText('Farajaland', {
          ignoreCase: true
        })
        await expect(
          page.locator('#deceased-content #Usual').getByRole('deletion').nth(2)
        ).toHaveText('Sulaka', { ignoreCase: true })
        await expect(
          page.locator('#deceased-content #Usual').getByRole('deletion').nth(3)
        ).toHaveText('Zobwe', {
          ignoreCase: true
        })
        await expect(
          page.locator('#deceased-content #Usual').getByRole('deletion').nth(5)
        ).toHaveText(declaration.deceased.address[0].city, { ignoreCase: true })
        await expect(
          page.locator('#deceased-content #Usual').getByRole('deletion').nth(6)
        ).toHaveText(declaration.deceased.address[0].line[2], {
          ignoreCase: true
        })
        await expect(
          page.locator('#deceased-content #Usual').getByRole('deletion').nth(7)
        ).toHaveText(declaration.deceased.address[0].line[1], {
          ignoreCase: true
        })
        await expect(
          page.locator('#deceased-content #Usual').getByRole('deletion').nth(8)
        ).toHaveText(declaration.deceased.address[0].line[0], {
          ignoreCase: true
        })
        await expect(
          page.locator('#deceased-content #Usual').getByRole('deletion').nth(9)
        ).toHaveText(declaration.deceased.address[0].postalCode, {
          ignoreCase: true
        })

        await expect(
          page.locator('#deceased-content #Usual').getByText('Farajaland')
        ).toBeVisible()
        await expect(
          page
            .locator('#deceased-content #Usual')
            .getByText(updatedDeceasedDetails.address.province)
        ).toBeVisible()
        await expect(
          page
            .locator('#deceased-content #Usual')
            .getByText(updatedDeceasedDetails.address.district)
        ).toBeVisible()
        await expect(
          page
            .locator('#deceased-content #Usual')
            .getByText(updatedDeceasedDetails.address.town)
        ).toBeVisible()
        await expect(
          page
            .locator('#deceased-content #Usual')
            .getByText(updatedDeceasedDetails.address.residentialArea)
        ).toBeVisible()
        await expect(
          page
            .locator('#deceased-content #Usual')
            .getByText(updatedDeceasedDetails.address.street)
        ).toBeVisible()
        await expect(
          page
            .locator('#deceased-content #Usual')
            .getByText(updatedDeceasedDetails.address.number)
        ).toBeVisible()
        await expect(
          page
            .locator('#deceased-content #Usual')
            .getByText(updatedDeceasedDetails.address.zipCode)
        ).toBeVisible()
      })

      test('10.2.2.8 Change marital status', async () => {
        await page
          .locator('#deceased-content #Marital')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to deceased's details page
         * - focus on deceased's marital status
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('deceased-view-group')).toBeTruthy()
        expect(page.url().includes('#maritalStatus')).toBeTruthy()

        await page.locator('#maritalStatus').click()
        await page.getByText(updatedDeceasedDetails.maritalStatus).click()

        await page.waitForTimeout(500)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous marital status with strikethrough
         * - show updated marital status
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        await expect(
          page.locator('#deceased-content #Marital').getByRole('deletion')
        ).toHaveText('-')

        await expect(
          page
            .locator('#deceased-content #Marital')
            .getByText(updatedDeceasedDetails.maritalStatus)
        ).toBeVisible()
      })

      test('10.2.2.9 Change number of depandants', async () => {
        await page
          .getByRole('row', { name: 'No. of dependants' })
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to deceased's details page
         * - focus on deceased's number of depandants
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('deceased-view-group')).toBeTruthy()
        expect(page.url().includes('#numberOfDependants')).toBeTruthy()

        await page
          .locator('#numberOfDependants')
          .fill(updatedDeceasedDetails.NOdependants)

        await page.waitForTimeout(500)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show new number of depandants
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        await expect(
          page
            .getByRole('row', { name: 'No. of dependants' })
            .getByText(updatedDeceasedDetails.NOdependants)
        ).toBeVisible()
      })
    })

    test('10.2.3 Upload supporting documents', async () => {
      await page.getByRole('button', { name: 'Continue' }).click()

      /*
       * Expected result: should
       * - navigate to supporting document
       * - continue button is disabled
       */
      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('supportingDocuments')).toBeTruthy()

      await expect(
        page.getByRole('button', { name: 'Continue' })
      ).toBeDisabled()

      await page.getByText('Select...').click()
      await page.getByText('Affidavit', { exact: true }).click()
      await uploadImage(page, page.getByRole('button', { name: 'Upload' }))

      await page.getByText('Select...').click()
      await page.getByText('Court Document', { exact: true }).click()
      await uploadImage(page, page.getByRole('button', { name: 'Upload' }))

      await page.getByText('Select...').click()
      await page.getByText('Other', { exact: true }).click()
      await uploadImage(page, page.getByRole('button', { name: 'Upload' }))

      /*
       * Expected result: should enable the continue button
       */

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('10.2.4 Reason for correction', async () => {
      /*
       * Expected result: should
       * - navigate to reason for correction
       * - continue button is disabled
       */
      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('reason')).toBeTruthy()

      await expect(
        page.getByRole('button', { name: 'Continue' })
      ).toBeDisabled()

      await page
        .getByLabel('Myself or an agent made a mistake (Clerical error)')
        .check()

      await page
        .locator('#additionalComment')
        .fill(declaration.registration.registrationNumber)

      /*
       * Expected result: should enable the continue button
       */

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('10.2.5 Correction summary', async () => {
      /*
       * Expected result: should
       * - navigate to correction summary
       * - Send for approval button is disabled
       */
      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('summary')).toBeTruthy()

      await expect(
        page.getByRole('button', { name: 'Send for approval' })
      ).toBeDisabled()

      /*
       * Expected result: should show
       * - Original vs correction
       * - Requested by
       * - ID check
       * - Reason for request
       * - Comments
       */

      await expect(
        page.getByText(
          'Full name (Deceased)' +
            declaration.deceased.name[0].firstNames +
            ' ' +
            declaration.deceased.name[0].familyName +
            updatedDeceasedDetails.firstNames +
            ' ' +
            updatedDeceasedDetails.familyName
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'Sex (Deceased)' +
            declaration.deceased.gender +
            updatedDeceasedDetails.gender
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'Date of birth (Deceased)' +
            format(parseISO(declaration.deceased.birthDate), 'dd MMMM yyyy') +
            format(parseISO(updatedDeceasedDetails.birthDate), 'dd MMMM yyyy')
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'Nationality (Deceased)Farajaland' +
            updatedDeceasedDetails.nationality
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'Type of ID (Deceased)National ID' + updatedDeceasedDetails.idType
        )
      ).toBeVisible()
      await expect(
        page.getByText('ID Number (Deceased)-' + updatedDeceasedDetails.id)
      ).toBeVisible()

      await expect(
        page.getByText(
          'Usual place of residence (Deceased)FarajalandSulakaZobwe-' +
            declaration.deceased.address[0].city +
            declaration.deceased.address[0].line[2] +
            declaration.deceased.address[0].line[1] +
            declaration.deceased.address[0].line[0] +
            declaration.deceased.address[0].postalCode +
            'Farajaland' +
            updatedDeceasedDetails.address.province +
            updatedDeceasedDetails.address.district +
            updatedDeceasedDetails.address.town +
            updatedDeceasedDetails.address.residentialArea +
            updatedDeceasedDetails.address.street +
            updatedDeceasedDetails.address.number +
            updatedDeceasedDetails.address.zipCode
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'Marital status (Deceased)-' + updatedDeceasedDetails.maritalStatus
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'No. of dependants (Deceased)-' + updatedDeceasedDetails.NOdependants
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          declaration.informant.name[0].firstNames +
            ' ' +
            declaration.informant.name[0].familyName
        )
      ).toBeVisible()
      await expect(page.getByText('Verified')).toBeVisible()
      await expect(
        page.getByText('Myself or an agent made a mistake (Clerical error)')
      ).toBeVisible()
      await expect(
        page.getByText(declaration.registration.registrationNumber)
      ).toBeVisible()

      await page.getByLabel('Yes').check()
      await page
        .locator('#correctionFees\\.nestedFields\\.totalFees')
        .fill('15')

      await uploadImage(page, page.locator('#upload_document'))

      /*
       * Expected result: should enable the Send for approval button
       */
      await page.getByRole('button', { name: 'Send for approval' }).click()
      await page.getByRole('button', { name: 'Confirm' }).click()

      /*
       * Expected result: should
       * - be navigated to sent for approval tab
       * - include the declaration in this tab
       */
      expect(page.url().includes('registration-home/approvals')).toBeTruthy()
      await expect(page.locator('#navigation_outbox')).not.toContainText('1', {
        timeout: 1000 * 30
      })

      await expect(
        page.getByText(
          declaration.deceased.name[0].firstNames +
            ' ' +
            declaration.deceased.name[0].familyName
        )
      ).toBeVisible()
    })

    test.describe('10.2.6 Correction Approval', async () => {
      test.beforeAll(async ({ browser }) => {
        await page.close()
        page = await browser.newPage()

        await login(page, 'k.mweene', 'test')
        await createPIN(page)
      })

      test('10.2.6.1 Record audit by local registrar', async () => {
        await page.getByPlaceholder('Search for a tracking ID').fill(trackingId)
        await page.getByPlaceholder('Search for a tracking ID').press('Enter')
        await page.locator('#ListItemAction-0-icon').click()
        await page.getByRole('button', { name: 'Assign', exact: true }).click()

        await page.locator('#name_0').click()
      })

      test('10.2.6.2 Correction review', async () => {
        await page.getByRole('button', { name: 'Review', exact: true }).click()

        /*
         * Expected result: should show
         * - Submitter
         * - Requested by
         * - Reason for request
         * - Comments
         * - Original vs correction
         */

        await expect(
          page.getByText('Submitter' + 'Felix Katongo')
        ).toBeVisible()

        await expect(
          page.getByText(
            'Requested by' +
              declaration.spouse.name[0].firstNames +
              ' ' +
              declaration.spouse.name[0].familyName
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Reason for request' +
              'Myself or an agent made a mistake (Clerical error)'
          )
        ).toBeVisible()
        await expect(
          page.getByText(
            'Comments' + declaration.registration.registrationNumber
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Full name (Deceased)' +
              declaration.deceased.name[0].firstNames +
              ' ' +
              declaration.deceased.name[0].familyName +
              updatedDeceasedDetails.firstNames +
              ' ' +
              updatedDeceasedDetails.familyName
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Sex (Deceased)' +
              declaration.deceased.gender +
              updatedDeceasedDetails.gender
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Date of birth (Deceased)' +
              format(parseISO(declaration.deceased.birthDate), 'dd MMMM yyyy') +
              format(parseISO(updatedDeceasedDetails.birthDate), 'dd MMMM yyyy')
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Nationality (Deceased)Farajaland' +
              updatedDeceasedDetails.nationality
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Type of ID (Deceased)National ID' + updatedDeceasedDetails.idType
          )
        ).toBeVisible()
        await expect(
          page.getByText('ID Number (Deceased)-' + updatedDeceasedDetails.id)
        ).toBeVisible()

        await expect(
          page.getByText(
            'Usual place of residence (Deceased)FarajalandSulakaZobwe-' +
              declaration.deceased.address[0].city +
              declaration.deceased.address[0].line[2] +
              declaration.deceased.address[0].line[1] +
              declaration.deceased.address[0].line[0] +
              declaration.deceased.address[0].postalCode +
              'Farajaland' +
              updatedDeceasedDetails.address.province +
              updatedDeceasedDetails.address.district +
              updatedDeceasedDetails.address.town +
              updatedDeceasedDetails.address.residentialArea +
              updatedDeceasedDetails.address.street +
              updatedDeceasedDetails.address.number +
              updatedDeceasedDetails.address.zipCode
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Marital status (Deceased)-' + updatedDeceasedDetails.maritalStatus
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'No. of dependants (Deceased)-' +
              updatedDeceasedDetails.NOdependants
          )
        ).toBeVisible()
      })

      test('10.2.6.3 Approve correction', async () => {
        await page.getByRole('button', { name: 'Approve', exact: true }).click()
        await page.getByRole('button', { name: 'Confirm', exact: true }).click()

        /*
         * Expected result: should
         * - be navigated to ready to print tab
         * - include the updated declaration in this tab
         */
        expect(page.url().includes('registration-home/print')).toBeTruthy()
        await expect(page.locator('#navigation_outbox')).not.toContainText(
          '1',
          {
            timeout: 1000 * 30
          }
        )
        await expect(
          page.getByText(
            updatedDeceasedDetails.firstNames +
              ' ' +
              updatedDeceasedDetails.familyName
          )
        ).toBeVisible()
      })
      test('10.2.6.4 Validate history in record audit', async () => {
        await page
          .getByText(
            updatedDeceasedDetails.firstNames +
              ' ' +
              updatedDeceasedDetails.familyName
          )
          .click()

        await page.getByLabel('Assign record').click()
        await page.getByRole('button', { name: 'Assign', exact: true }).click()

        /*
         * Expected result: should show in task history
         * - Correction requested
         * - Correction approved
         */

        await expect(
          page
            .locator('#listTable-task-history')
            .getByRole('button', { name: 'Correction requested' })
        ).toBeVisible()

        await expect(
          page
            .locator('#listTable-task-history')
            .getByRole('button', { name: 'Correction approved' })
        ).toBeVisible()
      })
    })
  })
})