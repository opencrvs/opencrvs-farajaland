import { expect, test, type Page } from '@playwright/test'
import { createPIN, getToken, login, uploadImage } from '../../../helpers'
import faker from '@faker-js/faker'
import { format, parseISO, subDays } from 'date-fns'
import { DeathDeclaration } from '../../death/types'
import { createDeathDeclaration, fetchDeclaration } from '../../death/helpers'

test.describe.serial(' Correct record - 13', () => {
  let declaration: DeathDeclaration
  let trackingId = ''

  let page: Page

  const updatedSpouseDetails = {
    firstNames: faker.name.firstName('female'),
    familyName: faker.name.firstName('female'),
    birthDate: format(
      subDays(new Date(), Math.ceil(50 * Math.random() + 365 * 25)),
      'yyyy-MM-dd'
    ),
    email: faker.internet.email(),
    nationality: 'Nauru',
    id: faker.random.numeric(10),
    idType: 'Passport',
    address: {
      sameAsDeceased: false,
      province: 'Pualula',
      district: 'Ienge',
      town: faker.address.city(),
      residentialArea: faker.address.county(),
      street: faker.address.streetName(),
      number: faker.address.buildingNumber(),
      zipCode: faker.address.zipCode()
    }
  }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('13.0 Shortcut declaration', async () => {
    let token = await getToken('j.musonda', 'test')

    const res = await createDeathDeclaration(token)
    expect(res).toStrictEqual({
      trackingId: expect.any(String),
      compositionId: expect.any(String),
      isPotentiallyDuplicate: false,
      __typename: 'CreatedIds'
    })

    trackingId = res.trackingId

    token = await getToken('k.mweene', 'test')

    declaration = (await fetchDeclaration(token, res.compositionId)).data
      .fetchDeathRegistration as DeathDeclaration
  })

  test('13.1 Ready to print > record audit', async () => {
    await login(page, 'k.mweene', 'test')
    await createPIN(page)

    await page.getByPlaceholder('Search for a tracking ID').fill(trackingId)
    await page.getByPlaceholder('Search for a tracking ID').press('Enter')
    await page.locator('#ListItemAction-0-icon').click()
    await page.locator('#name_0').click()

    await page
      .getByRole('button', { name: 'Correct record', exact: true })
      .click()
  })

  test('13.2 Correction requester: Someone Else (Cousin)', async () => {
    await page.getByLabel('Someone Else').check()
    await page.getByPlaceholder('Eg. Grandmother').fill('Cousin')
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('13.3 Verify identity', async () => {
    /*
     * Expected result: should Confirm
     * nothing
     */

    await page.getByRole('button', { name: 'Verified' }).click()

    /*
     * Expected result: should navigate to review page
     */
    expect(page.url().includes('correction')).toBeTruthy()
    expect(page.url().includes('review')).toBeTruthy()
  })

  test.describe('13.4 Correction made on spouse details', async () => {
    test('13.4.1 Change name', async () => {
      await page
        .locator('#spouse-content #Full')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to spouse's details page
       * - focus on spouse's family name
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('spouse-view-group')).toBeTruthy()
      expect(page.url().includes('#familyNameEng')).toBeTruthy()

      await page.locator('#firstNamesEng').fill(updatedSpouseDetails.firstNames)
      await page.locator('#familyNameEng').fill(updatedSpouseDetails.familyName)

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
        .locator('#spouse-content #Full')
        .getByRole('deletion')
        .all()

      await expect(oldData[0]).toHaveText(declaration.spouse.name[0].firstNames)
      await expect(oldData[1]).toHaveText(declaration.spouse.name[0].familyName)

      await expect(
        page
          .locator('#spouse-content #Full')
          .getByText(updatedSpouseDetails.firstNames)
      ).toBeVisible()
      await expect(
        page
          .locator('#spouse-content #Full')
          .getByText(updatedSpouseDetails.familyName)
      ).toBeVisible()
    })

    test('13.4.2 Change date of birth', async () => {
      await page
        .locator('#spouse-content #Date')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to spouse's details page
       * - focus on spouse's date of birth
       */
      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('spouse-view-group')).toBeTruthy()
      expect(page.url().includes('#spouseBirthDate')).toBeTruthy()

      const birthDay = updatedSpouseDetails.birthDate.split('-')

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
        page.locator('#spouse-content #Date').getByRole('deletion')
      ).toHaveText(
        format(parseISO(declaration.spouse.birthDate), 'dd MMMM yyyy'),
        { ignoreCase: true }
      )

      await expect(
        page
          .locator('#spouse-content #Date')
          .getByText(
            format(parseISO(updatedSpouseDetails.birthDate), 'dd MMMM yyyy')
          )
      ).toBeVisible()
    })

    test('13.4.3 Change nationality', async () => {
      await page
        .locator('#spouse-content #Nationality')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to spouse's details page
       * - focus on spouse's nationality
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('spouse-view-group')).toBeTruthy()
      expect(page.url().includes('#nationality')).toBeTruthy()

      await page.locator('#nationality').click()
      await page.getByText(updatedSpouseDetails.nationality).click()

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
        page.locator('#spouse-content #Nationality').getByRole('deletion')
      ).toHaveText('Farajaland', {
        ignoreCase: true
      })

      await expect(
        page
          .locator('#spouse-content #Nationality')
          .getByText(updatedSpouseDetails.nationality)
      ).toBeVisible()
    })

    test('13.4.4 Change id type', async () => {
      await page
        .locator('#spouse-content #Type')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to spouse's details page
       * - focus on spouse's id type
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('spouse-view-group')).toBeTruthy()
      expect(page.url().includes('#spouseIdType')).toBeTruthy()

      await page.locator('#spouseIdType').click()
      await page.getByText(updatedSpouseDetails.idType).click()

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
        page.locator('#spouse-content #Type').getByRole('deletion')
      ).toHaveText('National Id', {
        ignoreCase: true
      })

      await expect(
        page
          .locator('#spouse-content #Type')
          .getByText(updatedSpouseDetails.idType)
      ).toBeVisible()
    })

    test('13.4.5 Change id', async () => {
      await page
        .locator('#spouse-content #ID')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to spouse's details page
       * - focus on spouse's id
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('spouse-view-group')).toBeTruthy()
      expect(page.url().includes('#spousePassport')).toBeTruthy()

      await page.locator('#spousePassport').fill(updatedSpouseDetails.id)

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
        page.locator('#spouse-content #ID').getByText(updatedSpouseDetails.id)
      ).toBeVisible()
    })

    test('13.4.6 Change usual place of residence', async () => {
      await page
        .locator('#spouse-content #Same')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to spouse's details page
       * - focus on spouse's Usual place of resiedence
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('spouse-view-group')).toBeTruthy()
      expect(
        page.url().includes('#primaryAddressSameAsOtherPrimary')
      ).toBeTruthy()

      await page.getByLabel('No', { exact: true }).check()

      await page.locator('#statePrimarySpouse').click()
      await page.getByText(updatedSpouseDetails.address.province).click()

      await page.locator('#districtPrimarySpouse').click()
      await page.getByText(updatedSpouseDetails.address.district).click()

      await page
        .locator('#cityPrimarySpouse')
        .fill(updatedSpouseDetails.address.town)

      await page
        .locator('#addressLine1UrbanOptionPrimarySpouse')
        .fill(updatedSpouseDetails.address.residentialArea)

      await page
        .locator('#addressLine2UrbanOptionPrimarySpouse')
        .fill(updatedSpouseDetails.address.street)

      await page
        .locator('#addressLine3UrbanOptionPrimarySpouse')
        .fill(updatedSpouseDetails.address.number)

      await page
        .locator('#postalCodePrimarySpouse')
        .fill(updatedSpouseDetails.address.zipCode)

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
        page.locator('#spouse-content #Usual').getByRole('deletion').nth(1)
      ).toHaveText('Farajaland', {
        ignoreCase: true
      })
      await expect(
        page.locator('#spouse-content #Usual').getByRole('deletion').nth(2)
      ).toHaveText('Sulaka', { ignoreCase: true })
      await expect(
        page.locator('#spouse-content #Usual').getByRole('deletion').nth(3)
      ).toHaveText('Zobwe', {
        ignoreCase: true
      })
      await expect(
        page.locator('#spouse-content #Usual').getByRole('deletion').nth(5)
      ).toHaveText(declaration.spouse.address[0].city, { ignoreCase: true })
      await expect(
        page.locator('#spouse-content #Usual').getByRole('deletion').nth(6)
      ).toHaveText(declaration.spouse.address[0].line[2], {
        ignoreCase: true
      })
      await expect(
        page.locator('#spouse-content #Usual').getByRole('deletion').nth(7)
      ).toHaveText(declaration.spouse.address[0].line[1], {
        ignoreCase: true
      })
      await expect(
        page.locator('#spouse-content #Usual').getByRole('deletion').nth(8)
      ).toHaveText(declaration.spouse.address[0].line[0], {
        ignoreCase: true
      })
      await expect(
        page.locator('#spouse-content #Usual').getByRole('deletion').nth(9)
      ).toHaveText(declaration.spouse.address[0].postalCode, {
        ignoreCase: true
      })

      await expect(
        page.locator('#spouse-content #Usual').getByText('Farajaland')
      ).toBeVisible()
      await expect(
        page
          .locator('#spouse-content #Usual')
          .getByText(updatedSpouseDetails.address.province)
      ).toBeVisible()
      await expect(
        page
          .locator('#spouse-content #Usual')
          .getByText(updatedSpouseDetails.address.district)
      ).toBeVisible()
      await expect(
        page
          .locator('#spouse-content #Usual')
          .getByText(updatedSpouseDetails.address.town)
      ).toBeVisible()
      await expect(
        page
          .locator('#spouse-content #Usual')
          .getByText(updatedSpouseDetails.address.residentialArea)
      ).toBeVisible()
      await expect(
        page
          .locator('#spouse-content #Usual')
          .getByText(updatedSpouseDetails.address.street)
      ).toBeVisible()
      await expect(
        page
          .locator('#spouse-content #Usual')
          .getByText(updatedSpouseDetails.address.number)
      ).toBeVisible()
      await expect(
        page
          .locator('#spouse-content #Usual')
          .getByText(updatedSpouseDetails.address.zipCode)
      ).toBeVisible()
    })
  })

  test('13.5 Upload supporting documents', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    /*
     * Expected result: should
     * - navigate to supporting document
     * - continue button is disabled
     */
    expect(page.url().includes('correction')).toBeTruthy()

    expect(page.url().includes('supportingDocuments')).toBeTruthy()

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()

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

  test('13.6 Reason for correction', async () => {
    /*
     * Expected result: should
     * - navigate to reason for correction
     * - continue button is disabled
     */
    expect(page.url().includes('correction')).toBeTruthy()

    expect(page.url().includes('reason')).toBeTruthy()

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await page
      .getByLabel('Requested to do so by the court (Judicial order)')
      .check()

    await page
      .locator('#additionalComment')
      .fill(declaration.registration.registrationNumber)

    /*
     * Expected result: should enable the continue button
     */

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('13.7 Correction summary', async () => {
    /*
     * Expected result: should
     * - navigate to correction summary
     * - Make correction button is disabled
     */
    expect(page.url().includes('summary')).toBeTruthy()
    expect(page.url().includes('correction')).toBeTruthy()

    await expect(
      page.getByRole('button', { name: 'Make correction' })
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
        'Full name (Spouse details)' +
          declaration.spouse.name[0].firstNames +
          ' ' +
          declaration.spouse.name[0].familyName +
          updatedSpouseDetails.firstNames +
          ' ' +
          updatedSpouseDetails.familyName
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Date of birth (Spouse details)' +
          format(parseISO(declaration.spouse.birthDate), 'dd MMMM yyyy') +
          format(parseISO(updatedSpouseDetails.birthDate), 'dd MMMM yyyy')
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Nationality (Spouse details)Farajaland' +
          updatedSpouseDetails.nationality
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Type of ID (Spouse details)National ID' + updatedSpouseDetails.idType
      )
    ).toBeVisible()
    await expect(
      page.getByText('ID Number (Spouse details)-' + updatedSpouseDetails.id)
    ).toBeVisible()

    await expect(
      page.getByText(
        'Usual place of residence (Spouse details)FarajalandSulakaZobwe-' +
          declaration.spouse.address[0].city +
          declaration.spouse.address[0].line[2] +
          declaration.spouse.address[0].line[1] +
          declaration.spouse.address[0].line[0] +
          declaration.spouse.address[0].postalCode +
          'Farajaland' +
          updatedSpouseDetails.address.province +
          updatedSpouseDetails.address.district +
          updatedSpouseDetails.address.town +
          updatedSpouseDetails.address.residentialArea +
          updatedSpouseDetails.address.street +
          updatedSpouseDetails.address.number +
          updatedSpouseDetails.address.zipCode
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        "Same as deceased's usual place of residence? (Spouse details)" +
          'Yes' +
          'No'
      )
    ).toBeVisible()

    await expect(page.getByText('Cousin')).toBeVisible()
    await expect(page.getByText('Verified')).toBeVisible()
    await expect(
      page.getByText('Requested to do so by the court (Judicial order)')
    ).toBeVisible()
    await expect(
      page.getByText(declaration.registration.registrationNumber)
    ).toBeVisible()

    await page.getByLabel('Yes').check()
    await page.locator('#correctionFees\\.nestedFields\\.totalFees').fill('15')

    await uploadImage(page, page.locator('#upload_document'))
    /*
     * Expected result: should enable the Make correction button
     */
    await page.getByRole('button', { name: 'Make correction' }).click()

    /*
     * Expected result: should open modal saying
     * Correct record ?
     * The informant will be notified of this correction and a record of this decision will be recorded
     * Cancel button
     * Confirm button
     */

    await expect(page.getByText('Correct record ?')).toBeVisible()
    await expect(
      page.getByText(
        'The informant will be notified of this correction and a record of this decision will be recorded'
      )
    ).toBeVisible()

    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible()

    await page.getByRole('button', { name: 'Confirm' }).click()

    await page.getByRole('button', { name: 'Ready to print' }).click()

    /*
     * Expected result: should
     * - be navigated to ready to print tab
     * - include the declaration in this tab
     */
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
  test('13.8 Validate history in record audit', async () => {
    await page
      .getByText(
        declaration.deceased.name[0].firstNames +
          ' ' +
          declaration.deceased.name[0].familyName
      )
      .click()

    await page.getByLabel('Assign record').click()
    if (
      await page
        .getByRole('button', { name: 'Assign', exact: true })
        .isVisible()
    )
      await page.getByRole('button', { name: 'Assign', exact: true }).click()

    /*
     * Expected result: should show in task history
     * - Record corrected
     */

    await expect(
      page
        .locator('#listTable-task-history')
        .getByRole('button', { name: 'Record corrected' })
    ).toBeVisible()
  })
})