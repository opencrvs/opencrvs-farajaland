import { expect, test } from '@playwright/test'
import { createPIN, getRandomDate, login } from '../../helpers'
import { validateSectionButtons } from '../../helpers'
import faker from '@faker-js/faker'

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
    relationship: 'Head of grooms family'
  },
  witness2: {
    name: {
      firstNames: faker.name.firstName('male'),
      familyName: faker.name.lastName('male')
    },
    relationship: 'Head of grooms family'
  }
}

test.describe('1. Marriage event validation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'k.mweene', 'test')
    await createPIN(page)
  })

  test('1. Navigate to the event declaration page', async ({ page }) => {
    await page.click('#header_new_event')
    await page.waitForSelector('#continue')
  })

  test('2. Validate event selection page', async ({ page }) => {
    await page.click('#header_new_event')

    await test.step('2.1.1. Validate the contents of the event type page', async () => {
      await expect(page.getByText('Birth', { exact: true })).toBeVisible()
      await expect(page.getByText('Death', { exact: true })).toBeVisible()
      await expect(page.getByText('Marriage', { exact: true })).toBeVisible()
      await expect(page.getByText('Exit', { exact: true })).toBeVisible()
      await expect(page.getByText('Continue', { exact: true })).toBeVisible()
    })

    await test.step('2.1.2 Click the "Continue" button without selecting any event', async () => {
      await page.getByText('Continue', { exact: true }).click()
      await expect(
        page.getByText('Please select the type of event', { exact: true })
      ).toBeVisible()
    })

    await test.step('2.1.3 Select the "Marriage" event and click "Continue" button', async () => {
      await page.getByText('Marriage', { exact: true }).click()
      await page.getByText('Continue', { exact: true }).click()
      await expect(
        page.getByText("Informant's details", { exact: true })
      ).toBeVisible()
    })
  })
  test('3. Validate Informant details page', async ({ page }) => {
    await test.step('3.1. Validate the contents of Informant type page', async () => {
      await validateSectionButtons(page)
      await expect(
        page.locator('label', { hasText: 'Informant type' })
      ).toBeVisible()
      await expect(
        page.locator('label', { hasText: 'Phone number' })
      ).toBeVisible()
      await expect(page.locator('label', { hasText: 'Email' })).toBeVisible()
    })

    await test.step('3.2. Click the "Continue" button without selecting any Informant type', async () => {})
    await test.step('3.3. Select Bride/ Groom in informant type', async () => {
      await page.locator('#informantType').click()
      await page
        .getByText(declaration.informantDetails.informantType, {
          exact: true
        })
        .click()
      await expect(
        page.getByText(declaration.informantDetails.informantType, {
          exact: true
        })
      ).toBeVisible()
    })

    test('4. Validate Informant details phone field', async ({ page }) => {
      await test.step('4.1. Validate Informant phone number field', async () => {
        // 1. Set the Phone number field as null
        page.locator('label', { hasText: 'Phone number' }).click()
        page.getByText("Informant's details", { exact: true }).click()
        await expect(
          page.getByText('Required for registration', { exact: true })
        ).toBeVisible()
      })
      await test.step('4.2. Validate Informant phone number field', async () => {
        // 2. Input any contact number starting with any number except "07/09"
        page.locator('label', { hasText: 'Phone number' }).fill('123456789')
        await expect(
          page.getByText('Must be a valid 10 digit number that starts with 0', {
            exact: true
          })
        ).toBeVisible()
      })

      await test.step('4.3. Validate Informant phone number field', async () => {
        // 3. Input any number which is less or greater than 10 digits
        page.locator('label', { hasText: 'Phone number' }).fill('092345')
        await expect(
          page.getByText('Must be a valid 10 digit number that starts with 0', {
            exact: true
          })
        ).toBeVisible()
      })

      await test.step('4.4. Validate Informant phone number field', async () => {
        // 4. Input a valid 10 digit number that starts with "0"
        page.locator('label', { hasText: 'Phone number' }).fill('0923456789')
        await expect(
          page.getByText('Must be a valid 10 digit number that starts with 0', {
            exact: true
          })
        ).toBeHidden()
        await expect(
          page.getByText('Required for registration', { exact: true })
        ).toBeHidden()
      })
      test('5. Validate Informant details email field', async ({ page }) => {
        await test.step('5.1. Enter valid Email address', async () => {
          page.locator('label', { hasText: 'Email' }).fill('test@hotmail.com')
          await expect(
            page.getByText('Invalid email', {
              exact: true
            })
          ).toBeHidden()
          await expect(
            page.getByText('Required for registration', { exact: true })
          ).toBeHidden()
        })
        await test.step('5.2. Enter Invalid Email address', async () => {
          page.locator('label', { hasText: 'Email' }).fill('testhotmail.com')
          await expect(
            page.getByText('Invalid email', {
              exact: true
            })
          ).toBeVisible()
        })
        await test.step('5.3. Keep Email address empty > Click on the "Continue" button', async () => {
          page.locator('label', { hasText: 'Email' }).click()
          page.getByText("Informant's details", { exact: true }).click()
          await expect(
            page.getByText('Required for registration', { exact: true })
          ).toBeVisible()
        })
        await test.step('5.4. Click Continue ', async () => {
          await page.getByText('Continue', { exact: true }).click()
          await expect(
            page.getByText("Groom's details", { exact: true })
          ).toBeVisible()
        })
      })
    })
    test('6. Validate Groom Details page', async ({ page }) => {
      await test.step('6.2. Validate Groom Details page', async () => {
        await validateSectionButtons(page)
        await page.getByText('Continue', { exact: true }).click()
        await expect(
          page.getByText("Bride's details", { exact: true })
        ).toBeVisible()
      })
    })
    test('7. Validate Bridge Details page', async ({ page }) => {
      await test.step('7.2. Validate Bridge Details page', async () => {
        await validateSectionButtons(page)
        await page.getByText('Continue', { exact: true }).click()
        await expect(
          page.getByText('Marriage details', { exact: true })
        ).toBeVisible()
      })
    })
    test('8. Validate Marriage Details page', async ({ page }) => {
      await test.step('8.2. Validate Marriage Details page', async () => {
        await validateSectionButtons(page)
        await page.getByText('Continue', { exact: true }).click()
        await expect(
          page.getByText('Witness 1 details', { exact: true })
        ).toBeVisible()
      })
    })
    test('9. Validate witness 1 Details page', async ({ page }) => {
      await test.step('9.2. Validate witness 1 Details page', async () => {
        await validateSectionButtons(page)
        await page.getByText('Continue', { exact: true }).click()
        await expect(
          page.getByText('Witness 2 details', { exact: true })
        ).toBeVisible()
      })
    })
    test('10. Validate witness 1 Details page', async ({ page }) => {
      await test.step('10.2. Validate witness 2 Details page', async () => {
        await validateSectionButtons(page)
        await page.getByText('Continue', { exact: true }).click()
        await expect(
          page.getByText('Upload supporting documents', { exact: true })
        ).toBeVisible()
      })
    })
    test('11. Validate Supporting document page', async ({ page }) => {
      await test.step('11.2. Validate Supporting document page', async () => {
        await validateSectionButtons(page)
        await page.getByText('Continue', { exact: true }).click()
        page.getByText('Register event', { exact: true })
      })
    })
  })
})
