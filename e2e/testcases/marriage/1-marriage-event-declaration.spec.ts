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

  test('1.2. Validate event selection page', async ({ page }) => {
    await page.click('#header_new_event')

    await test.step('1.2.1 Validate the contents of the event type page', async () => {
      await expect(page.locator('#select_birth_event')).toBeVisible()
      await expect(page.locator('#select_death_event')).toBeVisible()
      await expect(page.locator('#select_marriage_event')).toBeVisible()
      await expect(page.locator('#goBack')).toBeVisible()
      await expect(page.locator('#continue')).toBeVisible()
      await expect(page.getByText('Exit', { exact: true })).toBeVisible()
    })

    await test.step('1.2.2 Click the "Continue" button without selecting any event', async () => {
      await page.click('#continue')
      await expect(page.locator('#require-error')).toBeVisible()
    })

    await test.step('1.2.3 Select the "Marriage" event and click "Continue" button', async () => {
      await page.click('#select_marriage_event')
      await page.click('#continue')
      await expect(
        page.locator('#form_section_id_who-is-applying-view-group')
      ).toBeVisible()
    })
    await test.step('1.3.1 Validate the content of the informant page', async () => {
      await validateSectionButtons(page)
      await expect(
        page.locator('#form_section_id_who-is-applying-view-group')
      ).toBeVisible()
      await expect(page.locator('#informantType')).toBeVisible()
      await expect(page.locator('#registrationPhone')).toBeVisible()
      await expect(page.locator('#registrationEmail')).toBeVisible()
    })
    await test.step('1.3.3 Select any option in Informant type > Click Continue', async () => {
      await page.locator('#informantType').click()
      await page.getByText('Groom', { exact: true }).click()
      await page.click('#next_section')
      await expect(
        page.locator('#form_section_id_groom-view-group')
      ).toBeVisible()
    })
    await test.step('1.5. Validate Groom Details page', async () => {
      await validateSectionButtons(page)
      await page.click('#next_section')
      await expect(
        page.locator('#form_section_id_bride-view-group')
      ).toBeVisible()
    })
    await test.step('1.6. Validate Bridge Details page', async () => {
      await validateSectionButtons(page)
      await page.click('#next_section')
      await expect(
        page.locator('#form_section_id_marriage-event-details')
      ).toBeVisible()
    })
    await test.step('1.7. Validate Marriage Details page', async () => {
      await validateSectionButtons(page)
      await page.click('#next_section')
      await expect(
        page.locator('#form_section_id_witness-view-group')
      ).toBeVisible()
    })
    await test.step('1.8. Validate witness 1 Details page', async () => {
      await validateSectionButtons(page)
      await page.click('#next_section')
      await expect(
        page.locator('#form_section_id_witness-view-group')
      ).toBeVisible()
    })
    await test.step('1.9. Validate witness 2 Details page', async () => {
      await validateSectionButtons(page)
      await page.click('#next_section')
      await expect(
        page.locator('#form_section_id_documents-view-group')
      ).toBeVisible()
    })
    await test.step('1.10. Validate Supporting document page', async () => {
      await validateSectionButtons(page)
      await page.click('#next_section')
      await expect(page.locator('#review_header')).toBeVisible()
    })
    await test.step('1.11. Validate review page', async () => {
      await expect(page.locator('#review_header')).toBeVisible()
      await expect(page.locator('#informant-accordion')).toBeVisible()
      await expect(page.locator('#groom-accordion')).toBeVisible()
      await expect(page.locator('#bride-accordion')).toBeVisible()
      await expect(page.locator('#marriageEvent-accordion')).toBeVisible()
      await expect(page.locator('#witnessOne-accordion')).toBeVisible()
      await expect(page.locator('#witnessTwo-accordion')).toBeVisible()
      await expect(
        page.locator('#supporting-documents-accordion')
      ).toBeVisible()
      await expect(page.locator('#additional_comments-accordion')).toBeVisible()
      await expect(page.locator('#groom_signature-form-input')).toBeVisible()
      await expect(page.locator('#bride_signature-form-input')).toBeVisible()
      await expect(
        page.locator('#witness_one_signature-form-input')
      ).toBeVisible()
      await expect(
        page.locator('#witness_two_signature-form-input')
      ).toBeVisible()
      await expect(page.locator('#document_section')).toBeVisible()
    })

    await test.step('1.13. Validate Supporting document page', async () => {
      await page.click('#save-exit-btn')
      await page.click('#cancel_save_exit')
      await expect(page.getByText('Save & exit?', { exact: true })).toBeHidden()
      await expect(page.locator('#review_header')).toBeVisible()
    })

    await test.step('1.12. Validate Supporting document page', async () => {
      await page.click('#save-exit-btn')
      await expect(page.locator('#cancel_save_exit')).toBeVisible()
      await expect(page.locator('#confirm_save_exit')).toBeVisible()
      await expect(
        page.getByText(
          'All inputted data will be kept secure for future editing. Are you ready to save any changes to this declaration form?',
          { exact: true }
        )
      ).toBeVisible()
      await page.click('#confirm_save_exit')
      await expect(page.locator('#content-name')).toBeVisible()
    })
    await test.step('1.14. Click the 3 dot menu and delete', async () => {
      await page.click('#eventToggleMenuToggleButton')
      await expect(page.locator('#eventToggleMenuSubMenu')).toBeVisible()
      await expect(page.locator('#eventToggleMenuItem0')).toBeVisible()
      await page.click('#eventToggleMenuItem0')
      await expect(
        page.getByText(
          'Are you certain you want to delete this draft declaration form? Please note, this action cant be undone.',
          { exact: true }
        )
      ).toBeVisible()
      await expect(page.locator('#cancel_delete')).toBeVisible()
      await expect(page.locator('#confirm_delete')).toBeVisible()
      await page.locator('#cancel_delete').click()
      await expect(
        page.getByText('Delete draft?', { exact: true })
      ).toBeHidden()

      // Confirm delete
      await page.click('#eventToggleMenuToggleButton')
      await page.click('#eventToggleMenuItem0')
      await page.locator('#confirm_delete').click()
      await expect(page.locator('#no-record')).toBeVisible()
    })
  })
})
