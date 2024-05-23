import { test, expect, type Page } from '@playwright/test'
import { createPIN, getRandomDate, goToSection, login } from '../../../helpers'
import faker from '@faker-js/faker'
import { format } from 'date-fns'

test.describe.serial('7. Birth declaration case - 7', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.name.firstName(),
        familyName: faker.name.lastName()
      },
      gender: 'Unknown',
      birthDate: getRandomDate(0, 200)
    },
    attendantAtBirth: 'None',
    birthType: 'Single',
    placeOfBirth: 'Health Institution',
    birthLocation: 'Twalumba Rural Health Centre',
    informantType: 'Legal guardian',
    informantEmail: faker.internet.email(),
    informant: {
      name: {
        firstNames: faker.name.firstName('female'),
        familyName: faker.name.lastName('female')
      },
      age: 17,
      nationality: 'Guadeloupe',
      identifier: {
        type: 'None'
      },
      address: {
        country: 'Guadeloupe',
        state: faker.address.state(),
        district: faker.address.county(),
        town: faker.address.city(),
        addressLine1: faker.address.county(),
        addressLine2: faker.address.streetName(),
        addressLine3: faker.address.buildingNumber(),
        postcodeOrZip: faker.address.zipCode()
      }
    },
    mother: {
      detailsDontExist: true,
      reason: 'Child was found, no one knows who the mother is'
    },
    father: {
      detailsDontExist: true,
      reason: 'Child was found, no one knows who the father is'
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('7.1 Declaration started by FA', async () => {
    test.beforeAll(async () => {
      await login(page, 'k.bwalya', 'test')
      await createPIN(page)
      await page.click('#header_new_event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('7.1.1 Fill child details', async () => {
      await page
        .locator('#firstNamesEng')
        .fill(declaration.child.name.firstNames)
      await page
        .locator('#familyNameEng')
        .fill(declaration.child.name.familyName)
      await page.locator('#gender').click()
      await page.getByText(declaration.child.gender, { exact: true }).click()

      await page.getByPlaceholder('dd').fill(declaration.child.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.child.birthDate.mm)
      await page.getByPlaceholder('yyyy').fill(declaration.child.birthDate.yyyy)

      await page.locator('#placeOfBirth').click()
      await page
        .getByText(declaration.placeOfBirth, {
          exact: true
        })
        .click()
      await page
        .locator('#birthLocation')
        .fill(declaration.birthLocation.slice(0, 3))
      await page.getByText(declaration.birthLocation).click()

      await page.locator('#attendantAtBirth').click()
      await page
        .getByText(declaration.attendantAtBirth, {
          exact: true
        })
        .click()

      await page.locator('#birthType').click()
      await page
        .getByText(declaration.birthType, {
          exact: true
        })
        .click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('7.1.2 Fill informant details', async () => {
      await page.locator('#informantType').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with child

      await page.locator('#registrationEmail').fill(declaration.informantEmail)

      /*
       * Expected result: should show additional fields:
       * - Full Name
       * - Date of birth
       * - Nationality
       * - Id
       * - Usual place of residence
       */
      await page
        .locator('#firstNamesEng')
        .fill(declaration.informant.name.firstNames)
      await page
        .locator('#familyNameEng')
        .fill(declaration.informant.name.familyName)

      await page.getByLabel('Exact date of birth unknown').check()

      await page
        .locator('#ageOfIndividualInYears')
        .fill(declaration.informant.age.toString())

      await page.locator('#nationality').click()
      await page
        .locator('#nationality')
        .getByText(declaration.informant.nationality, { exact: true })
        .click()

      await page.locator('#informantIdType').click()
      await page
        .getByText(declaration.informant.identifier.type, { exact: true })
        .click()

      await page.locator('#countryPrimaryInformant').click()
      await page
        .locator('#countryPrimaryInformant')
        .getByText(declaration.informant.address.country, { exact: true })
        .click()
      await page
        .locator('#internationalStatePrimaryInformant')
        .fill(declaration.informant.address.state)
      await page
        .locator('#internationalDistrictPrimaryInformant')
        .fill(declaration.informant.address.district)
      await page
        .locator('#internationalCityPrimaryInformant')
        .fill(declaration.informant.address.town)
      await page
        .locator('#internationalAddressLine1PrimaryInformant')
        .fill(declaration.informant.address.addressLine1)
      await page
        .locator('#internationalAddressLine2PrimaryInformant')
        .fill(declaration.informant.address.addressLine2)
      await page
        .locator('#internationalAddressLine3PrimaryInformant')
        .fill(declaration.informant.address.addressLine3)
      await page
        .locator('#internationalPostalCodePrimaryInformant')
        .fill(declaration.informant.address.postcodeOrZip)

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test("7.1.3 Fill mother's details", async () => {
      await page.getByLabel("Mother's details are not available").check()
      await page.locator('#reasonNotApplying').fill(declaration.mother.reason)
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test("7.1.4 Fill father's details", async () => {
      await page.getByLabel("Father's details are not available").check()
      await page.locator('#reasonNotApplying').fill(declaration.father.reason)
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test.skip('7.1.5 Add documents', async () => {
      goToSection(page, 'documents')
    })

    test('7.1.6 Go to preview', async () => {
      goToSection(page, 'preview')
    })

    test.skip('7.1.7 Verify informations in preview page', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.locator('#child-content #Full')).toContainText(
        declaration.child.name.firstNames
      )
      await expect(page.locator('#child-content #Full')).toContainText(
        declaration.child.name.familyName
      )

      /*
       * Expected result: should include
       * - Child's Gender
       */
      await expect(page.locator('#child-content #Sex')).toContainText(
        declaration.child.gender
      )

      /*
       * Expected result: should include
       * - Child's date of birth
       */
      await expect(page.locator('#child-content #Date')).toContainText(
        format(
          new Date(
            Number(declaration.child.birthDate.yyyy),
            Number(declaration.child.birthDate.mm) - 1,
            Number(declaration.child.birthDate.dd)
          ),
          'dd MMMM yyyy'
        )
      )

      /*
       * Expected result: should include
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(page.locator('#child-content #Place')).toContainText(
        declaration.placeOfBirth
      )
      await expect(page.locator('#child-content #Place')).toContainText(
        declaration.birthLocation
      )

      /*
       * Expected result: should include
       * - Child's Attendant at birth
       */
      await expect(page.locator('#child-content #Attendant')).toContainText(
        declaration.attendantAtBirth
      )

      /*
       * Expected result: should include
       * - Child's Birth type
       */
      await expect(page.locator('#child-content #Type')).toContainText(
        declaration.birthType
      )

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expect(
        page.locator('#informant-content #Relationship')
      ).toContainText(declaration.informantType)

      /*
       * Expected result: should include
       * - Informant's Email
       */
      await expect(page.locator('#informant-content #Email')).toContainText(
        declaration.informantEmail
      )
      /*
       * Expected result: should include
       * - Informant's First Name
       * - Informant's Family Name
       */
      await expect(page.locator('#informant-content #Full')).toContainText(
        declaration.informant.name.firstNames
      )
      await expect(page.locator('#informant-content #Full')).toContainText(
        declaration.informant.name.familyName
      )

      /*
       * Expected result: should include
       * - Informant's date of birth
       */
      await expect(page.locator('#informant-content #Age')).toContainText(
        declaration.informant.age + ' years'
      )

      /*
       * Expected result: should include
       * - Informant's Nationality
       */
      await expect(
        page.locator('#informant-content #Nationality')
      ).toContainText(declaration.informant.nationality)

      /*
       * Expected result: should include
       * - Informant's address
       */
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.country
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.district
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.state
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.addressLine1
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.addressLine2
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.addressLine3
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.postcodeOrZip
      )

      /*
       * Expected result: should include
       * - Informant's Type of Id
       * - Informant's Id
       */
      await expect(page.locator('#informant-content #Type')).toContainText(
        declaration.informant.identifier.type
      )

      /*
       * Expected result: should include
       * - Mother's Details not available: true
       * - Reason of why mother's details not available
       */
      await expect(page.locator('#mother-content')).toContainText(
        "Mother's details are not availableYes"
      )
      await expect(page.locator('#mother-content #Reason')).toContainText(
        declaration.mother.reason
      )

      /*
       * Expected result: should include
       * - Father's details not available: true
       * - Reason why father's details not available
       */
      await expect(page.locator('#father-content')).toContainText(
        "Father's details are not availableYes"
      )
      await expect(page.locator('#father-content #Reason')).toContainText(
        declaration.father.reason
      )
    })

    test('7.1.8 Send for review', async () => {
      await page.getByRole('button', { name: 'Send for review' }).click()
      await expect(page.getByText('Send for review?')).toBeVisible()
      await page.getByRole('button', { name: 'Confirm' }).click()
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to registration home
       */
      expect(page.url().includes('registration-home'))

      await expect(page.locator('#navigation_outbox')).not.toContainText('1', {
        timeout: 1000 * 10
      })

      await page.getByRole('button', { name: 'Sent for review' }).click()

      /*
       * Expected result: The declaration should be in sent for review
       */
      await expect(
        page.getByRole('button', {
          name: `${declaration.child.name.firstNames} ${declaration.child.name.familyName}`
        })
      ).toBeVisible()
    })
  })

  test.describe('7.2 Declaration Review by RA', async () => {
    test('7.2.1 Navigate to the declaration review page', async () => {
      await login(page, 'f.katongo', 'test')
      await createPIN(page)
      await page.getByRole('button', { name: 'Ready for review' }).click()
      await page
        .getByRole('button', {
          name: `${declaration.child.name.firstNames} ${declaration.child.name.familyName}`
        })
        .click()
      await page.getByLabel('Assign record').click()
      await page.getByRole('button', { name: 'Assign', exact: true }).click()
      await page.getByRole('button', { name: 'Review', exact: true }).click()
    })

    test('7.2.2 Verify informations in preview page', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.locator('#child-content #Full')).toContainText(
        declaration.child.name.firstNames
      )
      await expect(page.locator('#child-content #Full')).toContainText(
        declaration.child.name.familyName
      )

      /*
       * Expected result: should include
       * - Child's Gender
       */
      await expect(page.locator('#child-content #Sex')).toContainText(
        declaration.child.gender
      )

      /*
       * Expected result: should include
       * - Child's date of birth
       */
      await expect(page.locator('#child-content #Date')).toContainText(
        format(
          new Date(
            Number(declaration.child.birthDate.yyyy),
            Number(declaration.child.birthDate.mm) - 1,
            Number(declaration.child.birthDate.dd)
          ),
          'dd MMMM yyyy'
        )
      )

      /*
       * Expected result: should include
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(page.locator('#child-content #Place')).toContainText(
        declaration.placeOfBirth
      )
      await expect(page.locator('#child-content #Place')).toContainText(
        declaration.birthLocation
      )

      /*
       * Expected result: should include
       * - Child's Attendant at birth
       */
      await expect(page.locator('#child-content #Attendant')).toContainText(
        declaration.attendantAtBirth
      )

      /*
       * Expected result: should include
       * - Child's Birth type
       */
      await expect(page.locator('#child-content #Type')).toContainText(
        declaration.birthType
      )

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expect(
        page.locator('#informant-content #Relationship')
      ).toContainText(declaration.informantType)

      /*
       * Expected result: should include
       * - Informant's Email
       */
      await expect(page.locator('#informant-content #Email')).toContainText(
        declaration.informantEmail
      )
      /*
       * Expected result: should include
       * - Informant's First Name
       * - Informant's Family Name
       */
      await expect(page.locator('#informant-content #Full')).toContainText(
        declaration.informant.name.firstNames
      )
      await expect(page.locator('#informant-content #Full')).toContainText(
        declaration.informant.name.familyName
      )

      /*
       * Expected result: should include
       * - Informant's date of birth
       */
      await expect(page.locator('#informant-content #Age')).toContainText(
        declaration.informant.age + ' years'
      )

      /*
       * Expected result: should include
       * - Informant's Nationality
       */
      await expect(
        page.locator('#informant-content #Nationality')
      ).toContainText(declaration.informant.nationality)

      /*
       * Expected result: should include
       * - Informant's address
       */
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.country
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.district
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.state
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.addressLine1
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.addressLine2
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.addressLine3
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.postcodeOrZip
      )

      /*
       * Expected result: should include
       * - Informant's Type of Id
       * - Informant's Id
       */
      await expect(page.locator('#informant-content #Type')).toContainText(
        declaration.informant.identifier.type
      )

      /*
       * Expected result: should include
       * - Mother's Details not available: true
       * - Reason of why mother's details not available
       */
      await expect(page.locator('#mother-content')).toContainText(
        "Mother's details are not availableYes"
      )
      await expect(page.locator('#mother-content #Reason')).toContainText(
        declaration.mother.reason
      )

      /*
       * Expected result: should include
       * - Father's details not available: true
       * - Reason why father's details not available
       */
      await expect(page.locator('#father-content')).toContainText(
        "Father's details are not availableYes"
      )
      await expect(page.locator('#father-content #Reason')).toContainText(
        declaration.father.reason
      )
    })
  })
})
