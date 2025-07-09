import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  formatDateObjectTo_dMMMMyyyy,
  getRandomDate,
  goToSection,
  loginToV2
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'
import { ensureOutboxIsEmpty, selectAction } from '../../../v2-utils'

test.describe.serial('3. Death declaration case - 3', () => {
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
    deceased: {
      name: {
        firstname: faker.person.firstName('male') + ' the 2nd',
        surname: faker.person.lastName('male')
      },
      gender: 'Unknown',
      age: 45,
      nationality: 'Farajaland',
      idType: 'Birth Registration Number',
      brn: faker.string.numeric(10),
      maritalStatus: 'Widowed',
      address: {
        country: 'Guam',
        state: faker.location.state(),
        district: faker.location.county(),
        town: faker.location.city(),
        addressLine1: faker.location.county(),
        addressLine2: faker.location.street(),
        addressLine3: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      }
    },
    eventDetails: {
      date: getRandomDate(0, 20),
      mannerOfDeath: 'Suicide',
      causeOfDeathEstablished: true,
      sourceCauseDeath: 'Verbal autopsy',
      description: 'Hanging from ceiling',
      placeOfDeath: "Deceased's usual place of residence"
    },
    informant: {
      relation: 'Daughter',
      email: faker.internet.email(),
      name: {
        firstname: faker.person.firstName('female'),
        surname: faker.person.lastName('female')
      },
      age: 17,
      nationality: 'Malawi',
      idType: 'Passport',
      passport: faker.string.numeric(10),
      addressSameAs: false,
      address: {
        country: 'Farajaland',
        province: 'Chuminga',
        district: 'Nsali',
        urbanOrRural: 'Urban',
        town: faker.location.city(),
        residentialArea: faker.location.county(),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      }
    },
    spouse: {
      name: {
        firstname: faker.person.firstName('female'),
        surname: faker.person.lastName('female')
      },
      age: 42,
      nationality: 'Farajaland',
      idType: 'Birth Registration Number',
      brn: faker.string.numeric(10),
      addressSameAs: false,
      address: {
        country: 'Farajaland',
        province: 'Chuminga',
        district: 'Nsali',
        urbanOrRural: 'Rural',
        village: faker.location.county()
      }
    }
  }
  const annotation = {
    review: {
      comment: "He was a great person, we'll miss him"
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('3.1 Declaration started by FA', async () => {
    test.beforeAll(async () => {
      await loginToV2(page, CREDENTIALS.FIELD_AGENT)

      await page.click('#header-new-event')
      await page.getByLabel('Death').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })
    test('3.1.1 Fill deceased details', async () => {
      await page.locator('#firstname').fill(declaration.deceased.name.firstname)
      await page.locator('#surname').fill(declaration.deceased.name.surname)
      await page.locator('#deceased____gender').click()
      await page.getByText(declaration.deceased.gender, { exact: true }).click()

      await page.getByLabel('Exact date of birth unknown').check()

      await page
        .locator('#deceased____age')
        .fill(declaration.deceased.age.toString())

      await page.locator('#deceased____idType').click()
      await page.getByText(declaration.deceased.idType, { exact: true }).click()

      await page.locator('#deceased____brn').fill(declaration.deceased.brn)

      await page.locator('#deceased____maritalStatus').click()
      await page
        .getByText(declaration.deceased.maritalStatus, { exact: true })
        .click()

      await page.locator('#country').click()
      await page
        .getByText(declaration.deceased.address.country, { exact: true })
        .click()

      await page.locator('#state').fill(declaration.deceased.address.state)
      await page
        .locator('#district2')
        .fill(declaration.deceased.address.district)
      await page.locator('#cityOrTown').fill(declaration.deceased.address.town)
      await page
        .locator('#addressLine1')
        .fill(declaration.deceased.address.addressLine1)
      await page
        .locator('#addressLine2')
        .fill(declaration.deceased.address.addressLine2)
      await page
        .locator('#addressLine3')
        .fill(declaration.deceased.address.addressLine3)
      await page
        .locator('#postcodeOrZip')
        .fill(declaration.deceased.address.postcodeOrZip)
      await continueForm(page)
    })

    test('3.1.2 Fill event details', async () => {
      await page.getByPlaceholder('dd').fill(declaration.eventDetails.date.dd)
      await page.getByPlaceholder('mm').fill(declaration.eventDetails.date.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.eventDetails.date.yyyy)

      await page.locator('#eventDetails____mannerOfDeath').click()
      await page
        .getByText(declaration.eventDetails.mannerOfDeath, { exact: true })
        .click()

      await page.getByLabel('Cause of death has been established').check()

      await page.locator('#eventDetails____sourceCauseDeath').click()
      await page
        .getByText(declaration.eventDetails.sourceCauseDeath, { exact: true })
        .click()

      await page
        .locator('#eventDetails____description')
        .fill(declaration.eventDetails.description)

      await page.locator('#eventDetails____placeOfDeath').click()
      await page
        .getByText(declaration.eventDetails.placeOfDeath, { exact: true })
        .click()

      await continueForm(page)
    })

    test('3.1.3 Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informant.relation, {
          exact: true
        })
        .click()

      await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with deceased

      await page
        .locator('#firstname')
        .fill(declaration.informant.name.firstname)
      await page.locator('#surname').fill(declaration.informant.name.surname)

      await page.getByLabel('Exact date of birth unknown').check()

      await page
        .locator('#informant____age')
        .fill(declaration.informant.age.toString())

      await page.locator('#informant____nationality').click()
      await page
        .getByText(declaration.informant.nationality, { exact: true })
        .click()

      await page.locator('#informant____idType').click()
      await page
        .getByText(declaration.informant.idType, { exact: true })
        .click()

      await page
        .locator('#informant____passport')
        .fill(declaration.informant.passport)

      await page.locator('#informant____addressSameAs_NO').check()

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

      await page
        .locator('#informant____email')
        .fill(declaration.informant.email)

      await continueForm(page)
    })

    test('3.1.4 Fill spouse details', async () => {
      await page.locator('#firstname').fill(declaration.spouse.name.firstname)
      await page.locator('#surname').fill(declaration.spouse.name.surname)

      await page.getByLabel('Exact date of birth unknown').check()

      await page
        .locator('#spouse____age')
        .fill(declaration.spouse.age.toString())

      await page.locator('#spouse____idType').click()
      await page.getByText(declaration.spouse.idType, { exact: true }).click()

      await page.locator('#spouse____brn').fill(declaration.spouse.brn)

      await page.locator('#spouse____addressSameAs_NO').check()

      await page.locator('#province').click()
      await page
        .getByText(declaration.spouse.address.province, { exact: true })
        .click()
      await page.locator('#district').click()
      await page
        .getByText(declaration.spouse.address.district, { exact: true })
        .click()
      await page.locator('#urbanOrRural_RURAL').click()
      await page.locator('#village').fill(declaration.spouse.address.village)

      await continueForm(page)
    })

    test('3.1.5 Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('3.1.6 Verify information on preview page', async () => {
      /*
       * Expected result: should include
       * - Deceased's First Name
       * - Deceased's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.name',
        declaration.deceased.name.firstname +
          ' ' +
          declaration.deceased.name.surname
      )

      /*
       * Expected result: should include
       * - Deceased's Gender
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.gender',
        declaration.deceased.gender
      )

      /*
       * Expected result: should include
       * - Deceased's age
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.age',
        declaration.deceased.age.toString()
      )

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.nationality',
        declaration.deceased.nationality
      )

      /*
       * Expected result: should include
       * - Deceased's Type of Id
       * - Deceased's Id Number
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.idType',
        declaration.deceased.idType
      )
      await expectRowValueWithChangeButton(
        'deceased.brn',
        declaration.deceased.brn
      )

      /*
       * Expected result: should include
       * - Deceased's marital status
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.maritalStatus',
        declaration.deceased.maritalStatus
      )

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.address',
        declaration.deceased.address.country +
          declaration.deceased.address.state +
          declaration.deceased.address.district +
          declaration.deceased.address.town +
          declaration.deceased.address.addressLine1 +
          declaration.deceased.address.addressLine2 +
          declaration.deceased.address.addressLine3 +
          declaration.deceased.address.postcodeOrZip
      )

      /*
       * Expected result: should include
       * - Date of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.date',
        formatDateObjectTo_dMMMMyyyy(declaration.eventDetails.date)
      )

      /*
       * Expected result: should include
       * - Manner of death has been established
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.mannerOfDeath',
        declaration.eventDetails.mannerOfDeath
      )

      /*
       * Expected result: should include
       * - Cause of death has been established
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.causeOfDeathEstablished',
        'Yes'
      )

      /*
       * Expected result: should include
       * - Source cause of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.sourceCauseDeath',
        declaration.eventDetails.sourceCauseDeath
      )

      /*
       * Expected result: should include
       * - Description cause of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.description',
        declaration.eventDetails.description
      )

      /*
       * Expected result: should include
       * - Place of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.placeOfDeath',
        declaration.eventDetails.placeOfDeath
      )

      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.relation',
        declaration.informant.relation
      )

      /*
       * Expected result: should include
       * - Informant's First Name
       * - Informant's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.name',
        declaration.informant.name.firstname +
          ' ' +
          declaration.informant.name.surname
      )

      /*
       * Expected result: should include
       * - informant's age
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.age',
        declaration.informant.age.toString()
      )

      /*
       * Expected result: should include
       * - informant's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.nationality',
        declaration.informant.nationality
      )

      /*
       * Expected result: should include
       * - informant's Type of Id
       * - informant's Id Number
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.idType',
        declaration.informant.idType
      )
      await expectRowValueWithChangeButton(
        'informant.passport',
        declaration.informant.passport
      )

      /*
       * Expected result: should include
       * - informant's address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.address',
        declaration.informant.address.country +
          declaration.informant.address.province +
          declaration.informant.address.district +
          declaration.informant.address.town +
          declaration.informant.address.residentialArea +
          declaration.informant.address.street +
          declaration.informant.address.number +
          declaration.informant.address.postcodeOrZip
      )

      /*
       * Expected result: should include
       * - Informant's Email
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.email',
        declaration.informant.email
      )

      /*
       * Expected result: should include
       * - Spouse's First Name
       * - Spouse's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.name',
        declaration.spouse.name.firstname +
          ' ' +
          declaration.spouse.name.surname
      )

      /*
       * Expected result: should include
       * - Spouse's age
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.age',
        declaration.spouse.age.toString()
      )

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.nationality',
        declaration.spouse.nationality
      )
      /*
       * Expected result: should include
       * - Spouse's Type of Id
       * - Spouse's Id Number
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.idType',
        declaration.spouse.idType
      )
      await expectRowValueWithChangeButton('spouse.brn', declaration.spouse.brn)

      /*
       * Expected result: should include
       * - Spouse's address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.address',
        declaration.spouse.address.country +
          declaration.spouse.address.province +
          declaration.spouse.address.district +
          declaration.spouse.address.village
      )
    })

    test('3.1.7 Fill up informant signature', async () => {
      await page.locator('#review____comment').fill(annotation.review.comment)
      await page.getByRole('button', { name: 'Sign' }).click()
      await drawSignature(page, true)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('3.1.8 Send for review', async () => {
      await page.getByRole('button', { name: 'Send for review' }).click()
      await expect(page.getByText('Send for review?')).toBeVisible()
      await page.getByRole('button', { name: 'Confirm' }).click()
      await ensureOutboxIsEmpty(page)
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to assigned to you workqueue
       */
      expect(page.url().includes('assigned-to-you')).toBeTruthy()

      await page.getByText('Sent for review').click()

      /*
       * Expected result: The declaration should be in sent for review
       */
      await expect(
        page.getByRole('button', {
          name:
            declaration.deceased.name.firstname +
            ' ' +
            declaration.deceased.name.surname
        })
      ).toBeVisible()
    })
  })
  test.describe('3.2 Declaration Review by RA', async () => {
    test('3.2.1 Navigate to the declaration review page', async () => {
      await loginToV2(page, CREDENTIALS.REGISTRATION_AGENT)

      await ensureOutboxIsEmpty(page)
      await page.getByText('Ready for review').click()

      await page
        .getByRole('button', {
          name:
            declaration.deceased.name.firstname +
            ' ' +
            declaration.deceased.name.surname
        })
        .click()
    })

    test('3.2.2 Verify information on review page', async () => {
      await selectAction(page, 'Validate')
      /*
       * Expected result: should include
       * - Deceased's First Name
       * - Deceased's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.name',
        declaration.deceased.name.firstname +
          ' ' +
          declaration.deceased.name.surname
      )

      /*
       * Expected result: should include
       * - Deceased's Gender
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.gender',
        declaration.deceased.gender
      )

      /*
       * Expected result: should include
       * - Deceased's age
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.age',
        declaration.deceased.age.toString()
      )

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.nationality',
        declaration.deceased.nationality
      )

      /*
       * Expected result: should include
       * - Deceased's Type of Id
       * - Deceased's Id Number
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.idType',
        declaration.deceased.idType
      )
      await expectRowValueWithChangeButton(
        'deceased.brn',
        declaration.deceased.brn
      )

      /*
       * Expected result: should include
       * - Deceased's marital status
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.maritalStatus',
        declaration.deceased.maritalStatus
      )

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.address',
        declaration.deceased.address.country +
          declaration.deceased.address.state +
          declaration.deceased.address.district +
          declaration.deceased.address.town +
          declaration.deceased.address.addressLine1 +
          declaration.deceased.address.addressLine2 +
          declaration.deceased.address.addressLine3 +
          declaration.deceased.address.postcodeOrZip
      )

      /*
       * Expected result: should include
       * - Date of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.date',
        formatDateObjectTo_dMMMMyyyy(declaration.eventDetails.date)
      )

      /*
       * Expected result: should include
       * - Manner of death has been established
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.mannerOfDeath',
        declaration.eventDetails.mannerOfDeath
      )

      /*
       * Expected result: should include
       * - Cause of death has been established
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.causeOfDeathEstablished',
        'Yes'
      )

      /*
       * Expected result: should include
       * - Source cause of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.sourceCauseDeath',
        declaration.eventDetails.sourceCauseDeath
      )

      /*
       * Expected result: should include
       * - Description cause of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.description',
        declaration.eventDetails.description
      )

      /*
       * Expected result: should include
       * - Place of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.placeOfDeath',
        declaration.eventDetails.placeOfDeath
      )

      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.relation',
        declaration.informant.relation
      )

      /*
       * Expected result: should include
       * - Informant's First Name
       * - Informant's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.name',
        declaration.informant.name.firstname +
          ' ' +
          declaration.informant.name.surname
      )

      /*
       * Expected result: should include
       * - informant's age
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.age',
        declaration.informant.age.toString()
      )

      /*
       * Expected result: should include
       * - informant's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.nationality',
        declaration.informant.nationality
      )

      /*
       * Expected result: should include
       * - informant's Type of Id
       * - informant's Id Number
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.idType',
        declaration.informant.idType
      )
      await expectRowValueWithChangeButton(
        'informant.passport',
        declaration.informant.passport
      )

      /*
       * Expected result: should include
       * - informant's address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.address',
        declaration.informant.address.country +
          declaration.informant.address.province +
          declaration.informant.address.district +
          declaration.informant.address.town +
          declaration.informant.address.residentialArea +
          declaration.informant.address.street +
          declaration.informant.address.number +
          declaration.informant.address.postcodeOrZip
      )

      /*
       * Expected result: should include
       * - Informant's Email
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.email',
        declaration.informant.email
      )

      /*
       * Expected result: should include
       * - Spouse's First Name
       * - Spouse's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.name',
        declaration.spouse.name.firstname +
          ' ' +
          declaration.spouse.name.surname
      )

      /*
       * Expected result: should include
       * - Spouse's age
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.age',
        declaration.spouse.age.toString()
      )

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.nationality',
        declaration.spouse.nationality
      )
      /*
       * Expected result: should include
       * - Spouse's Type of Id
       * - Spouse's Id Number
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.idType',
        declaration.spouse.idType
      )
      await expectRowValueWithChangeButton('spouse.brn', declaration.spouse.brn)

      /*
       * Expected result: should include
       * - Spouse's address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.address',
        declaration.spouse.address.country +
          declaration.spouse.address.province +
          declaration.spouse.address.district +
          declaration.spouse.address.village
      )
    })
  })
})
