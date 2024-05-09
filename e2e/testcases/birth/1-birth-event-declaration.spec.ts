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
