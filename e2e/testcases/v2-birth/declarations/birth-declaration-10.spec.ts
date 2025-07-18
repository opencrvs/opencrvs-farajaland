import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  formatName,
  goToSection,
  loginToV2
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS, SAFE_WORKQUEUE_TIMEOUT_MS } from '../../../constants'
import { REQUIRED_VALIDATION_ERROR } from '../helpers'
import { ensureOutboxIsEmpty } from '../../../v2-utils'
test.describe.serial('10. Birth declaration case - 10', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.lastName(),
        familyName: faker.person.lastName()
      }
    },
    informantType: 'Father',
    mother: {
      detailsDontExist: true
    },
    father: {
      detailsDontExist: false
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('10.1 Declaration started by FA', async () => {
    test.beforeAll(async () => {
      await loginToV2(page, CREDENTIALS.FIELD_AGENT)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('10.1.1 Fill child details', async () => {
      await page.locator('#firstname').fill(declaration.child.name.firstNames)
      await page.locator('#surname').fill(declaration.child.name.familyName)

      await continueForm(page)
    })

    test('10.1.2 Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await continueForm(page)
    })

    test("10.1.3 Fill mother's details", async () => {
      await page.getByLabel("Mother's details are not available").check()
      await continueForm(page)
    })

    test("10.1.4 Fill father's details", async () => {
      await continueForm(page)
    })

    test('10.1.5 Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('10.1.6 Verify information on review page', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.getByTestId('row-value-child.name')).toContainText(
        declaration.child.name.firstNames +
          ' ' +
          declaration.child.name.familyName
      )

      /*
       * Expected result: should require
       * - Child's Gender
       */
      await expect(page.getByTestId('row-value-child.gender')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Child's date of birth
       */
      await expect(page.getByTestId('row-value-child.dob')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(
        page.getByTestId('row-value-child.placeOfBirth')
      ).toContainText(REQUIRED_VALIDATION_ERROR)

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expect(
        page.getByTestId('row-value-informant.relation')
      ).toContainText(declaration.informantType)

      /*
       * Expected result: should require
       * - Informant's Email
       */
      await expect(page.getByTestId('row-value-informant.email')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Reason of why mother's details not available
       */
      await expect(page.getByTestId('row-value-mother.reason')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Father's First Name
       * - Father's Family Name
       */
      await expect(page.getByTestId('row-value-father.name')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Father's date of birth
       */
      await expect(page.getByTestId('row-value-father.dob')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Father's Type of Id
       */
      await expect(page.getByTestId('row-value-father.idType')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )
    })

    test('10.1.7 Fill up informant signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign' }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('10.1.8 Send for review', async () => {
      await page.getByRole('button', { name: 'Send for review' }).click()
      await expect(page.getByText('Send for review?')).toBeVisible()
      await page.getByRole('button', { name: 'Confirm' }).click()

      await ensureOutboxIsEmpty(page)
      await page.getByText('Sent for review').click()

      await expect(
        page.getByRole('button', {
          name: formatName(declaration.child.name)
        })
      ).toBeVisible()
    })
  })

  test.describe('10.2 Declaration Review by RA', async () => {
    test('10.2.1 Navigate to the declaration review page', async () => {
      await loginToV2(page, CREDENTIALS.REGISTRATION_AGENT)

      await page.getByText('Notifications').click()

      await page
        .getByRole('button', {
          name: formatName(declaration.child.name),
          exact: true
        })
        .click()
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      await page.getByText('View record').click()
    })

    test('10.2.2 Verify information on preview page', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * * should require
       * - Child's Family Name
       */
      await expect(page.getByTestId('row-value-child.name')).toContainText(
        declaration.child.name.firstNames
      )

      /*
       * Expected result: should require
       * - Child's Gender
       */
      await expect(page.getByTestId('row-value-child.gender')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Child's date of birth
       */
      await expect(page.getByTestId('row-value-child.dob')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(
        page.getByTestId('row-value-child.placeOfBirth')
      ).toContainText(REQUIRED_VALIDATION_ERROR)

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expect(
        page.getByTestId('row-value-informant.relation')
      ).toContainText(declaration.informantType)

      /*
       * Expected result: should require
       * - Informant's Email
       */
      await expect(page.getByTestId('row-value-informant.email')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Reason of why mother's details not available
       */
      await expect(page.getByTestId('row-value-mother.reason')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Father's First Name
       * - Father's Family Name
       */
      await expect(page.getByTestId('row-value-father.name')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Father's date of birth
       */
      await expect(page.getByTestId('row-value-father.dob')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )

      /*
       * Expected result: should require
       * - Father's Type of Id
       */
      await expect(page.getByTestId('row-value-father.idType')).toContainText(
        REQUIRED_VALIDATION_ERROR
      )
    })
  })
})
