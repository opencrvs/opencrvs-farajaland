import { test, expect, type Page } from '@playwright/test'
import { createPIN, goToSection, login } from '../../../helpers'
import faker from '@faker-js/faker'

test.describe.serial('9. Birth declaration case - 9', () => {
  let page: Page
  const required = 'Required for registration'
  const declaration = {
    child: {
      name: {
        familyName: faker.name.lastName()
      }
    },
    informantType: 'Mother',
    mother: {
      detailsDontExist: false
    },
    father: {
      detailsDontExist: true
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('9.1 Declaration started by FA', async () => {
    test.beforeAll(async () => {
      await login(page, 'k.bwalya', 'test')
      await createPIN(page)
      await page.click('#header_new_event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('9.1.1 Fill child details', async () => {
      await page
        .locator('#familyNameEng')
        .fill(declaration.child.name.familyName)

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('9.1.2 Fill informant details', async () => {
      await page.waitForTimeout(500)
      await page.locator('#informantType').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with child
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test("9.1.3 Fill mother's details", async () => {
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test("9.1.4 Fill father's details", async () => {
      await page.getByLabel("Father's details are not available").check()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('9.1.5 Go to preview', async () => {
      goToSection(page, 'preview')
    })

    test('9.1.6 Verify informations in preview page', async () => {
      /*
       * Expected result: should include
       * - Child's Family Name
       * * should require
       * - Child's First Name
       */
      await expect(page.locator('#child-content #Full')).toContainText(required)
      await expect(page.locator('#child-content #Full')).toContainText(
        declaration.child.name.familyName
      )

      /*
       * Expected result: should require
       * - Child's Gender
       */
      await expect(page.locator('#child-content #Sex')).toContainText(required)

      /*
       * Expected result: should require
       * - Child's date of birth
       */
      await expect(page.locator('#child-content #Date')).toContainText(required)

      /*
       * Expected result: should require
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(page.locator('#child-content #Place')).toContainText(
        required
      )
      await expect(page.locator('#child-content #Place')).toContainText(
        required
      )

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expect(page.locator('#informant-content')).toContainText(
        declaration.informantType
      )

      /*
       * Expected result: should require
       * - Informant's Email
       */
      await expect(page.locator('#informant-content #Email')).toContainText(
        'Must be a valid email address'
      )

      /*
       * Expected result: should require
       * - Mother's First Name
       * - Mother's Family Name
       */
      await expect(page.locator('#mother-content #Full')).toContainText(
        required
      )
      await expect(page.locator('#mother-content #Full')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Mother's date of birth
       */
      await expect(page.locator('#mother-content #Date')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Mother's Type of Id
       */
      await expect(page.locator('#mother-content #Type')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Reason of why father's details not available
       */
      await expect(page.locator('#father-content #Reason')).toContainText(
        required
      )
    })

    test('9.1.7 Send for review', async () => {
      await page.getByRole('button', { name: 'Send for review' }).click()
      await expect(page.getByText('Send for review?')).toBeVisible()
      await page.getByRole('button', { name: 'Confirm' }).click()
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to registration home
       */
      expect(page.url().includes('registration-home')).toBeTruthy()

      await expect(page.locator('#navigation_outbox')).not.toContainText('1', {
        timeout: 1000 * 30
      })

      await page.getByRole('button', { name: 'Sent for review' }).click()

      /*
       * Expected result: The declaration should be in sent for review
       */
      await expect(
        page.getByRole('button', {
          name: `${declaration.child.name.familyName}`
        })
      ).toBeVisible()
    })
  })

  test.describe('9.2 Declaration Review by RA', async () => {
    test('9.2.1 Navigate to the declaration review page', async () => {
      await login(page, 'f.katongo', 'test')
      await createPIN(page)
      await page.getByRole('button', { name: 'In Progress' }).click()
      await page.getByRole('button', { name: 'Field Agents' }).click()
      await page
        .getByRole('button', {
          name: `${declaration.child.name.familyName}`
        })
        .click()
      await page.getByLabel('Assign record').click()
      await page.getByRole('button', { name: 'Assign', exact: true }).click()
      await page.getByRole('button', { name: 'Update', exact: true }).click()
    })

    test('9.2.2 Verify informations in preview page', async () => {
      /*
       * Expected result: should include
       * - Child's Family Name
       * * should require
       * - Child's First Name
       */
      await expect(page.locator('#child-content #Full')).toContainText(required)
      await expect(page.locator('#child-content #Full')).toContainText(
        declaration.child.name.familyName
      )

      /*
       * Expected result: should require
       * - Child's Gender
       */
      await expect(page.locator('#child-content #Sex')).toContainText(required)

      /*
       * Expected result: should require
       * - Child's date of birth
       */
      await expect(page.locator('#child-content #Date')).toContainText(required)

      /*
       * Expected result: should require
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(page.locator('#child-content #Place')).toContainText(
        required
      )
      await expect(page.locator('#child-content #Place')).toContainText(
        required
      )

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expect(page.locator('#informant-content')).toContainText(
        declaration.informantType
      )

      /*
       * Expected result: should require
       * - Informant's Email
       */
      await expect(page.locator('#informant-content #Email')).toContainText(
        'Must be a valid email address'
      )

      /*
       * Expected result: should require
       * - Mother's First Name
       * - Mother's Family Name
       */
      await expect(page.locator('#mother-content #Full')).toContainText(
        required
      )
      await expect(page.locator('#mother-content #Full')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Mother's date of birth
       */
      await expect(page.locator('#mother-content #Date')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Mother's Type of Id
       */
      await expect(page.locator('#mother-content #Type')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Reason of why father's details not available
       */
      await expect(page.locator('#father-content #Reason')).toContainText(
        required
      )
    })
  })
})