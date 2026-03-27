import { test, expect } from '@playwright/test'
import { goToSection, login } from '../../helpers'
import { REQUIRED_VALIDATION_ERROR } from './helpers'
import { trackAndDeleteCreatedEvents } from '../test-data/eventDeletion'

const loginAndBeginBirthDeclaration = async ({ page }: { page: import('@playwright/test').Page }) => {
  await login(page)
  await page.click('#header-new-event')

  await expect(page.getByText('New Declaration')).toBeVisible()
  await expect(
    page.getByText('What type of event do you want to declare?')
  ).toBeVisible()
  await expect(page.getByLabel('Birth')).toBeVisible()

  await page.getByLabel('Birth').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(page.getByText("Child's details")).toBeVisible()
}

trackAndDeleteCreatedEvents()

test('2.1 Validate "First Name(s)" text field', async ({ browser }) => {
  const page = await browser.newPage()
  await loginAndBeginBirthDeclaration({ page })

  await test.step('2.1.1 Enter Non-English characters - Using name: Richard the 3rd', async () => {
    await page.locator('#firstname').fill('Richard the 3rd')
    await page.getByRole('heading', { name: 'Birth' })

    /*
     * Expected result: should accept the input and not throw any error
     */
    await expect(page.locator('#firstname_error')).toBeHidden()
  })

  await test.step('2.1.1 Enter Non-English characters - Using name: John_Peter', async () => {
    await page.locator('#firstname').fill('John_Peter')
    await page.getByRole('heading', { name: 'Birth' })

    /*
     * Expected result: should accept the input and not throw any error
     */
    await expect(page.locator('#firstname_error')).toBeHidden()
  })

  await test.step('2.1.1 Enter Non-English characters - Using name: John-Peter', async () => {
    await page.locator('#firstname').fill('John-Peter')
    await page.getByRole('heading', { name: 'Birth' })

    /*
     * Expected result: should accept the input and not throw any error
     */
    await expect(page.locator('#firstname_error')).toBeHidden()
  })

  await test.step("2.1.1 Enter Non-English characters - Using name: O'Neill", async () => {
    await page.locator('#firstname').fill("O'Neill")
    await page.getByRole('heading', { name: 'Birth' })

    /*
     * Expected result: should accept the input and not throw any error
     */
    await expect(page.locator('#firstname_error')).toBeHidden()
  })

  // @TODO: This validation is not implemented in Events V2 yet
  // test.skip('Using name: &er$on')

  // @TODO: This validation is not implemented in Events V2 yet
  // test.skip('Using name: X Æ A-Xii')

  await test.step('2.1.2 Enter less than 33 English characters', async () => {
    await page.locator('#firstname').fill('Rakibul Islam')
    await page.getByRole('heading', { name: 'Birth' })

    /*
     * Expected result: should accept the input and not throw any error
     */
    await expect(page.locator('#firstname_error')).toBeHidden()
  })

  await test.step('2.1.4 Enter more than 32 English characters', async () => {
    const LONG_NAME = 'Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas'
    await page.locator('#firstname').fill(LONG_NAME)
    await page.getByRole('heading', { name: 'Birth' })

    /*
     * Expected result: should clip the name to first 32 character
     */
    await expect(page.locator('#firstname')).toHaveValue(
      LONG_NAME.slice(0, 32)
    )
  })

  await test.step('2.1.3 Enter Field as NULL', async () => {
    await goToSection(page, 'review')

    /*
     * Expected result: should throw error in application review page:
     * - Required
     */
    await expect(
      page
        .locator('[data-testid="row-value-child.name"]')
        .getByText(REQUIRED_VALIDATION_ERROR)
    ).toBeVisible()
  })
})

test('2.3.1 Select any dropdown value: "Female"', async ({ page }) => {
  await loginAndBeginBirthDeclaration({ page })
  await page.locator('#child____gender').click()
  await page.getByText('Female', { exact: true }).click()

  /*
   * Expected result: "Female" should be selected
   */
  await expect(
    page.locator('#child____gender', { hasText: 'Female' })
  ).toBeVisible()
})

test('2.3.2 Set the field as null', async ({ page }) => {
  await loginAndBeginBirthDeclaration({ page })
  await goToSection(page, 'review')

  /*
   * Expected result: should throw error in application review page:
   * - Required
   */
  await expect(
    page
      .locator('[data-testid="row-value-child.gender"]')
      .getByText(REQUIRED_VALIDATION_ERROR)
  ).toBeVisible()
})

test('2.4.1 Enter date less than the current date', async ({ page }) => {
  await loginAndBeginBirthDeclaration({ page })

  const yesterday = new Date()
  yesterday.setDate(new Date().getDate() - 1)
  const [yyyy, mm, dd] = yesterday.toISOString().split('T')[0].split('-')
  await page.getByPlaceholder('dd').fill(dd)
  await page.getByPlaceholder('mm').fill(mm)
  await page.getByPlaceholder('yyyy').fill(yyyy)
  await page.getByRole('heading', { name: 'Birth' })

  /*
   * Expected result: should accept the date
   */
  await expect(page.locator('#child____dob_error')).toBeHidden()
})

// @TODO: This validation is not implemented in Events V2 yet
// test.skip('2.4.2 Enter invalid date')

// @TODO: This validation is not implemented in Events V2 yet
// test.skip('2.4.3 Enter future date')

test('2.4.4 Set the field as null', async ({ page }) => {
  await loginAndBeginBirthDeclaration({ page })
  await goToSection(page, 'review')

  /*
   * Expected result: should throw error in application review page:
   * - Required
   */
  await expect(
    page
      .locator('[data-testid="row-value-child.dob"]')
      .getByText(REQUIRED_VALIDATION_ERROR)
  ).toBeVisible()
})

test('2.5 Validate delayed registration', async ({ browser }) => {
  const page = await browser.newPage()
  await loginAndBeginBirthDeclaration({ page })

  const fillDelayedDate = async () => {
    const delayedDate = new Date()
    delayedDate.setDate(new Date().getDate() - 365 - 5)
    const [yyyy, mm, dd] = delayedDate.toISOString().split('T')[0].split('-')
    await page.getByPlaceholder('dd').fill(dd)
    await page.getByPlaceholder('mm').fill(mm)
    await page.getByPlaceholder('yyyy').fill(yyyy)
    await page.getByRole('heading', { name: 'Birth' })
  }

  await test.step('2.5.1 Enter date after delayed registration time period', async () => {
    await fillDelayedDate()

    const lateDate = new Date()
    lateDate.setDate(new Date().getDate() - 365 + 5)
    const [yyyy, mm, dd] = lateDate.toISOString().split('T')[0].split('-')
    await page.getByPlaceholder('dd').fill(dd)
    await page.getByPlaceholder('mm').fill(mm)
    await page.getByPlaceholder('yyyy').fill(yyyy)
    await page.getByRole('heading', { name: 'Birth' })

    /*
     * Expected result: should show field:
     * - Reason for delayed registration
     */
    await expect(
      page.getByText('Reason for delayed registration')
    ).toBeHidden()
  })

  await test.step('2.5.2 Enter date before delayed registration time period', async () => {
    await fillDelayedDate()

    /*
     * Expected result: should show field:
     * - Reason for delayed registration
     */
    await expect(
      page.getByText('Reason for delayed registration')
    ).toBeVisible()
  })

  await test.step('2.5.3 Enter "Reason for late registration"', async () => {
    await fillDelayedDate()
    await page.locator('#child____reason').fill('Lack of awareness')

    /*
     * Expected result: should accept text
     */
    await expect(page.locator('#child____reason_error')).toBeHidden()
  })

  await test.step('2.5.4 Set the field as null', async () => {
    await fillDelayedDate()
    await page.locator('#child____reason').fill('')
    await goToSection(page, 'review')

    /*
     * Expected result: should throw error in application review page:
     * - Required
     */
    await expect(
      page
        .getByRole('row', { name: 'Reason for delayed' })
        .locator('[data-testid="row-value-child.reason"]')
    ).toHaveText(REQUIRED_VALIDATION_ERROR)
  })
})

test('2.6 Validate place of delivery field', async ({ browser }) => {
  const page = await browser.newPage()
  await loginAndBeginBirthDeclaration({ page })

  await test.step('2.6.2.a Validate Health Institution', async () => {
    await test.step('Select Health Institution', async () => {
      await page.locator('#child____placeOfBirth').click()
      await page.getByText('Health Institution', { exact: true }).click()

      /*
       * Expected result: should show input field for:
       * - Health institution
       */
      await expect(page.locator('#child____birthLocation')).toBeVisible()
    })

    await test.step('Enter any health institution', async () => {
      await page
        .locator('#searchable-select-child____birthLocation input')
        .fill('go')
      await page.getByText('Golden Valley Rural Health Centre').click()

      await expect(
        page.locator(
          '#searchable-select-child____birthLocation .react-select__single-value'
        )
      ).toHaveText('Golden Valley Rural Health Centre')
    })
  })

  await test.step('2.6.2.b Select Residential address', async () => {
    await page.locator('#child____placeOfBirth').click()
    await page.getByText('Residential address', { exact: true }).click()

    /*
     * Expected result:
     * - should select "Residential address" as place of birth
     * - Should show input field for address
     */
    await expect(page.locator('#child____placeOfBirth')).toContainText(
      'Residential address'
    )
    await expect(
      page.locator('#child____birthLocation____privateHome-form-input')
    ).toBeVisible()
  })

  await test.step('2.6.2.c Select Other', async () => {
    await page.locator('#child____placeOfBirth').click()
    await page.getByText('Other', { exact: true }).click()

    /*
     * Expected result:
     should select "Other" as place of birth
     * - Should show input field for address
     */
    await expect(page.locator('#child____placeOfBirth')).toContainText(
      'Other'
    )
    await expect(
      page.locator('#child____birthLocation____other-form-input')
    ).toBeVisible()
  })
})

test('2.6.1 Keep field as null', async ({ page }) => {
  await loginAndBeginBirthDeclaration({ page })
  await goToSection(page, 'review')

  /*
   * Expected result: should throw error in application review page:
   * - Required
   */
  await expect(
    page.locator('[data-testid="row-value-child.placeOfBirth"]')
  ).toHaveText(REQUIRED_VALIDATION_ERROR)
})
