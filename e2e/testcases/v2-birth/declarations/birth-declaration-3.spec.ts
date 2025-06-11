import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  formatDateObjectTo_dMMMMyyyy,
  formatName,
  getRandomDate,
  goToSection,
  loginToV2,
  logout,
  uploadImage,
  uploadImageToSection
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS, SAFE_WORKQUEUE_TIMEOUT_MS } from '../../../constants'
import { fillDate, validateAddress } from '../helpers'
import { selectAction } from '../../../v2-utils'

test.describe.serial('3. Birth declaration case - 3', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName() + '_Peter',
        familyName: faker.person.lastName()
      },
      gender: 'Unknown',
      birthDate: getRandomDate(0, 200)
    },
    attendantAtBirth: 'Midwife',
    birthType: 'Triplet',
    placeOfBirth: 'Residential address',
    birthLocation: {
      country: 'Farajaland',
      province: 'Pualula',
      district: 'Funabuli',
      urbanOrRural: 'Rural',
      village: faker.location.county()
    },
    informantType: 'Grandfather',
    informantEmail: faker.internet.email(),
    informant: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      birthDate: getRandomDate(40, 200),
      nationality: 'Farajaland',
      identifier: {
        id: faker.string.numeric(10),
        type: 'National ID'
      },
      address: {
        country: 'Farajaland',
        province: 'Chuminga',
        district: 'Ama',
        urbanOrRural: 'Urban',
        town: faker.location.city(),
        residentialArea: faker.location.county(),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      }
    },
    mother: {
      name: {
        firstNames: faker.person.firstName('female'),
        familyName: faker.person.lastName('female')
      },
      birthDate: getRandomDate(20, 200),
      nationality: 'Farajaland',
      identifier: {
        id: faker.string.numeric(9),
        type: 'Birth Registration Number'
      },
      address: {
        country: 'Djibouti',
        state: faker.location.state(),
        district: faker.location.county(),
        town: faker.location.city(),
        addressLine1: faker.location.county(),
        addressLine2: faker.location.street(),
        addressLine3: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      },
      maritalStatus: 'Widowed',
      levelOfEducation: 'Secondary'
    },
    father: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      birthDate: getRandomDate(22, 200),
      nationality: 'Gabon',
      identifier: {
        id: faker.string.numeric(11),
        type: 'Birth Registration Number'
      },
      maritalStatus: 'Widowed',
      levelOfEducation: 'Secondary',
      address: {
        sameAsMother: false,
        country: 'Farajaland',
        province: 'Chuminga',
        district: 'Nsali',
        urbanOrRural: 'Rural',
        village: faker.location.county()
      }
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('3.1 Declaration started by RA', async () => {
    test.beforeAll(async () => {
      await loginToV2(page, CREDENTIALS.REGISTRATION_AGENT)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('3.1.1 Fill child details', async () => {
      await page
        .locator('#child____firstname')
        .fill(declaration.child.name.firstNames)
      await page
        .locator('#child____surname')
        .fill(declaration.child.name.familyName)
      await page.locator('#child____gender').click()
      await page.getByText(declaration.child.gender, { exact: true }).click()

      await page.getByPlaceholder('dd').fill(declaration.child.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.child.birthDate.mm)
      await page.getByPlaceholder('yyyy').fill(declaration.child.birthDate.yyyy)

      await page.locator('#child____placeOfBirth').click()
      await page
        .getByText(declaration.placeOfBirth, {
          exact: true
        })
        .click()
      await page
        .locator('#child____address____privateHome-form-input #province')
        .click()
      await page
        .getByText(declaration.birthLocation.province, {
          exact: true
        })
        .click()

      await page
        .locator('#child____address____privateHome-form-input #district')
        .click()
      await page
        .getByText(declaration.birthLocation.district, {
          exact: true
        })
        .click()
      await page.getByLabel(declaration.birthLocation.urbanOrRural).check()
      await page.locator('#village').fill(declaration.birthLocation.village)

      await page.locator('#child____attendantAtBirth').click()
      await page
        .getByText(declaration.attendantAtBirth, {
          exact: true
        })
        .click()

      await page.locator('#child____birthType').click()
      await page
        .getByText(declaration.birthType, {
          exact: true
        })
        .click()

      await continueForm(page)
    })

    test('3.1.2 Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.locator('#informant____email').fill(declaration.informantEmail)

      /*
       * Expected result: should show additional fields:
       * - Full Name
       * - Date of birth
       * - Nationality
       * - Id
       * - Usual place of residence
       */
      await page
        .locator('#informant____firstname')
        .fill(declaration.informant.name.firstNames)
      await page
        .locator('#informant____surname')
        .fill(declaration.informant.name.familyName)

      await page.getByPlaceholder('dd').fill(declaration.informant.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.informant.birthDate.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.informant.birthDate.yyyy)

      await page.locator('#informant____idType').click()
      await page
        .getByText(declaration.informant.identifier.type, { exact: true })
        .click()

      await page
        .locator('#informant____nid')
        .fill(declaration.informant.identifier.id)

      await page.locator('#province').click()
      await page
        .getByText(declaration.informant.address.province, { exact: true })
        .click()
      await page.locator('#district').click()
      await page
        .getByText(declaration.informant.address.district, { exact: true })
        .click()

      await page.locator('#town').fill(declaration.informant.address.town)
      await page
        .locator('#residentialArea')
        .fill(declaration.informant.address.residentialArea)
      await page.locator('#street').fill(declaration.informant.address.street)
      await page.locator('#number').fill(declaration.informant.address.number)
      await page
        .locator('#zipCode')
        .fill(declaration.informant.address.postcodeOrZip)
      await continueForm(page)
    })

    test("3.1.3 Fill mother's details", async () => {
      await page
        .locator('#mother____firstname')
        .fill(declaration.mother.name.firstNames)
      await page
        .locator('#mother____surname')
        .fill(declaration.mother.name.familyName)

      await page.getByPlaceholder('dd').fill(declaration.mother.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.mother.birthDate.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.mother.birthDate.yyyy)

      await page.locator('#mother____idType').click()
      await page
        .getByText(declaration.mother.identifier.type, { exact: true })
        .click()

      await page
        .locator('#mother____brn')
        .fill(declaration.mother.identifier.id)

      await page.locator('#country').click()
      await page
        .locator('#country input')
        .fill(declaration.mother.address.country.slice(0, 3))
      await page
        .locator('#country')
        .getByText(declaration.mother.address.country, { exact: true })
        .click()

      await page.locator('#state').fill(declaration.mother.address.state)
      await page.locator('#district2').fill(declaration.mother.address.district)
      await page.locator('#cityOrTown').fill(declaration.mother.address.town)
      await page
        .locator('#addressLine1')
        .fill(declaration.mother.address.addressLine1)
      await page
        .locator('#addressLine2')
        .fill(declaration.mother.address.addressLine2)
      await page
        .locator('#addressLine3')
        .fill(declaration.mother.address.addressLine3)
      await page
        .locator('#postcodeOrZip')
        .fill(declaration.mother.address.postcodeOrZip)

      await page.locator('#mother____maritalStatus').click()
      await page
        .getByText(declaration.mother.maritalStatus, { exact: true })
        .click()

      await page.locator('#mother____educationalAttainment').click()
      await page
        .getByText(declaration.mother.levelOfEducation, { exact: true })
        .click()

      await continueForm(page)
    })

    test("3.1.4 Fill father's details", async () => {
      await page
        .locator('#father____firstname')
        .fill(declaration.father.name.firstNames)
      await page
        .locator('#father____surname')
        .fill(declaration.father.name.familyName)

      await fillDate(page, declaration.father.birthDate)

      await page.locator('#father____idType').click()
      await page
        .getByText(declaration.father.identifier.type, { exact: true })
        .click()

      await page
        .locator('#father____brn')
        .fill(declaration.father.identifier.id)

      await page.locator('#father____nationality').click()
      await page
        .getByText(declaration.father.nationality, { exact: true })
        .click()

      await page.getByLabel('No', { exact: true }).check()
      await page.locator('#province').click()
      await page
        .getByText(declaration.father.address.province, { exact: true })
        .click()
      await page.locator('#district').click()
      await page
        .getByText(declaration.father.address.district, { exact: true })
        .click()
      await page.getByLabel(declaration.father.address.urbanOrRural).check()
      await page.locator('#village').fill(declaration.father.address.village)

      await page.locator('#father____maritalStatus').click()
      await page
        .getByText(declaration.father.maritalStatus, { exact: true })
        .click()

      await page.locator('#father____educationalAttainment').click()
      await page
        .getByText(declaration.father.levelOfEducation, { exact: true })
        .click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test.describe('3.1.5 Add supporting documents', async () => {
      test('3.1.5.0 Go to supporting documents page', async () => {
        await goToSection(page, 'documents')
      })

      test('3.1.5.1 Upload proof of birth', async () => {
        await uploadImage(
          page,
          page.locator('button[name="documents____proofOfBirth"]')
        )
      })

      test("3.1.5.2 Upload proof of mother's id", async () => {
        const imageUploadSectionTitles = [
          'National ID',
          'Passport',
          'Birth Certificate',
          'Other'
        ]

        for (const sectionTitle of imageUploadSectionTitles) {
          await uploadImageToSection({
            page,
            sectionLocator: page.locator('#documents____proofOfMother'),
            sectionTitle,
            buttonLocator: page.locator(
              'button[name="documents____proofOfMother"]'
            )
          })
        }
      })

      test("3.1.5.3 Upload proof of father's id", async () => {
        const imageUploadSectionTitles = [
          'National ID',
          'Passport',
          'Birth Certificate',
          'Other'
        ]

        for (const sectionTitle of imageUploadSectionTitles) {
          await uploadImageToSection({
            page,
            sectionLocator: page.locator('#documents____proofOfFather'),
            sectionTitle,
            buttonLocator: page.locator(
              'button[name="documents____proofOfFather"]'
            )
          })
        }
      })

      test("3.1.5.4 Upload proof of informant's id", async () => {
        const imageUploadSectionTitles = [
          'National ID',
          'Passport',
          'Birth Certificate',
          'Other'
        ]

        for (const sectionTitle of imageUploadSectionTitles) {
          await uploadImageToSection({
            page,
            sectionLocator: page.locator('#documents____proofOfInformant'),
            sectionTitle,
            buttonLocator: page.locator(
              'button[name="documents____proofOfInformant"]'
            )
          })
        }
      })

      test('3.1.5.5 Upload other', async () => {
        const imageUploadSectionTitles = [
          'Proof of legal guardianship',
          'Proof of assigned responsibility'
        ]

        for (const sectionTitle of imageUploadSectionTitles) {
          await uploadImageToSection({
            page,
            sectionLocator: page.locator('#documents____proofOther'),
            sectionTitle,
            buttonLocator: page.locator(
              'button[name="documents____proofOther"]'
            )
          })
        }
      })
    })

    test('3.1.6 Go to Review', async () => {
      await goToSection(page, 'review')
    })

    test('3.1.7 Verify information on review page', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.getByTestId('row-value-child.firstname')).toHaveText(
        declaration.child.name.firstNames
      )

      await expect(page.getByTestId('row-value-child.surname')).toHaveText(
        declaration.child.name.familyName
      )

      /*
       * Expected result: should include
       * - Child's Gender
       */
      await expect(page.getByTestId('row-value-child.gender')).toHaveText(
        declaration.child.gender
      )

      /*
       * Expected result: should include
       * - Child's date of birth
       */
      await expect(page.getByTestId('row-value-child.dob')).toHaveText(
        formatDateObjectTo_dMMMMyyyy(declaration.child.birthDate)
      )

      /*
       * Expected result: should include
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(page.getByTestId('row-value-child.placeOfBirth')).toHaveText(
        declaration.placeOfBirth
      )

      await validateAddress(
        page,
        declaration.birthLocation,
        'row-value-child.address.privateHome'
      )

      /*
       * Expected result: should include
       * - Child's Attendant at birth
       */
      await expect(
        page.getByTestId('row-value-child.attendantAtBirth')
      ).toHaveText(declaration.attendantAtBirth)

      /*
       * Expected result: should include
       * - Child's Birth type
       */
      await expect(page.getByTestId('row-value-child.birthType')).toHaveText(
        declaration.birthType
      )

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expect(page.getByTestId('row-value-informant.relation')).toHaveText(
        declaration.informantType
      )

      /*
       * Expected result: should include
       * - Informant's Email
       */
      await expect(page.getByTestId('row-value-informant.email')).toHaveText(
        declaration.informantEmail
      )
      /*
       * Expected result: should include
       * - Informant's First Name
       * - Informant's Family Name
       */
      await expect(
        page.getByTestId('row-value-informant.firstname')
      ).toHaveText(declaration.informant.name.firstNames)
      await expect(page.getByTestId('row-value-informant.surname')).toHaveText(
        declaration.informant.name.familyName
      )
      /*
       * Expected result: should include
       * - Informant's date of birth
       */
      await expect(page.getByTestId('row-value-informant.dob')).toHaveText(
        formatDateObjectTo_dMMMMyyyy(declaration.informant.birthDate)
      )

      /*
       * Expected result: should include
       * - Informant's Nationality
       */
      await expect(
        page.getByTestId('row-value-informant.nationality')
      ).toHaveText(declaration.informant.nationality)

      /*
       * Expected result: should include
       * - Informant's address
       */
      await validateAddress(
        page,
        declaration.informant.address,
        'row-value-informant.address'
      )

      /*
       * Expected result: should include
       * - Mother's First Name
       * - Mother's Family Name
       */
      await expect(page.getByTestId('row-value-mother.firstname')).toHaveText(
        declaration.mother.name.firstNames
      )

      await expect(page.getByTestId('row-value-mother.surname')).toHaveText(
        declaration.mother.name.familyName
      )

      /*
       * Expected result: should include
       * - Mother's date of birth
       */
      await expect(page.getByTestId('row-value-mother.dob')).toHaveText(
        formatDateObjectTo_dMMMMyyyy(declaration.mother.birthDate)
      )

      /*
       * Expected result: should include
       * - Mother's Nationality
       */
      await expect(page.getByTestId('row-value-mother.nationality')).toHaveText(
        declaration.mother.nationality
      )

      /*
       * Expected result: should include
       * - Mother's Marital status
       */
      await expect(
        page.getByTestId('row-value-mother.maritalStatus')
      ).toHaveText(declaration.mother.maritalStatus)

      /*
       * Expected result: should include
       * - Mother's level of education
       */
      await expect(
        page.getByTestId('row-value-mother.educationalAttainment')
      ).toHaveText(declaration.mother.levelOfEducation)

      /*
       * Expected result: should include
       * - Mother's Type of Id
       * - Mother's Id Number
       */
      await expect(page.getByTestId('row-value-mother.idType')).toHaveText(
        declaration.mother.identifier.type
      )

      await expect(page.getByTestId('row-value-mother.brn')).toHaveText(
        declaration.mother.identifier.id
      )

      /*
       * Expected result: should include
       * - Mother's address
       */
      await validateAddress(
        page,
        declaration.mother.address,
        'row-value-mother.address'
      )

      /*
       * Expected result: should include
       * - Father's First Name
       * - Father's Family Name
       */
      await expect(page.getByTestId('row-value-father.firstname')).toHaveText(
        declaration.father.name.firstNames
      )

      await expect(page.getByTestId('row-value-father.surname')).toHaveText(
        declaration.father.name.familyName
      )

      /*
       * Expected result: should include
       * - Father's date of birth
       */
      await expect(page.getByTestId('row-value-father.dob')).toHaveText(
        formatDateObjectTo_dMMMMyyyy(declaration.father.birthDate)
      )

      /*
       * Expected result: should include
       * - Father's Nationality
       */
      await expect(page.getByTestId('row-value-father.nationality')).toHaveText(
        declaration.father.nationality
      )

      /*
       * Expected result: should include
       * - Father's Type of Id
       * - Father's Id Number
       */
      await expect(page.getByTestId('row-value-father.idType')).toHaveText(
        declaration.father.identifier.type
      )

      await expect(page.getByTestId('row-value-father.brn')).toHaveText(
        declaration.father.identifier.id
      )

      /*
       * Expected result: should include
       * - Father's Marital status
       */
      await expect(
        page.getByTestId('row-value-father.maritalStatus')
      ).toHaveText(declaration.father.maritalStatus)

      /*
       * Expected result: should include
       * - Father's level of education
       */
      await expect(
        page.getByTestId('row-value-father.educationalAttainment')
      ).toHaveText(declaration.father.levelOfEducation)

      /*
       * Expected result: should include
       * - Father's address
       */
      await validateAddress(
        page,
        declaration.father.address,
        'row-value-father.address'
      )
    })

    test('3.1.8 Fill up informant comment & signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign' }).click()
      await drawSignature(page, true)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('3.1.9 Send for approval', async () => {
      await page.getByRole('button', { name: 'Send for approval' }).click()
      await expect(page.getByText('Send for approval?')).toBeVisible()
      await page.getByRole('button', { name: 'Confirm' }).click()

      await page.waitForTimeout(SAFE_WORKQUEUE_TIMEOUT_MS) // wait for the event to be in the workqueue. Handle better after outbox workqueue is implemented
      await page.getByText('Sent for approval').click()

      await expect(
        page.getByRole('button', {
          name: formatName(declaration.child.name)
        })
      ).toBeVisible()
    })
  })

  test.describe('3.2 Declaration Review by Local Registrar', async () => {
    test('3.2.1 Navigate to the declaration review page', async () => {
      await logout(page)
      await loginToV2(page, CREDENTIALS.LOCAL_REGISTRAR)

      await page.waitForTimeout(SAFE_WORKQUEUE_TIMEOUT_MS) // wait for the event to be in the workqueue. Handle better after outbox workqueue is implemented
      await page.getByText('Ready for review').click()

      await page
        .getByRole('button', {
          name: formatName(declaration.child.name)
        })
        .click()

      await selectAction(page, 'Register')
    })

    test('3.2.2 Verify information on review page', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.getByTestId('row-value-child.firstname')).toHaveText(
        declaration.child.name.firstNames
      )

      await expect(page.getByTestId('row-value-child.surname')).toHaveText(
        declaration.child.name.familyName
      )

      /*
       * Expected result: should include
       * - Child's Gender
       */
      await expect(page.getByTestId('row-value-child.gender')).toHaveText(
        declaration.child.gender
      )

      /*
       * Expected result: should include
       * - Child's date of birth
       */
      await expect(page.getByTestId('row-value-child.dob')).toHaveText(
        formatDateObjectTo_dMMMMyyyy(declaration.child.birthDate)
      )

      /*
       * Expected result: should include
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(page.getByTestId('row-value-child.placeOfBirth')).toHaveText(
        declaration.placeOfBirth
      )

      await validateAddress(
        page,
        declaration.birthLocation,
        'row-value-child.address.privateHome'
      )

      /*
       * Expected result: should include
       * - Child's Attendant at birth
       */
      await expect(
        page.getByTestId('row-value-child.attendantAtBirth')
      ).toHaveText(declaration.attendantAtBirth)

      /*
       * Expected result: should include
       * - Child's Birth type
       */
      await expect(page.getByTestId('row-value-child.birthType')).toHaveText(
        declaration.birthType
      )

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expect(page.getByTestId('row-value-informant.relation')).toHaveText(
        declaration.informantType
      )

      /*
       * Expected result: should include
       * - Informant's Email
       */
      await expect(page.getByTestId('row-value-informant.email')).toHaveText(
        declaration.informantEmail
      )
      /*
       * Expected result: should include
       * - Informant's First Name
       * - Informant's Family Name
       */
      await expect(
        page.getByTestId('row-value-informant.firstname')
      ).toHaveText(declaration.informant.name.firstNames)
      await expect(page.getByTestId('row-value-informant.surname')).toHaveText(
        declaration.informant.name.familyName
      )
      /*
       * Expected result: should include
       * - Informant's date of birth
       */
      await expect(page.getByTestId('row-value-informant.dob')).toHaveText(
        formatDateObjectTo_dMMMMyyyy(declaration.informant.birthDate)
      )

      /*
       * Expected result: should include
       * - Informant's Nationality
       */
      await expect(
        page.getByTestId('row-value-informant.nationality')
      ).toHaveText(declaration.informant.nationality)

      /*
       * Expected result: should include
       * - Informant's address
       */
      await validateAddress(
        page,
        declaration.informant.address,
        'row-value-informant.address'
      )

      /*
       * Expected result: should include
       * - Mother's First Name
       * - Mother's Family Name
       */
      await expect(page.getByTestId('row-value-mother.firstname')).toHaveText(
        declaration.mother.name.firstNames
      )

      await expect(page.getByTestId('row-value-mother.surname')).toHaveText(
        declaration.mother.name.familyName
      )

      /*
       * Expected result: should include
       * - Mother's date of birth
       */
      await expect(page.getByTestId('row-value-mother.dob')).toHaveText(
        formatDateObjectTo_dMMMMyyyy(declaration.mother.birthDate)
      )

      /*
       * Expected result: should include
       * - Mother's Nationality
       */
      await expect(page.getByTestId('row-value-mother.nationality')).toHaveText(
        declaration.mother.nationality
      )

      /*
       * Expected result: should include
       * - Mother's Marital status
       */
      await expect(
        page.getByTestId('row-value-mother.maritalStatus')
      ).toHaveText(declaration.mother.maritalStatus)

      /*
       * Expected result: should include
       * - Mother's level of education
       */
      await expect(
        page.getByTestId('row-value-mother.educationalAttainment')
      ).toHaveText(declaration.mother.levelOfEducation)

      /*
       * Expected result: should include
       * - Mother's Type of Id
       * - Mother's Id Number
       */
      await expect(page.getByTestId('row-value-mother.idType')).toHaveText(
        declaration.mother.identifier.type
      )

      await expect(page.getByTestId('row-value-mother.brn')).toHaveText(
        declaration.mother.identifier.id
      )

      /*
       * Expected result: should include
       * - Mother's address
       */
      await validateAddress(
        page,
        declaration.mother.address,
        'row-value-mother.address'
      )

      /*
       * Expected result: should include
       * - Father's First Name
       * - Father's Family Name
       */
      await expect(page.getByTestId('row-value-father.firstname')).toHaveText(
        declaration.father.name.firstNames
      )

      await expect(page.getByTestId('row-value-father.surname')).toHaveText(
        declaration.father.name.familyName
      )

      /*
       * Expected result: should include
       * - Father's date of birth
       */
      await expect(page.getByTestId('row-value-father.dob')).toHaveText(
        formatDateObjectTo_dMMMMyyyy(declaration.father.birthDate)
      )

      /*
       * Expected result: should include
       * - Father's Nationality
       */
      await expect(page.getByTestId('row-value-father.nationality')).toHaveText(
        declaration.father.nationality
      )

      /*
       * Expected result: should include
       * - Father's Type of Id
       * - Father's Id Number
       */
      await expect(page.getByTestId('row-value-father.idType')).toHaveText(
        declaration.father.identifier.type
      )

      await expect(page.getByTestId('row-value-father.brn')).toHaveText(
        declaration.father.identifier.id
      )

      /*
       * Expected result: should include
       * - Father's Marital status
       */
      await expect(
        page.getByTestId('row-value-father.maritalStatus')
      ).toHaveText(declaration.father.maritalStatus)

      /*
       * Expected result: should include
       * - Father's level of education
       */
      await expect(
        page.getByTestId('row-value-father.educationalAttainment')
      ).toHaveText(declaration.father.levelOfEducation)

      /*
       * Expected result: should include
       * - Father's address
       */
      await validateAddress(
        page,
        declaration.father.address,
        'row-value-father.address'
      )
    })
  })
})
