import { test, expect, type Page } from '@playwright/test'
import { createPIN, getRandomDate, goToSection, login } from '../../helpers'
import faker from '@faker-js/faker'
import { format } from 'date-fns'

test.describe.serial('10. Validate declaration review page', () => {
  let page: Page
  const fileName = '528KB-random.png'
  const fileUploadPath = `./e2e/testcases/marriage/assets/${fileName}`
  const declaration = {
    type: 'marriage',
    informantEmail: faker.internet.email(),
    informantDetails: {
      informantType: 'Groom',
      registrationPhone: '091234567',
      registrationEmail: faker.internet.email()
    },
    bride: {
      name: {
        firstNames: faker.name.firstName('female'),
        familyName: faker.name.lastName('female')
      },
      birthDate: getRandomDate(20, 200),
      nationality: 'Farajaland',
      identifier: {
        id: faker.random.numeric(10),
        type: 'National ID'
      },
      address: {
        Country: 'Farajaland',
        Province: 'Pualula',
        District: 'Pili'
      },
      cityPrimaryGroom: 'city',
      ruralOrUrbanPrimaryBride: 'URBAN',
      addressLine1UrbanOptionPrimaryBride: 'test',
      addressLine3UrbanOptionPrimaryBride: 'test',
      postalCodePrimaryBride: '00560'
    },
    groom: {
      name: {
        firstNames: faker.name.firstName('male'),
        familyName: faker.name.lastName('male')
      },
      birthDate: getRandomDate(22, 200),
      nationality: 'Farajaland',
      identifier: {
        id: faker.random.numeric(10),
        type: 'National ID'
      },
      address: 'Same as mother',
      cityPrimaryGroom: 'city',
      ruralOrUrbanPrimaryGroom: 'URBAN',
      addressLine1UrbanOptionPrimaryGroom: 'test',
      addressLine3UrbanOptionPrimaryGroom: 'test',
      postalCodePrimaryGroom: '00560'
    },
    marriageDetails: {
      marriageDate: getRandomDate(22, 200),
      typeOfMarriage: 'Monogamous',
      nationality: 'Farajaland',
      identifier: {
        id: faker.random.numeric(10),
        type: 'National ID'
      },
      address: {
        Country: 'Farajaland',
        Province: 'Pualula',
        District: 'Pili'
      },

      cityPlaceofmarriage: 'city',
      addressLine1UrbanOptionPlaceofmarriage: 'URBAN',
      addressLine2UrbanOptionPlaceofmarriage: 'test',
      addressLine3UrbanOptionPlaceofmarriage: 'test',
      postalCodePlaceofmarriage: '00560'
    },
    witness1: {
      name: {
        firstNames: faker.name.firstName('male'),
        familyName: faker.name.lastName('male')
      },
      relationship: "Head of groom's family"
    },
    witness2: {
      name: {
        firstNames: faker.name.firstName('male'),
        familyName: faker.name.lastName('male')
      },
      relationship: "Head of groom's family"
    }
  }
  /* test.beforeAll(async ({ browser }) => {
     page = await browser.newPage()
    await login(page, 'k.bwalya', 'test')
    await createPIN(page)
  }) */

  /* test.afterAll(async ({ page }) => {
    await page.close()
  }) */

  test.describe('10.1 Field agent actions', async () => {
    test.describe('10.1.0 Fill up marriage registration form', async () => {
      /* test('10.1.0.2 Fill informant details', async ({ page }) => {
        await page.waitForTimeout(500)
        await expect(
          page.getByText("Informant's details", { exact: true })
        ).toBeVisible()
        await page.locator('#informantType').click()
        await page
          .getByText(declaration.informantDetails.informantType, {
            exact: true
          })
          .click()

        await page.waitForTimeout(500)

        await page
          .locator('#registrationPhone')
          .fill(declaration.informantDetails.registrationPhone)

        await page
          .locator('#registrationEmail')
          .fill(declaration.informantDetails.registrationEmail)

        await page.getByRole('button', { name: 'Continue' }).click()
      }) */
      test.beforeEach(async ({ page }) => {
        await login(page, 'k.mweene', 'test')
        await createPIN(page)
        await page.locator('#header_new_event').click()
        await page.getByLabel('Marriage').click()
        await page.getByRole('button', { name: 'Continue' }).click()
      })
      test("10.1.0.3 Fill groom's details", async ({ page }) => {
        await goToSection(page, 'groom')
        await page.waitForTimeout(1000)
        await page
          .locator('#firstNamesEng')
          .fill(declaration.groom.name.firstNames)
        await page
          .locator('#familyNameEng')
          .fill(declaration.groom.name.familyName)

        await page.getByPlaceholder('dd').fill(declaration.groom.birthDate.dd)
        await page.getByPlaceholder('mm').fill(declaration.groom.birthDate.mm)
        await page
          .getByPlaceholder('yyyy')
          .fill(declaration.groom.birthDate.yyyy)

        await page.locator('#groomIdType').click()
        await page
          .getByText(declaration.groom.identifier.type, { exact: true })
          .click()

        await page
          .locator('#groomNationalId')
          .fill(declaration.groom.identifier.id)
        await page.waitForTimeout(2000)

        /*await page.locator('#statePrimaryMother').click()
        await page
          .getByText(declaration.mother.address.Province, { exact: true })
          .click()
        await page.locator('#districtPrimaryMother').click()
        await page
          .getByText(declaration.mother.address.District, { exact: true })
          .click() */
      })

      /*test("10.1.0.4 Fill bride's details", async ({ page }) => {
        await goToSection(page, 'bride')
        await page.waitForTimeout(500)
        await page
          .locator('#firstNamesEng')
          .fill(declaration.bride.name.firstNames)
        await page
          .locator('#familyNameEng')
          .fill(declaration.bride.name.familyName)

        await page.getByPlaceholder('dd').fill(declaration.bride.birthDate.dd)
        await page.getByPlaceholder('mm').fill(declaration.bride.birthDate.mm)
        await page
          .getByPlaceholder('yyyy')
          .fill(declaration.bride.birthDate.yyyy)

        await page.locator('#brideIdType').click()
        await page
          .getByText(declaration.bride.identifier.type, { exact: true })
          .click()

        await page
          .locator('#brideNationalId')
          .fill(declaration.bride.identifier.id)

        await page.locator('#statePrimaryMother').click()
        await page
          .getByText(declaration.mother.address.Province, { exact: true })
          .click()
        await page.locator('#districtPrimaryMother').click()
        await page
          .getByText(declaration.mother.address.District, { exact: true })
          .click()

        await page.getByRole('button', { name: 'Continue' }).click()
      })
      test('10.1.0.4 Fill marriage details', async ({ page }) => {
        await goToSection(page, 'marriageEvent')
        await page.waitForTimeout(500)
        await page
          .getByPlaceholder('dd')
          .fill(declaration.marriageDetails.marriageDate.dd)
        await page
          .getByPlaceholder('mm')
          .fill(declaration.marriageDetails.marriageDate.mm)
        await page
          .getByPlaceholder('yyyy')
          .fill(declaration.marriageDetails.marriageDate.yyyy)

        await page.locator('#typeOfMarriage').click()
        await page
          .getByText(declaration.marriageDetails.typeOfMarriage, {
            exact: true
          })
          .click()

        await page.locator('#statePrimaryMother').click()
        await page
          .getByText(declaration.mother.address.Province, { exact: true })
          .click()
        await page.locator('#districtPrimaryMother').click()
        await page
          .getByText(declaration.mother.address.District, { exact: true })
          .click()

        await page.getByRole('button', { name: 'Continue' }).click()
      })
      test("10.1.0.3 Fill witness1's details", async ({ page }) => {
        await goToSection(page, 'witnessOne')
        await page.waitForTimeout(500)
        await page
          .locator('#firstNamesEng')
          .fill(declaration.witness1.name.firstNames)
        await page
          .locator('#familyNameEng')
          .fill(declaration.witness1.name.familyName)

        await page.locator('#relationship').click()
        await page
          .getByText(declaration.witness1.relationship, { exact: true })
          .click()

        await page.getByRole('button', { name: 'Continue' }).click()
      })
      test("10.1.0.3 Fill witness2's details", async ({ page }) => {
        await goToSection(page, 'witnessTwo')
        await page.waitForTimeout(500)
        await page
          .locator('#firstNamesEng')
          .fill(declaration.witness2.name.firstNames)
        await page
          .locator('#familyNameEng')
          .fill(declaration.witness2.name.familyName)

        await page.locator('#relationship').click()
        await page
          .getByText(declaration.witness2.relationship, { exact: true })
          .click()
        await page.getByRole('button', { name: 'Continue' }).click()
      })*/

      test('10.1.1.1 Verify informations added in previous pages', async ({
        page
      }) => {
        await goToSection(page, 'preview')
        await page.waitForTimeout(1000)
        /*
         * Expected result: should include
         * - Groom's First Name
         * - Groom's Family Name
         * - Change button
         */
        await expect(page.locator('#groom-content #Full')).toContainText(
          declaration.groom.name.firstNames
        )
        await expect(page.locator('#groom-content #Full')).toContainText(
          declaration.groom.name.familyName
        )
        await expect(page.locator('#groom-content #Full')).toContainText(
          'Change'
        )

        /*
         * Expected result: should include
         * - Groom's date of birth
         * - Change button
         */
        await expect(page.locator('#groom-content #Date')).toContainText(
          format(
            new Date(
              Number(declaration.groom.birthDate.yyyy),
              Number(declaration.groom.birthDate.mm) - 1,
              Number(declaration.groom.birthDate.dd)
            ),
            'dd MMMM yyyy'
          )
        )

        /*
         * Expected result: should include
         * - Groom's Nationality
         * - Change button
         */
        await expect(page.locator('#groom-content #Nationality')).toContainText(
          declaration.groom.nationality
        )
        await expect(page.locator('#groom-content #Nationality')).toContainText(
          'Change'
        )

        /*
         * Expected result: should include
         * - Groom's Type of Id
         * - Groom's Id Number
         * - Change button
         */
        await expect(page.locator('#groom-content #Type')).toContainText(
          declaration.groom.identifier.type
        )
        await expect(page.locator('#groom-content #Type')).toContainText(
          'Change'
        )
        await expect(page.locator('#groom-content #ID')).toContainText(
          declaration.groom.identifier.id
        )
        await expect(page.locator('#groom-content #ID')).toContainText('Change')

        /*
         * Expected result: should include
         * - Groom's address
         * - Change button
         */

        /*await expect(page.locator('#groom-content #Usual')).toContainText(
          declaration.groom.address.Country
        )
        await expect(page.locator('#groom-content #Usual')).toContainText(
          declaration.groom.address.District
        )
        await expect(page.locator('#groom-content #Usual')).toContainText(
          declaration.groom.address.Province
        )
        await expect(page.locator('#groom-content #Usual')).toContainText(
          'Change'
        )*/

        /*
         * Expected result: should include
         * - Bride's First Name
         * - Bride's Family Name
         * - Change button
         */
        await expect(page.locator('#bride-content #Full')).toContainText(
          declaration.bride.name.firstNames
        )
        await expect(page.locator('#bride-content #Full')).toContainText(
          declaration.bride.name.familyName
        )
        await expect(page.locator('#bride-content #Full')).toContainText(
          'Change'
        )

        /*
         * Expected result: should include
         * - Bride's date of birth
         * - Change button
         */
        await expect(page.locator('#bride-content #Date')).toContainText(
          format(
            new Date(
              Number(declaration.bride.birthDate.yyyy),
              Number(declaration.bride.birthDate.mm) - 1,
              Number(declaration.bride.birthDate.dd)
            ),
            'dd MMMM yyyy'
          )
        )

        /*
         * Expected result: should include
         * - Bride's Nationality
         * - Change button
         */
        await expect(page.locator('#bride-content #Nationality')).toContainText(
          declaration.bride.nationality
        )
        await expect(page.locator('#bride-content #Nationality')).toContainText(
          'Change'
        )

        /*
         * Expected result: should include
         * - Bride's Type of Id
         * - Bride's Id Number
         * - Change button
         */
        await expect(page.locator('#bride-content #Type')).toContainText(
          declaration.bride.identifier.type
        )
        await expect(page.locator('#bride-content #Type')).toContainText(
          'Change'
        )
        await expect(page.locator('#bride-content #ID')).toContainText(
          declaration.bride.identifier.id
        )
        await expect(page.locator('#bride-content #ID')).toContainText('Change')

        /*
         * Expected result: should include
         * - Bride's address
         * - Change button
         */

        /*await expect(page.locator('#bride-content #Usual')).toContainText(
          declaration.bride.address.Country
        )
        await expect(page.locator('#bride-content #Usual')).toContainText(
          declaration.bride.address.District
        )
        await expect(page.locator('#bride-content #Usual')).toContainText(
          declaration.bride.address.Province
        )
        await expect(page.locator('#bride-content #Usual')).toContainText(
          'Change'
        )*/

        /*
         * Expected result: should include
         * - Informant's details
         * - Change button
         */
        await expect(
          page.locator('#informant-content #Relationship')
        ).toContainText(declaration.informantDetails.informantType)
        await expect(
          page.locator('#informant-content #Relationship')
        ).toContainText('Change')

        /*
         * Expected result: should include
         * - Informant's Email
         * - Change button
         */
        await expect(page.locator('#informant-content #Email')).toContainText(
          declaration.informantEmail
        )
        await expect(page.locator('#informant-content #Email')).toContainText(
          'Change'
        )

        /*
        * Expected result: should include
        - Marriage Details
        */

        await expect(
          page.locator('#marriageEvent-content #Date')
        ).toContainText(
          format(
            new Date(
              Number(declaration.marriageDetails.marriageDate.yyyy),
              Number(declaration.marriageDetails.marriageDate.mm) - 1,
              Number(declaration.marriageDetails.marriageDate.dd)
            ),
            'dd MMMM yyyy'
          )
        )

        await expect(
          page.locator('#marriageEvent-content #Type')
        ).toContainText(declaration.marriageDetails.typeOfMarriage)
        await expect(
          page.locator('#marriageEvent-content #Place')
        ).toContainText('Change')

        /*
         * Expected result: should include
         * - Marriage details address
         * - Change button
         */

        /*await expect(page.locator('#marriageEvent-content #Usual')).toContainText(
        declaration.marriageDetails.address.Country
      )
      await expect(page.locator('#marriageEvent-content #Usual')).toContainText(
        declaration.marriageDetails.address.District
      )
      await expect(page.locator('#marriageEvent-content #Usual')).toContainText(
        declaration.marriageDetails.address.Province
      )
      await expect(page.locator('#marriageEvent-content #Usual')).toContainText(
        'Change'
      )*/

        /*
         * Expected result: should include
         * - Witness1's details
         * - Change button
         */
        await expect(
          page.locator('#witnessOne-content #Witness')
        ).toContainText(
          `${declaration.witness1.name.firstNames} ${declaration.witness1.name.familyName}`
        )
        await expect(
          page.locator('#witnessOne-content #Witness')
        ).toContainText('Change')

        await expect(
          page.locator('#witnessOne-content #Relationship')
        ).toContainText(declaration.witness1.relationship)
        await expect(
          page.locator('#witnessOne-content #Relationship')
        ).toContainText('Change')

        /*
         * Expected result: should include
         * - Witness2's details
         * - Change button
         */
        await expect(
          page.locator('#witnessTwo-content #Witness')
        ).toContainText(
          `${declaration.witness2.name.firstNames} ${declaration.witness2.name.familyName}`
        )
        await expect(
          page.locator('#witnessTwo-content #Witness')
        ).toContainText('Change')

        await expect(
          page.locator('#witnessTwo-content #Relationship')
        ).toContainText(declaration.witness2.relationship)
        await expect(
          page.locator('#witnessTwo-content #Relationship')
        ).toContainText('Change')
      })
    })
  })
  test.describe('10.2. Click any "Change" link', async () => {
    test("10.2. Change groom's name", async ({ page }) => {
      await page.locator('#groom-content #Full').getByText('Change').click()
      declaration.groom.name = {
        firstNames: faker.name.firstName('male'),
        familyName: faker.name.lastName('male')
      }
      await page
        .locator('#firstNamesEng')
        .fill(declaration.groom.name.firstNames)
      await page
        .locator('#familyNameEng')
        .fill(declaration.groom.name.familyName)
      await page.getByRole('button', { name: 'Back to review' }).click()
      /*
       * Expected result: should change deceased's name
       */
      await expect(page.locator('#groom-content #Full')).toContainText(
        declaration.groom.name.firstNames
      )
      await expect(page.locator('#groom-content #Full')).toContainText(
        declaration.groom.name.familyName
      )
    })
  })
  test.describe('10.3. Validate supporting document', async () => {
    test('10.2. Validate supporting docs', async ({ page }) => {
      await page.waitForTimeout(500)
      // test.skip('Skipped for now', async () => {
      // await goToSection(page, 'documents')
      // id="uploadDocForGroom" Proof of groom's identity - Options: National ID, Passport, Birth Certificte & Other
      // id="uploadDocForBride" Proof of bride's identity
      // id="uploadDocForInformant" Proof of informant's ID
      // Upload Button id="upload_document"
      // Form seection: id="uploadDocForBride-form-input" id="uploadDocForGroom-form-input" id="uploadDocForInformant-form-input"
      // Click input[name="file-upload"]
      await page
        .locator('#uploadDocForGroom-form-input')
        .getByText('Upload')
        .click()

      await page
        .locator('#uploadDocForGroom-form-input #upload_document')
        .setInputFiles(fileUploadPath)

      await page.locator(`text=${fileName}`).click()
      await expect(page.getByText(fileName)).toBeVisible()
    })
  })
  test.describe('10.4. Validate capturing a digital signature from the Groom', async () => {
    test.skip('Skipped for now', async () => {})
  })
  test.describe('10.5. Validate capturing a digital signature from the Bride', async () => {
    test.skip('Skipped for now', async () => {})
  })
  test.describe('10.6. Validate capturing a digital signature from the Witness 1', async () => {
    test.skip('Skipped for now', async () => {})
  })
  test.describe('10.7. Validate capturing a digital signature from the Witness 2', async () => {
    test.skip('Skipped for now', async () => {})
  })
  test.describe('10.8. Validate File Uploading System', async () => {
    test.skip('Skipped for now', async () => {})
  })
  test.describe('10.9. Validate the additional comments box', async () => {
    test.skip('Skipped for now', async () => {})
  })
  test.describe('10.10. Validate the declaration send button', async () => {
    test.skip('Skipped for now', async () => {})
  })
  test.describe('10.11. Click the send button', async () => {
    test.skip('Skipped for now', async () => {})
  })
  test.describe('10.12. Confirm the declaration to send for review', async () => {
    test.skip('Skipped for now', async () => {})
  })
})
