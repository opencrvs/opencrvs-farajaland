import { test, expect } from '@playwright/test'

type NameConfig = {
  titlePrefix: string
  fieldName: string
  inputLocator: string
  errorLocator: string
}

export const validateName = ({
  titlePrefix,
  fieldName,
  inputLocator,
  errorLocator
}: NameConfig) => {
  test.describe(`${titlePrefix} Validate "${fieldName}" text field`, async () => {
    test.describe(`${titlePrefix}.1 Enter Non-English characters`, async () => {
      test('Using name: Richard the 3rd', async ({ page }) => {
        await page.locator(inputLocator).fill('Richard the 3rd')
        await page.getByText('Birth declaration').click()

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator(errorLocator)).toBeHidden()
      })

      test('Using name: John_Peter', async ({ page }) => {
        await page.locator(inputLocator).fill('John_Peter')
        await page.getByText('Birth declaration').click()

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator(errorLocator)).toBeHidden()
      })

      test('Using name: John-Peter', async ({ page }) => {
        await page.locator(inputLocator).fill('John-Peter')
        await page.getByText('Birth declaration').click()

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator(errorLocator)).toBeHidden()
      })

      test("Using name: O'Neill", async ({ page }) => {
        await page.locator(inputLocator).fill("O'Neill")
        await page.getByText('Birth declaration').click()

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator(errorLocator)).toBeHidden()
      })

      test('Using name: &er$on', async ({ page }) => {
        await page.locator(inputLocator).fill('&er$on')
        await page.getByText('Birth declaration').click()

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator(errorLocator)).toBeVisible()
      })

      test.skip('Using name: X Æ A-Xii', async ({ page }) => {
        await page.locator(inputLocator).fill('X Æ A-Xii')
        await page.getByText('Birth declaration').click()

        /*
         * Expected result: should throw error:
         * - Input contains invalid characters. Please use only letters (a-z), numbers (0-9), hyphens (-), and underscores (_)
         */
        await expect(page.locator(errorLocator)).toBeVisible()
      })
    })

    test(`${titlePrefix}.2 Enter less than 33 English characters`, async ({
      page
    }) => {
      await page.locator(inputLocator).fill('Rakibul Islam')
      await page.getByText('Birth declaration').click()

      /*
       * Expected result: should accept the input and not throw any error
       */
      await expect(page.locator(errorLocator)).toBeHidden()
    })

    test(`${titlePrefix}.3 Enter Field as NULL`, async ({ page }) => {
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()

      /*
       * Expected result: should throw error in application review page:
       * - Required for registration
       */
      await expect(
        page.locator('#required_label_child_firstNamesEng')
      ).toBeVisible()
    })

    test(`${titlePrefix}.4 Enter more than 32 English characters`, async ({
      page
    }) => {
      const LONG_NAME = 'Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas'
      await page.locator(inputLocator).fill(LONG_NAME)
      await page.getByText('Birth declaration').click()

      /*
       * Expected result: should clip the name to first 32 character
       */
      await expect(page.locator(inputLocator)).toHaveValue(
        LONG_NAME.slice(0, 32)
      )
    })
  })
}
