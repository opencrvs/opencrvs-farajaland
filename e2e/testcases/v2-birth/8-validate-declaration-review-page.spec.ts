import { test, expect, type Page } from '@playwright/test'
import {
  drawSignature,
  continueForm,
  getRandomDate,
  goToSection,
  formatName,
  loginToV2,
  formatDateObjectTo_dMMMMyyyy
} from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../constants'
import { fillDate } from './helpers'
import { selectAction } from '../../v2-utils'

test.describe.serial('8. Validate declaration review page', () => {
  let page: Page

  async function expectRowValueWithChangeButton(
    fieldName: string,
    assertionText: string
  ) {
    await expect(page.getByTestId(`row-value-${fieldName}`)).toContainText(
      assertionText
    )

    await expect(page.getByTestId(`change-button-${fieldName}`)).toBeVisible()
  }

  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      gender: 'Male',
      birthDate: getRandomDate(0, 200)
    },
    attendantAtBirth: 'Physician',
    birthType: 'Single',
    weightAtBirth: 2.4,
    placeOfBirth: 'Health Institution',
    birthLocation: 'Bombwe Health Post',
    informantType: 'Mother',
    informantEmail: faker.internet.email(),
    mother: {
      name: {
        firstNames: faker.person.firstName('female'),
        familyName: faker.person.lastName('female')
      },
      birthDate: getRandomDate(20, 200),
      nationality: 'Farajaland',
      identifier: {
        id: faker.string.numeric(10),
        type: 'National ID'
      },
      address: {
        country: 'Farajaland',
        province: 'Pualula',
        district: 'Pili'
      }
    },
    father: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      birthDate: getRandomDate(22, 200),
      nationality: 'Farajaland',
      identifier: {
        id: faker.string.numeric(10),
        type: 'National ID'
      },
      address: 'Same as mother'
    }
  }

  let comment = faker.lorem.sentence()

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await loginToV2(page, CREDENTIALS.FIELD_AGENT)
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('8.1 Field agent actions', async () => {
    test.describe('8.1.0 Fill up birth registration form', async () => {
      test('8.1.0.1 Fill child details', async () => {
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
        await page
          .getByPlaceholder('yyyy')
          .fill(declaration.child.birthDate.yyyy)

        await page.locator('#child____placeOfBirth').click()
        await page
          .getByText(declaration.placeOfBirth, {
            exact: true
          })
          .click()
        await page
          .locator('#child____birthLocation')
          .fill(declaration.birthLocation.slice(0, 3))
        await page.getByText(declaration.birthLocation).click()

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

        await page
          .locator('#child____weightAtBirth')
          .fill(declaration.weightAtBirth.toString())

        await continueForm(page)
      })

      test('8.1.0.2 Fill informant details', async () => {
        await page.locator('#informant____relation').click()
        await page
          .getByText(declaration.informantType, {
            exact: true
          })
          .click()

        await page
          .locator('#informant____email')
          .fill(declaration.informantEmail)

        await continueForm(page)
      })

      test("8.1.0.3 Fill mother's details", async () => {
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
          .locator('#mother____nid')
          .fill(declaration.mother.identifier.id)

        await page.locator('#province').click()
        await page
          .getByText(declaration.mother.address.province, { exact: true })
          .click()
        await page.locator('#district').click()
        await page
          .getByText(declaration.mother.address.district, { exact: true })
          .click()

        await continueForm(page)
      })

      test("8.1.0.4 Fill father's details", async () => {
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
          .locator('#father____nid')
          .fill(declaration.father.identifier.id)

        await continueForm(page)
      })
    })

    test.describe('8.1.1 Navigate to declaration review page', async () => {
      test('8.1.1.1 Verify information added on previous pages', async () => {
        await goToSection(page, 'review')

        /*
         * Expected result: should include
         * - Child's First Name
         * - Child's Family Name
         * - Change button
         */

        await expectRowValueWithChangeButton(
          'child.firstname',
          declaration.child.name.firstNames
        )

        await expectRowValueWithChangeButton(
          'child.surname',
          declaration.child.name.familyName
        )

        /*
         * Expected result: should include
         * - Child's Gender
         * - Change button
         */
        await expectRowValueWithChangeButton(
          'child.gender',
          declaration.child.gender
        )

        /*
         * Expected result: should include
         * - Child's date of birth
         * - Change button
         */
        await expectRowValueWithChangeButton(
          'child.dob',
          formatDateObjectTo_dMMMMyyyy(declaration.child.birthDate)
        )

        /*
         * Expected result: should include
         * - Child's Place of birth type
         * - Child's Place of birth details
         * - Change button
         */
        await expectRowValueWithChangeButton(
          'child.placeOfBirth',
          declaration.placeOfBirth
        )
        await expectRowValueWithChangeButton(
          'child.birthLocation',
          declaration.birthLocation
        )

        /*
         * Expected result: should include
         * - Child's Attendant at birth
         * - Change button
         */
        await expectRowValueWithChangeButton(
          'child.attendantAtBirth',
          declaration.attendantAtBirth
        )

        /*
         * Expected result: should include
         * - Child's Birth type
         * - Change button
         */
        await expectRowValueWithChangeButton(
          'child.birthType',
          declaration.birthType
        )

        /*
         * Expected result: should include
         * - Child's Weight at birth
         * - Change button
         */
        await expectRowValueWithChangeButton(
          'child.weightAtBirth',
          declaration.weightAtBirth.toString()
        )

        /*
         * Expected result: should include
         * - Informant's relation to child
         * - Change button
         */
        await expectRowValueWithChangeButton(
          'informant.relation',
          declaration.informantType
        )
        /*
         * Expected result: should include
         * - Informant's Email
         * - Change button
         */
        await expectRowValueWithChangeButton(
          'informant.email',
          declaration.informantEmail
        )

        /*
         * Expected result: should include
         * - Mother's First Name
         * - Mother's Family Name
         * - Change button
         */
        await expectRowValueWithChangeButton(
          'mother.firstname',
          declaration.mother.name.firstNames
        )
        await expectRowValueWithChangeButton(
          'mother.surname',
          declaration.mother.name.familyName
        )

        /*
         * Expected result: should include
         * - Mother's date of birth
         * - Change button
         */
        await expectRowValueWithChangeButton(
          'mother.dob',
          formatDateObjectTo_dMMMMyyyy(declaration.mother.birthDate)
        )

        /*
         * Expected result: should include
         * - Mother's Nationality
         * - Change button
         */
        await expectRowValueWithChangeButton(
          'mother.nationality',
          declaration.mother.nationality
        )
        /*
         * Expected result: should include
         * - Mother's Type of Id
         * - Mother's Id Number
         * - Change button
         */
        await expectRowValueWithChangeButton(
          'mother.idType',
          declaration.mother.identifier.type
        )
        await expectRowValueWithChangeButton(
          'mother.nid',
          declaration.mother.identifier.id
        )

        /*
         * Expected result: should include
         * - Mother's address
         * - Change button
         */
        await expectRowValueWithChangeButton(
          'mother.address',
          declaration.mother.address.country
        )
        await expectRowValueWithChangeButton(
          'mother.address',
          declaration.mother.address.district
        )
        await expectRowValueWithChangeButton(
          'mother.address',
          declaration.mother.address.province
        )

        /*
         * Expected result: should include
         * - Father's First Name
         * - Father's Family Name
         * - Change button
         */
        await expectRowValueWithChangeButton(
          'father.firstname',
          declaration.father.name.firstNames
        )
        await expectRowValueWithChangeButton(
          'father.surname',
          declaration.father.name.familyName
        )

        /*
         * Expected result: should include
         * - Father's date of birth
         * - Change button
         */
        await expectRowValueWithChangeButton(
          'father.dob',
          formatDateObjectTo_dMMMMyyyy(declaration.father.birthDate)
        )

        /*
         * Expected result: should include
         * - Father's Nationality
         * - Change button
         */
        await expectRowValueWithChangeButton(
          'father.nationality',
          declaration.father.nationality
        )
        /*
         * Expected result: should include
         * - Father's Type of Id
         * - Father's Id Number
         * - Change button
         */
        await expectRowValueWithChangeButton(
          'father.idType',
          declaration.father.identifier.type
        )
        await expectRowValueWithChangeButton(
          'father.nid',
          declaration.father.identifier.id
        )

        /*
         * Expected result: should include
         * - Father's address
         * - Change button
         */
        await expectRowValueWithChangeButton('father.addressSameAs', 'Yes')
      })
    })

    test.describe('8.1.2 Click any "Change" link', async () => {
      test("8.1.2.1 Change child's name", async () => {
        await page.getByTestId('change-button-child.firstname').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.child.name = {
          firstNames: faker.person.firstName('male'),
          familyName: faker.person.lastName('male')
        }
        await page
          .locator('#child____firstname')
          .fill(declaration.child.name.firstNames)
        await page
          .locator('#child____surname')
          .fill(declaration.child.name.familyName)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change child's name
         */
        await expect(
          page.getByTestId('row-value-child.firstname')
        ).toContainText(declaration.child.name.firstNames)
        await expect(page.getByTestId('row-value-child.surname')).toContainText(
          declaration.child.name.familyName
        )
      })

      test("8.1.2.2 Change child's gender", async () => {
        await page.getByTestId('change-button-child.gender').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.child.gender = 'Female'

        await page.locator('#child____gender').click()
        await page.getByText(declaration.child.gender, { exact: true }).click()
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change child's gender
         */
        await expect(page.getByTestId('row-value-child.gender')).toContainText(
          declaration.child.gender
        )
      })

      test("8.1.2.3 Change child's birthday", async () => {
        await page.getByTestId('change-button-child.dob').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.child.birthDate = getRandomDate(0, 200)
        await page.getByPlaceholder('dd').fill(declaration.child.birthDate.dd)
        await page.getByPlaceholder('mm').fill(declaration.child.birthDate.mm)
        await page
          .getByPlaceholder('yyyy')
          .fill(declaration.child.birthDate.yyyy)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change child's birthday
         */
        await expect(page.getByTestId('row-value-child.dob')).toContainText(
          formatDateObjectTo_dMMMMyyyy(declaration.child.birthDate)
        )
      })

      test("8.1.2.4 Change child's birth location", async () => {
        await page.getByTestId('change-button-child.birthLocation').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.birthLocation = 'Chikonkomene Health Post'
        await page
          .locator('#child____birthLocation')
          .fill(declaration.birthLocation.slice(0, 3))
        await page.getByText(declaration.birthLocation).click()
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change child's place of birth
         */
        await expect(
          page.getByTestId('row-value-child.birthLocation')
        ).toContainText(declaration.birthLocation)
      })

      test('8.1.2.5 Change attendant at birth', async () => {
        await page.getByTestId('change-button-child.attendantAtBirth').click()
        await page.getByRole('button', { name: 'Continue' }).click()
        declaration.attendantAtBirth = 'Midwife'
        await page.locator('#child____attendantAtBirth').click()
        await page
          .getByText(declaration.attendantAtBirth, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change attendant at birth
         */
        await expect(
          page.getByTestId('row-value-child.attendantAtBirth')
        ).toContainText(declaration.attendantAtBirth)
      })

      test('8.1.2.6 Change type of birth', async () => {
        await page.getByTestId('change-button-child.birthType').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.birthType = 'Twin'
        await page.locator('#child____birthType').click()
        await page
          .getByText(declaration.birthType, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change type of birth
         */
        await expect(
          page.getByTestId('row-value-child.birthType')
        ).toContainText(declaration.birthType)
      })

      test("8.1.2.7 Change child's weight at birth", async () => {
        await page.getByTestId('change-button-child.weightAtBirth').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.weightAtBirth = 2.7
        await page
          .locator('#child____weightAtBirth')
          .fill(declaration.weightAtBirth.toString())
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change weight at birth
         */
        await expect(
          page.getByTestId('row-value-child.weightAtBirth')
        ).toContainText(declaration.weightAtBirth.toString())
      })

      test('8.1.2.8 Change informant type', async () => {
        await page.getByTestId('change-button-informant.relation').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.informantType = 'Father'
        await page.locator('#informant____relation').click()
        await page
          .getByText(declaration.informantType, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change informant type
         */
        await expect(
          page.getByTestId('row-value-informant.relation')
        ).toContainText(declaration.informantType)
      })

      test('8.1.2.9 Change registration email', async () => {
        await page.getByTestId('change-button-informant.email').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.informantEmail =
          declaration.father.name.firstNames.toLowerCase() +
          '.' +
          declaration.father.name.familyName.toLowerCase() +
          (Math.random() * 1000).toFixed(0) +
          '@opencrvs.dev'
        await page
          .locator('#informant____email')
          .fill(declaration.informantEmail)
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change registration email
         */
        await expect(
          page.getByTestId('row-value-informant.email')
        ).toContainText(declaration.informantEmail)
      })

      test("8.1.2.10 Change mother's name", async () => {
        await page.getByTestId('change-button-mother.firstname').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.mother.name.firstNames = faker.person.firstName('female')
        declaration.mother.name.familyName = faker.person.lastName('female')
        await page
          .locator('#mother____firstname')
          .fill(declaration.mother.name.firstNames)
        await page
          .locator('#mother____surname')
          .fill(declaration.mother.name.familyName)
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change mother's name
         */
        await expect(
          page.getByTestId('row-value-mother.firstname')
        ).toContainText(declaration.mother.name.firstNames)
      })

      test("8.1.2.11 Change mother's birthday", async () => {
        await page.getByTestId('change-button-mother.dob').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.mother.birthDate = getRandomDate(19, 200)
        await page.getByPlaceholder('dd').fill(declaration.mother.birthDate.dd)
        await page.getByPlaceholder('mm').fill(declaration.mother.birthDate.mm)
        await page
          .getByPlaceholder('yyyy')
          .fill(declaration.mother.birthDate.yyyy)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change mother's birthday
         */
        await expect(page.getByTestId('row-value-mother.dob')).toContainText(
          formatDateObjectTo_dMMMMyyyy(declaration.mother.birthDate)
        )
      })

      test("8.1.2.12 Change mother's nationality", async () => {
        await page.getByTestId('change-button-mother.nationality').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.mother.nationality = 'Holy See'
        await page.locator('#mother____nationality').click()
        await page
          .getByText(declaration.mother.nationality, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change mother's nationality
         */
        await expect(
          page.getByTestId('row-value-mother.nationality')
        ).toContainText(declaration.mother.nationality)
      })

      test("8.1.2.13 & 8.1.2.14 Change mother's ID type and id number", async () => {
        await page.getByTestId('change-button-mother.idType').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.mother.identifier.type = 'Passport'
        await page.locator('#mother____idType').click()
        await page
          .getByText(declaration.mother.identifier.type, {
            exact: true
          })
          .click()

        declaration.mother.identifier.id = faker.string.numeric(10)
        await page
          .locator('#mother____passport')
          .fill(declaration.mother.identifier.id)
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change mother's ID type
         */
        await expect(page.getByTestId('row-value-mother.idType')).toContainText(
          declaration.mother.identifier.type
        )
        await expect(
          page.getByTestId('row-value-mother.passport')
        ).toContainText(declaration.mother.identifier.id)
      })

      test("8.1.2.15 Change mother's address", async () => {
        await page.getByTestId('change-button-mother.address').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.mother.address.province = 'Sulaka'
        declaration.mother.address.district = 'Afue'
        await page.locator('#province').click()
        await page
          .getByText(declaration.mother.address.province, { exact: true })
          .click()
        await page.locator('#district').click()
        await page
          .getByText(declaration.mother.address.district, { exact: true })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change mother's address
         */
        await expect(
          page.getByTestId('row-value-mother.address')
        ).toContainText(declaration.mother.address.district)
        await expect(
          page.getByTestId('row-value-mother.address')
        ).toContainText(declaration.mother.address.province)
      })

      test("8.1.2.16 Change father's name", async () => {
        await page.getByTestId('change-button-father.firstname').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.father.name.firstNames = faker.person.firstName('male')
        declaration.father.name.familyName = faker.person.lastName('male')
        await page
          .locator('#father____firstname')
          .fill(declaration.father.name.firstNames)
        await page
          .locator('#father____surname')
          .fill(declaration.father.name.familyName)
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change father's name
         */
        await expect(
          page.getByTestId('row-value-father.firstname')
        ).toContainText(declaration.father.name.firstNames)
      })

      test("8.1.2.17 Change father's birthday", async () => {
        await page.getByTestId('change-button-father.dob').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.father.birthDate = getRandomDate(21, 200)
        await fillDate(page, declaration.father.birthDate)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change father's birthday
         */
        await expect(page.getByTestId('row-value-father.dob')).toContainText(
          formatDateObjectTo_dMMMMyyyy(declaration.father.birthDate)
        )
      })

      test("8.1.2.18 Change father's nationality", async () => {
        await page.getByTestId('change-button-father.nationality').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.father.nationality = 'Holy See'
        await page.locator('#father____nationality').click()
        await page
          .getByText(declaration.father.nationality, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change father's nationality
         */
        await expect(
          page.getByTestId('row-value-father.nationality')
        ).toContainText(declaration.father.nationality)
      })

      test("8.1.2.19 Change father's ID type", async () => {
        await page.getByTestId('change-button-father.idType').click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.father.identifier.type = 'Passport'
        await page.locator('#father____idType').click()
        await page
          .getByText(declaration.father.identifier.type, {
            exact: true
          })
          .click()

        declaration.father.identifier.id = faker.string.numeric(10)
        await page
          .locator('#father____passport')
          .fill(declaration.father.identifier.id)
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change father's ID type and ID number
         */
        await expect(page.getByTestId('row-value-father.idType')).toContainText(
          declaration.father.identifier.type
        )
        await expect(
          page.getByTestId('row-value-father.passport')
        ).toContainText(declaration.father.identifier.id)
      })
    })

    test.describe('8.1.3 Validate supporting document', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.1.4 Validate additional comments box', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.1.5 Validate the declaration send button', async () => {
      test.skip('Skipped for now', async () => {})
    })

    test('8.1.6 Fill up informant signature', async () => {
      await page.locator('#review____comment').fill(comment)
      await page.getByRole('button', { name: 'Sign' }).click()
      await drawSignature(page, true)
      await page
        .locator('#review____signature-form-input')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('8.1.7 Click send button', async () => {
      await page.getByRole('button', { name: 'Send for review' }).click()
      await expect(page.getByText('Send for review?')).toBeVisible()
    })

    test('8.1.8 Confirm the declaration to send for review', async () => {
      await page.getByRole('button', { name: 'Confirm' }).click()
      await expect(page.getByText('All events')).toBeVisible()

      /*
       * @TODO: When workflows are implemented on V2, this should navigate to correct workflow first.
       */
      await expect(
        page.getByRole('button', {
          name: formatName(declaration.child.name)
        })
      ).toBeVisible()
    })
  })

  test.describe('8.2 Registration agent actions', async () => {
    test('8.2.1 Navigate to the declaration preview page', async () => {
      await loginToV2(page, CREDENTIALS.REGISTRATION_AGENT)

      await page
        .getByRole('button', {
          name: formatName(declaration.child.name)
        })
        .click()

      await selectAction(page, 'Validate')
    })
    test('8.2.1.1 Verify information added on previous pages', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'child.firstname',
        declaration.child.name.firstNames
      )
      await expectRowValueWithChangeButton(
        'child.surname',
        declaration.child.name.familyName
      )

      /*
       * Expected result: should include
       * - Child's Gender
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'child.gender',
        declaration.child.gender
      )

      /*
       * Expected result: should include
       * - Child's date of birth
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'child.dob',
        formatDateObjectTo_dMMMMyyyy(declaration.child.birthDate)
      )

      /*
       * Expected result: should include
       * - Child's Place of birth type
       * - Child's Place of birth details
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'child.placeOfBirth',
        declaration.placeOfBirth
      )
      await expectRowValueWithChangeButton(
        'child.birthLocation',
        declaration.birthLocation
      )

      /*
       * Expected result: should include
       * - Child's Attendant at birth
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'child.attendantAtBirth',
        declaration.attendantAtBirth
      )

      /*
       * Expected result: should include
       * - Child's Birth type
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'child.birthType',
        declaration.birthType
      )

      /*
       * Expected result: should include
       * - Child's Weight at birth
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'child.weightAtBirth',
        declaration.weightAtBirth.toString()
      )

      /*
       * Expected result: should include
       * - Informant's relation to child
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.relation',
        declaration.informantType
      )
      /*
       * Expected result: should include
       * - Informant's Email
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.email',
        declaration.informantEmail
      )

      /*
       * Expected result: should include
       * - Mother's First Name
       * - Mother's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'mother.firstname',
        declaration.mother.name.firstNames
      )
      await expectRowValueWithChangeButton(
        'mother.surname',
        declaration.mother.name.familyName
      )

      /*
       * Expected result: should include
       * - Mother's date of birth
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'mother.dob',
        formatDateObjectTo_dMMMMyyyy(declaration.mother.birthDate)
      )

      /*
       * Expected result: should include
       * - Mother's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'mother.nationality',
        declaration.mother.nationality
      )

      /*
       * Expected result: should include
       * - Mother's Type of Id
       * - Mother's Id Number
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'mother.idType',
        declaration.mother.identifier.type
      )
      await expectRowValueWithChangeButton(
        'mother.passport',
        declaration.mother.identifier.id
      )

      /*
       * Expected result: should include
       * - Mother's address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'mother.address',
        declaration.mother.address.country
      )
      await expectRowValueWithChangeButton(
        'mother.address',
        declaration.mother.address.district
      )
      await expectRowValueWithChangeButton(
        'mother.address',
        declaration.mother.address.province
      )

      /*
       * Expected result: should include
       * - Father's First Name
       * - Father's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'father.firstname',
        declaration.father.name.firstNames
      )
      await expectRowValueWithChangeButton(
        'father.surname',
        declaration.father.name.familyName
      )

      /*
       * Expected result: should include
       * - Father's date of birth
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'father.dob',
        formatDateObjectTo_dMMMMyyyy(declaration.father.birthDate)
      )

      /*
       * Expected result: should include
       * - Father's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'father.nationality',
        declaration.father.nationality
      )

      /*
       * Expected result: should include
       * - Father's Type of Id
       * - Father's Id Number
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'father.idType',
        declaration.father.identifier.type
      )
      await expectRowValueWithChangeButton(
        'father.passport',
        declaration.father.identifier.id
      )

      /*
       * Expected result: should include
       * - Father's address
       * - Change button
       */
      await expectRowValueWithChangeButton('father.addressSameAs', 'Yes')
    })

    test.describe('8.2.2 Click any "Change" link', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.2.3 Validate supporting document', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.2.4 Validate additional comments box', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.2.5 Validate the declaration send button', async () => {
      test.skip('Skipped for now', async () => {})
    })

    test('8.2.6 Validate previous signature and comment, add new signature and comment', async () => {
      await expect(page.locator('#review____comment')).toContainText(comment)
      await expect(page.getByAltText('Upload Signature')).toBeVisible()

      comment = faker.lorem.sentence()

      await page.locator('#review____comment').clear()
      await page.locator('#review____comment').fill(comment)

      await page
        .locator('#review____signature-form-input')
        .getByText('Delete')
        .click()

      await page.getByRole('button', { name: 'Sign' }).click()
      await drawSignature(page, true)
      await page
        .locator('#review____signature-form-input')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('8.2.7 Click send button', async () => {
      await page.getByRole('button', { name: 'Send for approval' }).click()
      await expect(page.getByText('Send for approval?')).toBeVisible()
    })

    test('8.2.8 Confirm the declaration to send for approval', async () => {
      await page.getByRole('button', { name: 'Confirm' }).click()
      await expect(page.getByText('All events')).toBeVisible()

      /*
       * @TODO: When workflows are implemented on V2, this should navigate to correct workflow first.
       */
      await expect(
        page.getByRole('button', {
          name: formatName(declaration.child.name)
        })
      ).toBeVisible()
    })
  })

  test.describe('8.3 Local registrar actions', async () => {
    test('8.3.1 Navigate to the declaration preview page', async () => {
      await loginToV2(page, CREDENTIALS.LOCAL_REGISTRAR)

      await page
        .getByRole('button', {
          name: formatName(declaration.child.name)
        })
        .click()

      await selectAction(page, 'Register')
    })
    test('8.3.1.1 Verify information added on previous pages', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'child.firstname',
        declaration.child.name.firstNames
      )
      await expectRowValueWithChangeButton(
        'child.surname',
        declaration.child.name.familyName
      )

      /*
       * Expected result: should include
       * - Child's Gender
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'child.gender',
        declaration.child.gender
      )

      /*
       * Expected result: should include
       * - Child's date of birth
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'child.dob',
        formatDateObjectTo_dMMMMyyyy(declaration.child.birthDate)
      )

      /*
       * Expected result: should include
       * - Child's Place of birth type
       * - Child's Place of birth details
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'child.placeOfBirth',
        declaration.placeOfBirth
      )
      await expectRowValueWithChangeButton(
        'child.birthLocation',
        declaration.birthLocation
      )

      /*
       * Expected result: should include
       * - Child's Attendant at birth
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'child.attendantAtBirth',
        declaration.attendantAtBirth
      )

      /*
       * Expected result: should include
       * - Child's Birth type
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'child.birthType',
        declaration.birthType
      )

      /*
       * Expected result: should include
       * - Child's Weight at birth
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'child.weightAtBirth',
        declaration.weightAtBirth.toString()
      )

      /*
       * Expected result: should include
       * - Informant's relation to child
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.relation',
        declaration.informantType
      )
      /*
       * Expected result: should include
       * - Informant's Email
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.email',
        declaration.informantEmail
      )

      /*
       * Expected result: should include
       * - Mother's First Name
       * - Mother's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'mother.firstname',
        declaration.mother.name.firstNames
      )
      await expectRowValueWithChangeButton(
        'mother.surname',
        declaration.mother.name.familyName
      )

      /*
       * Expected result: should include
       * - Mother's date of birth
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'mother.dob',
        formatDateObjectTo_dMMMMyyyy(declaration.mother.birthDate)
      )

      /*
       * Expected result: should include
       * - Mother's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'mother.nationality',
        declaration.mother.nationality
      )

      /*
       * Expected result: should include
       * - Mother's Type of Id
       * - Mother's Id Number
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'mother.idType',
        declaration.mother.identifier.type
      )
      await expectRowValueWithChangeButton(
        'mother.passport',
        declaration.mother.identifier.id
      )

      /*
       * Expected result: should include
       * - Mother's address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'mother.address',
        declaration.mother.address.country
      )
      await expectRowValueWithChangeButton(
        'mother.address',
        declaration.mother.address.district
      )
      await expectRowValueWithChangeButton(
        'mother.address',
        declaration.mother.address.province
      )

      /*
       * Expected result: should include
       * - Father's First Name
       * - Father's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'father.firstname',
        declaration.father.name.firstNames
      )
      await expectRowValueWithChangeButton(
        'father.surname',
        declaration.father.name.familyName
      )

      /*
       * Expected result: should include
       * - Father's date of birth
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'father.dob',
        formatDateObjectTo_dMMMMyyyy(declaration.father.birthDate)
      )

      /*
       * Expected result: should include
       * - Father's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'father.nationality',
        declaration.father.nationality
      )

      /*
       * Expected result: should include
       * - Father's Type of Id
       * - Father's Id Number
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'father.idType',
        declaration.father.identifier.type
      )
      await expectRowValueWithChangeButton(
        'father.passport',
        declaration.father.identifier.id
      )

      /*
       * Expected result: should include
       * - Father's address
       * - Change button
       */
      await expectRowValueWithChangeButton('father.addressSameAs', 'Yes')
    })

    const newFamilyNameForChild = faker.person.lastName('male')

    test("8.3.2.1 Update child's family name", async () => {
      await page.getByTestId('change-button-child.surname').click()
      await page.getByRole('button', { name: 'Continue' }).click()

      await page.locator('#child____surname').fill(newFamilyNameForChild)

      await page.getByRole('button', { name: 'Back to review' }).click()
    })

    test("8.3.2.2 Review child's changed family name", async () => {
      await expect(page.getByTestId('row-value-child.surname')).toContainText(
        newFamilyNameForChild
      )
    })

    test.describe('8.3.3 Validate supporting document', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.3.4 Validate additional comments box', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.3.5 Validate the register button', async () => {
      test.skip('Skipped for now', async () => {})
    })

    test('8.3.6 Validate previous signature and comment, add new signature and comment', async () => {
      await expect(page.locator('#review____comment')).toContainText(comment)
      await expect(page.getByAltText('Upload Signature')).toBeVisible()

      comment = faker.lorem.sentence()

      await page.locator('#review____comment').clear()
      await page.locator('#review____comment').fill(comment)

      await page
        .locator('#review____signature-form-input')
        .getByText('Delete')
        .click()

      await page.getByRole('button', { name: 'Sign' }).click()
      await drawSignature(page, true)
      await page
        .locator('#review____signature-form-input')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('8.3.7 Click send button', async () => {
      await page.getByRole('button', { name: 'Register' }).click()
    })

    test('8.3.8 Confirm the declaration to ready for print', async () => {
      await page.locator('#confirm_Register').click()
      await expect(page.getByText('All events')).toBeVisible()

      /*
       * @TODO: When workflows are implemented on V2, this should navigate to correct workflow first.
       */
      await expect(
        page.getByRole('button', {
          name: `${declaration.child.name.firstNames} ${newFamilyNameForChild}`
        })
      ).toBeVisible()
    })
  })
})
