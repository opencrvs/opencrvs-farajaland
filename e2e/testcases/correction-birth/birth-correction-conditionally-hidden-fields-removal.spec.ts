import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  formatDateObjectTo_dMMMMyyyy,
  getRandomDate,
  goBackToReview,
  goToSection,
  login,
  selectDeclarationAction,
  switchEventTab,
  uploadImage,
  uploadImageToSection
} from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../constants'
import { fillDate, formatV2ChildName } from '../birth/helpers'
import {
  ensureAssigned,
  ensureOutboxIsEmpty,
  expectInUrl,
  selectAction
} from '../../utils'

test.describe
  .serial('Birth declaration case - Conditional Hidden Fields Removal', () => {
  let page: Page

  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName(),
        familyName: faker.person.lastName()
      },
      gender: 'Unknown',
      birthDate: getRandomDate(0, 200)
    },
    attendantAtBirth: 'Midwife',
    birthType: 'Triplet',
    placeOfBirth: 'Health Institution',
    birthLocation: {
      facility: 'Ibombo Rural Health Centre',
      district: 'Ibombo',
      province: 'Central',
      country: 'Farajaland'
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
        country: 'Farajaland',
        province: 'Sulaka',
        district: 'Irundu'
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
        sameAsMother: true
      }
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('Declaration started by RA', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Fill child details', async () => {
      await page.locator('#firstname').fill(declaration.child.name.firstNames)
      await page.locator('#surname').fill(declaration.child.name.familyName)
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
        .locator('#child____birthLocation')
        .fill(declaration.birthLocation.facility.slice(0, 3))
      await page.getByText(declaration.birthLocation.facility).click()

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

    test('Fill informant details', async () => {
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
        .locator('#firstname')
        .fill(declaration.informant.name.firstNames)
      await page.locator('#surname').fill(declaration.informant.name.familyName)

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

    test("Fill mother's details", async () => {
      await page.locator('#firstname').fill(declaration.mother.name.firstNames)
      await page.locator('#surname').fill(declaration.mother.name.familyName)

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

      await page.locator('#province').click()
      await page
        .getByText(declaration.mother.address.province, { exact: true })
        .click()
      await page.locator('#district').click()
      await page
        .getByText(declaration.mother.address.district, { exact: true })
        .click()

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

    test("Fill father's details", async () => {
      await page.locator('#firstname').fill(declaration.father.name.firstNames)
      await page.locator('#surname').fill(declaration.father.name.familyName)

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

      await page.locator('#father____addressSameAs_YES').click()

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

    test.describe('Add supporting documents', async () => {
      test('Go to supporting documents page', async () => {
        await goToSection(page, 'documents')
      })

      test('Upload proof of birth', async () => {
        await uploadImage(
          page,
          page.locator('button[name="documents____proofOfBirth"]')
        )
      })

      test("Upload proof of mother's id", async () => {
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

      test("Upload proof of father's id", async () => {
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

      test("Upload proof of informant's id", async () => {
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

      test('Upload other supporting documents', async () => {
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

    test('Go to Review page', async () => {
      await goToSection(page, 'review')
    })

    test('Verify information on review page', async () => {
      /*
       * Wait for all async data to finish loading before asserting.
       * The review page resolves location names (province, district, facility)
       * via API calls after navigation — assertions on those fields fail in CI
       * if we start before the network settles.
       */
      await page.waitForLoadState('networkidle')

      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.getByTestId('row-value-child.name')).toHaveText(
        declaration.child.name.firstNames +
          ' ' +
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

      await expect(
        page.getByTestId('row-value-child.birthLocation')
      ).toHaveText(
        [
          declaration.birthLocation.facility,
          declaration.birthLocation.district,
          declaration.birthLocation.province,
          declaration.birthLocation.country
        ].join(', ')
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
      await expect(page.getByTestId('row-value-informant.name')).toHaveText(
        declaration.informant.name.firstNames +
          ' ' +
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
       * - Mother's First Name
       * - Mother's Family Name
       */
      await expect(page.getByTestId('row-value-mother.name')).toHaveText(
        declaration.mother.name.firstNames +
          ' ' +
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
       * - Father's First Name
       * - Father's Family Name
       */
      await expect(page.getByTestId('row-value-father.name')).toHaveText(
        declaration.father.name.firstNames +
          ' ' +
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
    })

    test('Fill up informant comment and signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('Declare', async () => {
      await selectDeclarationAction(page, 'Declare')
      await ensureOutboxIsEmpty(page)
    })
  })

  test.describe('Review and update declaration by Local Registrar', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.REGISTRAR)
      await page.getByRole('button', { name: 'Pending registration' }).click()
      await page
        .getByRole('button', {
          name: formatV2ChildName({
            'child.name': {
              firstname: declaration.child.name.firstNames,
              surname: declaration.child.name.familyName
            }
          })
        })
        .click()
      await ensureAssigned(page)
    })
    test("update mother's profession", async () => {
      await selectAction(page, 'Edit')
      await page.getByTestId('change-button-mother.occupation').click()
      await page.locator('#mother____occupation').fill('House Wife')
      await goBackToReview(page)
    })

    test('Register the birth', async () => {
      await selectDeclarationAction(page, 'Register with edits')
      // Should redirect back to Ready for review workqueue
      await page.waitForURL(`**/workqueue/pending-registration`)
      await expectInUrl(page, '/workqueue/pending-registration')
    })

    test('Check if mother occupation is updated', async () => {
      await page.getByRole('button', { name: 'Pending certification' }).click()
      await page
        .getByRole('button', {
          name: formatV2ChildName({
            'child.name': {
              firstname: declaration.child.name.firstNames,
              surname: declaration.child.name.familyName
            }
          })
        })
        .click()
      await switchEventTab(page, 'Record')
      await expect(page.getByTestId('row-value-mother.occupation')).toHaveText(
        'House Wife'
      )

      await page.getByTestId('exit-event').click()
    })

    test('Search by informant name', async () => {
      await page
        .locator('#searchText')
        .fill(
          declaration.informant.name.firstNames +
            ' ' +
            declaration.informant.name.familyName
        )

      await page.locator('#searchIconButton').click()
      await expect(
        page.getByRole('button', {
          name: formatV2ChildName({
            'child.name': {
              firstname: declaration.child.name.firstNames,
              surname: declaration.child.name.familyName
            }
          })
        })
      ).toBeVisible()
    })

    test('Correct the informant info', async () => {
      await page
        .getByRole('button', {
          name: formatV2ChildName({
            'child.name': {
              firstname: declaration.child.name.firstNames,
              surname: declaration.child.name.familyName
            }
          })
        })
        .click()
      await selectAction(page, 'Correct')
      await page.locator('#requester____type').click()
      await page.getByText('Informant (Grandfather)', { exact: true }).click()

      await page.locator('#reason____option').click()
      await page
        .getByText('Myself or an agent made a mistake (Clerical error)', {
          exact: true
        })
        .click()

      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Verified' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Fill in the fees form', async () => {
      const fee = faker.number.int({ min: 1, max: 10 })
      await page.locator('#fees____amount').fill(fee.toString())

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Change informant to mother', async () => {
      await page.getByTestId('change-button-informant.relation').click()
      await page.locator('#informant____relation').click()
      await page
        .getByText('Mother', {
          exact: true
        })
        .click()
      await page.locator('#informant____email').fill(declaration.informantEmail)
      await page.getByRole('button', { name: 'Back to review' }).click()
    })

    test('Submit correction', async () => {
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByTestId('make-correction').click()

      await expect(page.getByText('Correct record?')).toBeVisible()

      await page.getByRole('button', { name: 'Confirm', exact: true }).click()
      await page.getByTestId('exit-event').click()
      await page.getByRole('button', { name: 'Pending certification' }).click()
      await expect(
        page.getByRole('button', {
          name: formatV2ChildName({
            'child.name': {
              firstname: declaration.child.name.firstNames,
              surname: declaration.child.name.familyName
            }
          })
        })
      ).toBeVisible()
    })

    test('Search by informant name should not get any result', async () => {
      await page
        .locator('#searchText')
        .fill(
          declaration.informant.name.firstNames +
            ' ' +
            declaration.informant.name.familyName
        )

      await page.locator('#searchIconButton').click()
      await expect(
        page.getByRole('button', {
          name: formatV2ChildName({
            'child.name': {
              firstname: declaration.child.name.firstNames,
              surname: declaration.child.name.familyName
            }
          })
        })
      ).not.toBeVisible()
    })
  })
})
