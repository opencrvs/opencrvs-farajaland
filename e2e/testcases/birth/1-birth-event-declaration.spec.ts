import { expect, test } from '@playwright/test'
import { createPIN, getToken, login } from '../../helpers'
import { createDeclaration } from './helpers'
import TEST_DATA_1 from './data/1-both-mother-and-father.json'
import faker from '@faker-js/faker'

test.describe('1. Birth event declaration', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'k.mweene', 'test')
    await createPIN(page)
  })

  test('1.1. Navigate to the birth event declaration page', async ({
    page
  }) => {
    await page.click('#header_new_event')
    await page.waitForSelector('#continue')

    await test.step('1.2. Validate event selection page', async () => {
      await test.step('1.2.1 Validate the contents of the event type page', async () => {
        /*
         * Expected result: should show
         * - Radio buttons of the events
         * - Continue button
         * - Exit button
         */
        await expect(page.locator('#select_birth_event')).toBeVisible()
        await expect(page.locator('#select_death_event')).toBeVisible()
        await expect(page.locator('#select_marriage_event')).toBeVisible()
        await expect(page.locator('#goBack')).toBeVisible()
        await expect(page.locator('#continue')).toBeVisible()
      })

      await test.step('1.2.2 Click the "Continue" button without selecting any event', async () => {
        await page.click('#continue')
        /*
         * Expected result: should throw an error as below:
         * "Please select the type of event"
         */
        await expect(page.locator('#require-error')).toBeVisible()
      })

      await test.step('1.2.3 Select the "Birth" event and click "Continue" button', async () => {
        await page.click('#select_birth_event')
        await page.click('#continue')
        /*
         * Expected result: User should navigate to the "Introduction" page
         */
        await expect(
          page.locator('#form_section_id_information-group')
        ).toBeVisible()
      })
    })

    await test.step('1.3 Validate "Introduction" page', async () => {
      await test.step('1.3.1 Validate the contents of Introduction page', async () => {})
      await test.step('1.3.2. Verify the verbiage of Introduction page of birth event', async () => {})
      await test.step('1.3.3. Click the "Continue" button ', async () => {})
    })

    await test.step('1.4 Validate "Child Details" page', async () => {
      await test.step('1.4.1. Validate the contents of Child details page', async () => {})
      await test.step('1.4.2. Validate Child details block', async () => {})
      await test.step('1.4.3. Click Continue', async () => {})
    })

    await test.step('1.5 Validate "Informant details" page', async () => {
      await test.step('1.5.1. Validate the contents of Informant type page', async () => {})
      await test.step('1.5.2. Click the "Continue" button without selecting any Relationship to child', async () => {})
      await test.step('1.5.3. Select any option in Relationship to child > Click Continue', async () => {})
    })

    await test.step('1.6 Validate "Mother Details" page', async () => {
      await test.step("1.6.1. Validate the contents of Mother's details page", async () => {})
      await test.step("1.6.2. Validate Mother's details block", async () => {})
      await test.step('1.6.3. Click Continue', async () => {})
    })

    await test.step('1.7 Validate "Father Details" page', async () => {
      await test.step("1.7.1. Validate the contents of Father's details page", async () => {})
      await test.step("1.7.2. Validate Father's details block", async () => {})
      await test.step('1.7.3. Click Continue', async () => {})
    })

    await test.step('1.8 Validate "Supporting document" page', async () => {
      await test.step('1.8.1. Validate the contents of Supporting document page', async () => {})
      await test.step('1.8.2. Validate Supporting document block', async () => {})
      await test.step('1.8.3. Click Continue', async () => {})
    })

    await test.step('1.9 Click the "SAVE & EXIT" button from any page', async () => {
      await test.step('1.9.1. Click Confirm', async () => {})
      await test.step('1.9.2. Click Cancel', async () => {})
    })

    await test.step('1.10 Click the "EXIT" button from any page', async () => {
      await test.step('1.10.1. Click Confirm', async () => {})
      await test.step('1.10.2. Click Cancel', async () => {})
    })

    await test.step('1.11 Click the 3 dot menu > delete option from any page', async () => {
      await test.step('1.11.1. Click Confirm', async () => {})
      await test.step('1.11.2. Click Cancel', async () => {})
    })
  })
})

test.describe('Technical test for shortcuts', () => {
  test('Shortcut for quickly creating declarations', async () => {
    const token = await getToken('k.mweene', 'test')
    const res = await createDeclaration(token, {
      child: {
        firstNames: faker.name.firstName(),
        familyName: faker.name.firstName(),
        gender: TEST_DATA_1['Child details'].Sex.toLowerCase() as 'male'
      },
      informant: {
        type: TEST_DATA_1['Informant details'][
          'Relationship to child'
        ].toUpperCase() as 'MOTHER'
      },
      attendant: {
        type: TEST_DATA_1['Child details'][
          'Attendant at birth'
        ].toUpperCase() as 'PHYSICIAN'
      },
      mother: {
        firstNames: faker.name.firstName(),
        familyName: faker.name.firstName()
      },
      father: {
        firstNames: faker.name.firstName(),
        familyName: faker.name.firstName()
      }
    })

    expect(res).toStrictEqual({
      trackingId: expect.any(String),
      compositionId: expect.any(String),
      isPotentiallyDuplicate: false,
      __typename: 'CreatedIds'
    })
  })
})
