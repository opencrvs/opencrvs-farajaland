import { expect, test } from '@playwright/test'
import { createPIN, login } from '../../helpers'
import { validateSectionButtons } from '../../helpers'

test.describe('1. Marriage event validation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'k.mweene', 'test')
    await createPIN(page)
  })

  test('1.1. Navigate to the event declaration page', async ({ page }) => {
    await page.click('#header_new_event')
    await page.waitForSelector('#continue')
  })

  test('Testcase 1', async ({ page }) => {
    await page.click('#header_new_event')

    await test.step('1.1.1 Validate the contents of the event type page', async () => {
      await expect(page.locator('#select_birth_event')).toBeVisible()
      await expect(page.locator('#select_death_event')).toBeVisible()
      await expect(page.locator('#select_marriage_event')).toBeVisible()
      await expect(page.locator('#goBack')).toBeVisible()
      await expect(page.locator('#continue')).toBeVisible()
    })

    await test.step('1.1.2 Click the "Continue" button without selecting any event', async () => {
      await page.click('#continue')
      await expect(page.locator('#require-error')).toBeVisible()
    })

    await test.step('1.1.3 Select the "Marriage" event and click "Continue" button', async () => {
      await page.click('#select_marriage_event')
      await page.click('#continue')
      await expect(
        page.locator('#form_section_id_who-is-applying-view-group')
      ).toBeVisible()
    })
    // 1.2. Is missing because marriage declaration does not have an "Introduction" page.
    await test.step('1.3.1 Validate the content of the informant page', async () => {
      await validateSectionButtons(page)
      await expect(
        page.locator('#form_section_id_who-is-applying-view-group')
      ).toBeVisible()
      await expect(page.locator('#informantType')).toBeVisible()
      await expect(page.locator('#registrationPhone')).toBeVisible()
      await expect(page.locator('#registrationEmail')).toBeVisible()
    })
    // 1.3.2 Is missing because "Informant details" page does not give an error if
    // user click continue and nothing is selected.
    await test.step('1.3.3 Select any option in Informant type > Click Continue', async () => {
      await page.locator('#informantType').click()
      await page.getByText('Groom', { exact: true }).click()
      await page.click('#next_section')
      await expect(
        page.locator('#form_section_id_groom-view-group')
      ).toBeVisible()
    })
    await test.step('1.4. Validate Groom Details page', async () => {
      await validateSectionButtons(page)
      await page.click('#next_section')
      await expect(
        page.locator('#form_section_id_bride-view-group')
      ).toBeVisible()
    })
    await test.step('1.5. Validate Bridge Details page', async () => {
      await validateSectionButtons(page)
      await page.click('#next_section')
      await expect(
        page.locator('#form_section_id_marriage-event-details')
      ).toBeVisible()
    })
    await test.step('1.6. Validate Marriage Details page', async () => {
      await validateSectionButtons(page)
      await page.click('#next_section')
      await expect(
        page.locator('#form_section_id_witness-view-group')
      ).toBeVisible()
    })
    await test.step('1.7. Validate witness 1 Details page', async () => {
      await validateSectionButtons(page)
      await page.click('#next_section')
      await expect(
        page.locator('#form_section_id_witness-view-group')
      ).toBeVisible()
    })
    await test.step('1.8. Validate witness 2 Details page', async () => {
      await validateSectionButtons(page)
      await page.click('#next_section')
      await expect(
        page.locator('#form_section_id_documents-view-group')
      ).toBeVisible()
    })
    await test.step('1.9. Validate Supporting document page', async () => {
      await validateSectionButtons(page)
      await page.click('#next_section')
      await expect(page.locator('#review_header')).toBeVisible()
    })
  })
  test('Testcase 1 Save and exit button', async ({ page }) => {
    await page.click('#header_new_event')
    await page.click('#select_marriage_event')
    await page.click('#continue')

    await test.step('1.11.1. & 1.11.2. Validate "Save & Exit" button modal content and cancel', async () => {
      await page.click('#save-exit-btn')
      await expect(
        page.getByText(
          'All inputted data will be kept secure for future editing. Are you ready to save any changes to this declaration form?',
          { exact: true }
        )
      ).toBeVisible()
      await expect(page.locator('#cancel_save_exit')).toBeVisible()
      await expect(page.locator('#confirm_save_exit')).toBeVisible()
      await page.click('#cancel_save_exit')
      await expect(page.getByText('Save & exit?', { exact: true })).toBeHidden()
    })

    await test.step('1.11.3. Confirm "Save & Exit" button', async () => {
      await page.click('#save-exit-btn')
      await page.click('#confirm_save_exit')
      await expect(page.locator('#content-name')).toBeVisible()
      await expect(page.locator('#name_0')).toBeVisible()
    })
  })
  test('Testcase 1 Exit button', async ({ page }) => {
    await page.click('#header_new_event')
    await page.click('#select_marriage_event')
    await page.click('#continue')

    await test.step('1.12.1. & 1.12.2. Validate "Exit" button modal content and cancel', async () => {
      await page.getByText('Exit', { exact: true }).click()
      await expect(
        page.getByText('Exit without saving changes?', { exact: true })
      ).toBeVisible()
      await expect(
        page.getByText(
          'You have unsaved changes on your declaration form. Are you sure you want to exit without saving?',
          { exact: true }
        )
      ).toBeVisible()
      await expect(page.locator('#cancel_save_without_exit')).toBeVisible()
      await expect(page.locator('#confirm_save_without_exit')).toBeVisible()
      await page.click('#cancel_save_without_exit')
      await expect(
        page.getByText('Exit without saving changes?', { exact: true })
      ).toBeHidden()
    })
    await test.step('1.12.3. Confirm "Exit" button', async () => {
      await page.getByText('Exit', { exact: true }).click()
      await page.click('#confirm_save_without_exit')
      await expect(page.locator('#content-name')).toBeVisible()
      await expect(page.locator('#no-record')).toBeVisible()
    })
  })

  test('Testcase 1 Three dot menu button', async ({ page }) => {
    await page.click('#header_new_event')
    await page.click('#select_marriage_event')
    await page.click('#continue')

    await test.step('1.13.3. Delete declaration from the 3 dot menu', async () => {
      await page.click('#eventToggleMenuToggleButton')
      await page.click('#eventToggleMenuItem0')
      await page.locator('#confirm_delete').click()
      await expect(page.locator('#no-record')).toBeVisible()
    })
  })
})
