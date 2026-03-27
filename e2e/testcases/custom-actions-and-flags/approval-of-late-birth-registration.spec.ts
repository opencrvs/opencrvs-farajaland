import { test, expect } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  formatDateTo_dMMMMyyyy,
  formatName,
  goToSection,
  login,
  searchFromSearchBar,
  switchEventTab,
  validateActionMenuButton
} from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../constants'
import { ensureAssigned, ensureOutboxIsEmpty, selectAction } from '../../utils'
import { selectDeclarationAction } from '../../helpers'
import { format, subDays } from 'date-fns'

const recentDate = subDays(new Date(), 2)
const recentDay = format(recentDate, 'dd')
const recentMonth = format(recentDate, 'MM')
const recentYear = format(recentDate, 'yyyy')

const lateRegDate = subDays(recentDate, 500)
const lateRegDay = format(lateRegDate, 'dd')
const lateRegMonth = format(lateRegDate, 'MM')
const lateRegYear = format(lateRegDate, 'yyyy')

test('Approval of late birth registration', async ({ browser }) => {
  const page = await browser.newPage()
  const childName = {
    firstNames: faker.person.firstName('female'),
    familyName: faker.person.lastName('female')
  }
  const childNameFormatted = formatName(childName)

  await test.step('Declaration started by HO', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Fill child details with birth date from over a year ago
    await page.locator('#firstname').fill(childName.firstNames)
    await page.locator('#surname').fill(childName.familyName)
    await page.locator('#child____gender').click()
    await page.getByText('Female', { exact: true }).click()
    await page.getByPlaceholder('dd').fill(lateRegDay)
    await page.getByPlaceholder('mm').fill(lateRegMonth)
    await page.getByPlaceholder('yyyy').fill(lateRegYear)
    await page.locator('#child____reason').fill('Late registration reason')
    await page.locator('#child____placeOfBirth').click()
    await page.getByText('Health Institution', { exact: true }).click()
    await page
      .locator('#child____birthLocation')
      .fill('Klow Village Hospital'.slice(0, 3))
    await page.getByText('Klow Village Hospital').click()
    await continueForm(page)

    // Fill informant details
    await page.locator('#informant____relation').click()
    await page.getByText('Mother', { exact: true }).click()
    await page.locator('#informant____email').fill('test@example.com')
    await continueForm(page)

    // Fill mother's details
    await page.locator('#firstname').fill(faker.person.firstName('female'))
    await page.locator('#surname').fill(faker.person.lastName('female'))
    await page.getByPlaceholder('dd').fill('12')
    await page.getByPlaceholder('mm').fill('05')
    await page.getByPlaceholder('yyyy').fill('1991')
    await page.locator('#mother____idType').click()
    await page.getByText('None', { exact: true }).click()
    await page.locator('#country').click()
    await page.locator('#country input').fill('Far')
    await page
      .locator('#country')
      .getByText('Farajaland', { exact: true })
      .click()
    await page.locator('#province').click()
    await page.getByText('Central', { exact: true }).click()
    await page.locator('#district').click()
    await page.getByText('Ibombo', { exact: true }).click()
    await page.locator('#village').click()
    await page.getByText('Klow', { exact: true }).click()
    await continueForm(page)

    // Fill father's details
    await page.locator('#firstname').fill(faker.person.firstName('male'))
    await page.locator('#surname').fill(faker.person.lastName('male'))
    await page.getByPlaceholder('dd').fill('12')
    await page.getByPlaceholder('mm').fill('05')
    await page.getByPlaceholder('yyyy').fill('1980')
    await page.locator('#father____idType').click()
    await page.getByText('None', { exact: true }).click()
    await page.locator('#father____nationality').click()
    await page.getByText('Gabon', { exact: true }).click()
    await page.locator('#father____addressSameAs_YES').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Go to review
    await goToSection(page, 'review')

    // Fill up informant comment & signature
    await page.locator('#review____comment').fill(faker.lorem.sentence())
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()

    // Declare
    await selectDeclarationAction(page, 'Declare')
    await ensureOutboxIsEmpty(page)
    await page.getByText('Recent').click()
  })

  await test.step('Declaration Review by RO', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    await page.getByText('Pending approval').click()
    await page.getByRole('button', { name: childNameFormatted }).click()
    await ensureAssigned(page)

    await expect(
      page.getByText('Approval required for late registration')
    ).toBeVisible()

    await page.getByRole('button', { name: 'Action', exact: true }).click()

    await expect(page.getByText('Approve', { exact: true })).not.toBeVisible()
  })

  await test.step('Declaration Review by Registrar', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByText('Pending approval').click()
    await page.getByRole('button', { name: childNameFormatted }).click()
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    await page.getByText('Unassign', { exact: true }).click()
    await page.getByRole('button', { name: 'Unassign', exact: true }).click()

    await expect(
      page.getByText('Not assigned', { exact: true })
    ).toBeVisible()

    await page.getByRole('button', { name: 'Action', exact: true }).click()

    await expect(page.getByText('Approve', { exact: true })).not.toBeVisible()
  })

  await test.step('Declaration Review by PR(Provincial Registrar)', async () => {
    await login(page, CREDENTIALS.PROVINCIAL_REGISTRAR)
    await page.getByText('Pending approval').first().click()
    await page.getByRole('button', { name: childNameFormatted }).click()
    await validateActionMenuButton(page, 'Approve', false)
    await ensureAssigned(page)

    await expect(
      page.getByText('Approval required for late registration')
    ).toBeVisible()

    await selectAction(page, 'Approve')

    await expect(
      page.getByText(
        'Approving this declaration confirms it as legally accepted and eligible for registration.'
      )
    ).toBeVisible()

    const confirmButton = page.getByRole('button', { name: 'Confirm' })

    await expect(confirmButton).toBeEnabled()

    const notesField = page.locator('#notes')
    await notesField.fill(
      'Approving after verifying all late submission details.'
    )

    await expect(confirmButton).toBeEnabled()

    await confirmButton.click()
    await ensureOutboxIsEmpty(page)
    await searchFromSearchBar(page, childNameFormatted)

    await expect(
      page.getByText('Approval required for late registration')
    ).not.toBeVisible()
  })

  await test.step('Audit review by Registrar', async () => {
    await login(page, CREDENTIALS.REGISTRAR, true)
    await searchFromSearchBar(page, childNameFormatted)
    await ensureAssigned(page)
    await page.getByRole('button', { name: 'Action', exact: true }).click()

    await expect(page.getByText('Approve', { exact: true })).not.toBeVisible()

    await switchEventTab(page, 'Audit')
    await page.getByRole('button', { name: 'Approved', exact: true }).click()

    await expect(
      page.getByText('Approving after verifying all late submission details.')
    ).toBeVisible()
  })
})

test('Birth with non-late registration will not have flag or Approve-action available', async ({ browser }) => {
  const page = await browser.newPage()
  const childName = {
    firstNames: faker.person.firstName('female'),
    familyName: faker.person.lastName('female')
  }
  const childNameFormatted = formatName(childName)

  await test.step('Declaration started by HO', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Fill child details with recent birth date
    await page.locator('#firstname').fill(childName.firstNames)
    await page.locator('#surname').fill(childName.familyName)
    await page.locator('#child____gender').click()
    await page.getByText('Female', { exact: true }).click()
    await page.getByPlaceholder('dd').fill(recentDay)
    await page.getByPlaceholder('mm').fill(recentMonth)
    await page.getByPlaceholder('yyyy').fill(recentYear)
    await page.locator('#child____placeOfBirth').click()
    await page.getByText('Health Institution', { exact: true }).click()
    await page
      .locator('#child____birthLocation')
      .fill('Klow Village Hospital'.slice(0, 3))
    await page.getByText('Klow Village Hospital').click()
    await continueForm(page)

    // Fill informant details
    await page.locator('#informant____relation').click()
    await page.getByText('Mother', { exact: true }).click()
    await page.locator('#informant____email').fill('test@example.com')
    await continueForm(page)

    // Fill mother's details
    await page.locator('#firstname').fill(faker.person.firstName('female'))
    await page.locator('#surname').fill(faker.person.lastName('female'))
    await page.getByPlaceholder('dd').fill('25')
    await page.getByPlaceholder('mm').fill('11')
    await page.getByPlaceholder('yyyy').fill('1984')
    await page.locator('#mother____idType').click()
    await page.getByText('None', { exact: true }).click()
    await page.locator('#country').click()
    await page.locator('#country input').fill('Far')
    await page
      .locator('#country')
      .getByText('Farajaland', { exact: true })
      .click()
    await page.locator('#province').click()
    await page.getByText('Central', { exact: true }).click()
    await page.locator('#district').click()
    await page.getByText('Ibombo', { exact: true }).click()
    await page.locator('#village').click()
    await page.getByText('Klow', { exact: true }).click()
    await continueForm(page)

    // Fill father's details
    await page.locator('#firstname').fill(faker.person.firstName('male'))
    await page.locator('#surname').fill(faker.person.lastName('male'))
    await page.getByPlaceholder('dd').fill('12')
    await page.getByPlaceholder('mm').fill('05')
    await page.getByPlaceholder('yyyy').fill('1985')
    await page.locator('#father____idType').click()
    await page.getByText('None', { exact: true }).click()
    await page.locator('#father____nationality').click()
    await page.getByText('Gabon', { exact: true }).click()
    await page.locator('#father____addressSameAs_YES').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Go to review
    await goToSection(page, 'review')

    // Fill up informant comment & signature
    await page.locator('#review____comment').fill(faker.lorem.sentence())
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()

    // Declare
    await selectDeclarationAction(page, 'Declare')
    await ensureOutboxIsEmpty(page)

    // Navigate to the record
    await page.getByText('Recent').click()
    await page.getByRole('button', { name: childNameFormatted }).click()

    await expect(
      page.getByText('Approval required for late registration')
    ).not.toBeVisible()

    await page.getByRole('button', { name: 'Action', exact: true }).click()

    await expect(page.getByText('Approve', { exact: true })).not.toBeVisible()
  })
})

test("'Approval required for late registration' -flag blocks direct registration", async ({ browser }) => {
  const page = await browser.newPage()

  await test.step('Declaration started by Registrar', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Fill child details with birth date from over a year ago
    await page.locator('#firstname').fill(faker.person.firstName())
    await page.locator('#surname').fill(faker.person.lastName())
    await page.locator('#child____gender').click()
    await page.getByText('Female', { exact: true }).click()
    await page.getByPlaceholder('dd').fill(lateRegDay)
    await page.getByPlaceholder('mm').fill(lateRegMonth)
    await page.getByPlaceholder('yyyy').fill(lateRegYear)
    await page.locator('#child____reason').fill('Late registration reason')
    await page.locator('#child____placeOfBirth').click()
    await page.getByText('Health Institution', { exact: true }).click()
    await page
      .locator('#child____birthLocation')
      .fill('Golden Valley Rural Health Centre'.slice(0, 3))
    await page.getByText('Golden Valley Rural Health Centre').click()
    await continueForm(page)

    // Fill informant details
    await page.locator('#informant____relation').click()
    await page.getByText('Mother', { exact: true }).click()
    await page.locator('#informant____email').fill('test@example.com')
    await continueForm(page)

    // Fill mother's details
    await page.locator('#firstname').fill(faker.person.firstName('female'))
    await page.locator('#surname').fill(faker.person.lastName('female'))
    await page.getByPlaceholder('dd').fill('12')
    await page.getByPlaceholder('mm').fill('05')
    await page.getByPlaceholder('yyyy').fill('1980')
    await page.locator('#country').click()
    await page.locator('#country input').fill('Far')
    await page
      .locator('#country')
      .getByText('Farajaland', { exact: true })
      .click()
    await page.locator('#province').click()
    await page.getByText('Central', { exact: true }).click()
    await page.locator('#district').click()
    await page.getByText('Ibombo', { exact: true }).click()
    await page.locator('#village').click()
    await page.getByText('Klow', { exact: true }).click()
    await page.locator('#mother____idType').click()
    await page.getByText('None', { exact: true }).click()
    await continueForm(page)

    // Fill father's details
    await page.locator('#firstname').fill(faker.person.firstName('male'))
    await page.locator('#surname').fill(faker.person.lastName('male'))
    await page.getByPlaceholder('dd').fill('12')
    await page.getByPlaceholder('mm').fill('05')
    await page.getByPlaceholder('yyyy').fill('1985')
    await page.locator('#father____idType').click()
    await page.getByText('None', { exact: true }).click()
    await page.locator('#father____nationality').click()
    await page.getByText('Gabon', { exact: true }).click()
    await page.locator('#father____addressSameAs_YES').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Go to review
    await goToSection(page, 'review')

    // Fill up informant comment & signature
    await page.locator('#review____comment').fill(faker.lorem.sentence())
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()

    // Direct registration should be unavailable
    await validateActionMenuButton(page, 'Declare')
    await validateActionMenuButton(page, 'Register', false)

    // Change child dob to recent date
    await page.getByTestId('change-button-child.dob').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByPlaceholder('dd').fill(recentDay)
    await page.getByPlaceholder('mm').fill(recentMonth)
    await page.getByPlaceholder('yyyy').fill(recentYear)
    await page.getByRole('button', { name: 'Back to review' }).click()

    // Direct registration should be available
    await validateActionMenuButton(page, 'Register')
  })
})

test('Approval of late birth registration -flag can be removed during edit and redeclare', async ({ browser }) => {
  const page = await browser.newPage()
  const childName = {
    firstNames: faker.person.firstName('female'),
    familyName: faker.person.lastName('female')
  }
  const childNameFormatted = formatName(childName)

  await test.step('Declaration started by HO', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Fill child details with birth date from over a year ago
    await page.locator('#firstname').fill(childName.firstNames)
    await page.locator('#surname').fill(childName.familyName)
    await page.locator('#child____gender').click()
    await page.getByText('Female', { exact: true }).click()
    await page.getByPlaceholder('dd').fill(lateRegDay)
    await page.getByPlaceholder('mm').fill(lateRegMonth)
    await page.getByPlaceholder('yyyy').fill(lateRegYear)
    await page.locator('#child____reason').fill('Late registration reason')
    await page.locator('#child____placeOfBirth').click()
    await page.getByText('Health Institution', { exact: true }).click()
    await page
      .locator('#child____birthLocation')
      .fill('Klow Village Hospital'.slice(0, 3))
    await page.getByText('Klow Village Hospital').click()
    await continueForm(page)

    // Fill informant details
    await page.locator('#informant____relation').click()
    await page.getByText('Mother', { exact: true }).click()
    await page.locator('#informant____email').fill('test@example.com')
    await continueForm(page)

    // Fill mother's details
    await page.locator('#firstname').fill(faker.person.firstName('female'))
    await page.locator('#surname').fill(faker.person.lastName('female'))
    await page.getByPlaceholder('dd').fill('12')
    await page.getByPlaceholder('mm').fill('05')
    await page.getByPlaceholder('yyyy').fill('1991')
    await page.locator('#mother____idType').click()
    await page.getByText('None', { exact: true }).click()
    await continueForm(page)

    // Fill father's details
    await page.locator('#firstname').fill(faker.person.firstName('male'))
    await page.locator('#surname').fill(faker.person.lastName('male'))
    await page.getByPlaceholder('dd').fill('12')
    await page.getByPlaceholder('mm').fill('05')
    await page.getByPlaceholder('yyyy').fill('1980')
    await page.locator('#father____idType').click()
    await page.getByText('None', { exact: true }).click()
    await page.locator('#father____nationality').click()
    await page.getByText('Gabon', { exact: true }).click()
    await page.locator('#father____addressSameAs_YES').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Go to review
    await goToSection(page, 'review')

    // Fill up informant comment & signature
    await page.locator('#review____comment').fill(faker.lorem.sentence())
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()

    // Declare
    await selectDeclarationAction(page, 'Declare')
    await ensureOutboxIsEmpty(page)
    await page.getByText('Recent').click()
  })

  await test.step('Declaration Review by RO', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    await page.getByText('Pending approval').click()
    await page.getByRole('button', { name: childNameFormatted }).click()
    await ensureAssigned(page)

    await expect(
      page.getByText('Approval required for late registration')
    ).toBeVisible()

    await selectAction(page, 'Edit')
    await page.getByTestId('change-button-child.dob').click()
    await page.getByPlaceholder('dd').fill(recentDay)
    await page.getByPlaceholder('mm').fill(recentMonth)
    await page.getByPlaceholder('yyyy').fill(recentYear)
    await page.getByRole('button', { name: 'Back to review' }).click()
    await selectDeclarationAction(page, 'Declare with edits')
    await ensureOutboxIsEmpty(page)
    await page.getByText('Recent').click()
    await page.getByRole('button', { name: childNameFormatted }).click()

    await expect(page.getByTestId('flags-value')).toHaveText('Validated')
    await expect(
      page.getByText('Approval required for late registration')
    ).not.toBeVisible()
    await expect(page.getByTestId('flags-value')).not.toHaveText(
      'Edit in progress'
    )
  })
})

test('Approval of late birth registration -flag can be added during edit and redeclare', async ({ browser }) => {
  const page = await browser.newPage()
  const childName = {
    firstNames: faker.person.firstName('female'),
    familyName: faker.person.lastName('female')
  }
  const childNameFormatted = formatName(childName)

  await test.step('Declaration started by RO', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Fill child details with birth date from recent date
    await page.locator('#firstname').fill(childName.firstNames)
    await page.locator('#surname').fill(childName.familyName)
    await page.locator('#child____gender').click()
    await page.getByText('Female', { exact: true }).click()
    await page.getByPlaceholder('dd').fill(recentDay)
    await page.getByPlaceholder('mm').fill(recentMonth)
    await page.getByPlaceholder('yyyy').fill(recentYear)
    await page.locator('#child____placeOfBirth').click()
    await page.getByText('Health Institution', { exact: true }).click()
    await page
      .locator('#child____birthLocation')
      .fill('Golden Valley Rural Health Centre'.slice(0, 3))
    await page.getByText('Golden Valley Rural Health Centre').click()
    await continueForm(page)

    // Fill informant details
    await page.locator('#informant____relation').click()
    await page.getByText('Mother', { exact: true }).click()
    await page.locator('#informant____email').fill('test@example.com')
    await continueForm(page)

    // Fill mother's details
    await page.locator('#firstname').fill(faker.person.firstName('female'))
    await page.locator('#surname').fill(faker.person.lastName('female'))
    await page.getByPlaceholder('dd').fill('12')
    await page.getByPlaceholder('mm').fill('05')
    await page.getByPlaceholder('yyyy').fill('1991')
    await page.locator('#mother____idType').click()
    await page.getByText('None', { exact: true }).click()
    await page.locator('#country').click()
    await page.locator('#country input').fill('Far')
    await page
      .locator('#country')
      .getByText('Farajaland', { exact: true })
      .click()
    await page.locator('#province').click()
    await page.getByText('Central', { exact: true }).click()
    await page.locator('#district').click()
    await page.getByText('Ibombo', { exact: true }).click()
    await page.locator('#village').click()
    await page.getByText('Klow', { exact: true }).click()
    await continueForm(page)

    // Fill father's details
    await page.locator('#firstname').fill(faker.person.firstName('male'))
    await page.locator('#surname').fill(faker.person.lastName('male'))
    await page.getByPlaceholder('dd').fill('12')
    await page.getByPlaceholder('mm').fill('05')
    await page.getByPlaceholder('yyyy').fill('1980')
    await page.locator('#father____idType').click()
    await page.getByText('None', { exact: true }).click()
    await page.locator('#father____nationality').click()
    await page.getByText('Gabon', { exact: true }).click()
    await page.locator('#father____addressSameAs_YES').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Go to review
    await goToSection(page, 'review')

    // Fill up informant comment & signature
    await page.locator('#review____comment').fill(faker.lorem.sentence())
    await page.getByRole('button', { name: 'Sign', exact: true }).click()
    await drawSignature(page, 'review____signature_canvas_element', false)
    await page
      .locator('#review____signature_modal')
      .getByRole('button', { name: 'Apply' })
      .click()

    // Declare
    await selectDeclarationAction(page, 'Declare')
    await ensureOutboxIsEmpty(page)
    await page.getByText('Recent').click()
  })

  await test.step('Declaration Review by Registrar', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByText('Pending registration').click()
    await page.getByRole('button', { name: childNameFormatted }).click()
    await ensureAssigned(page)

    await expect(
      page.getByText('Approval required for late registration')
    ).not.toBeVisible()

    await selectAction(page, 'Edit')
    await page.getByTestId('change-button-child.dob').click()
    await page.getByPlaceholder('dd').fill(lateRegDay)
    await page.getByPlaceholder('mm').fill(lateRegMonth)
    await page.getByPlaceholder('yyyy').fill(lateRegYear)
    await page.locator('#child____reason').fill('Late registration reason')
    await page.getByRole('button', { name: 'Back to review' }).click()
    await validateActionMenuButton(page, 'Register with edits', false)
    await selectDeclarationAction(page, 'Declare with edits')
    await ensureOutboxIsEmpty(page)
    await page.getByText('Recent').click()
    await page.getByRole('button', { name: childNameFormatted }).click()
    await ensureAssigned(page)

    await expect(
      page.getByText('Approval required for late registration')
    ).toBeVisible()
    await expect(page.getByTestId('flags-value')).not.toHaveText('Validated')
    await expect(page.getByTestId('flags-value')).not.toHaveText(
      'Edit in progress'
    )

    // Assert audit trail
    await switchEventTab(page, 'Audit')
    await page.getByRole('button', { name: 'Edited', exact: true }).click()

    await expect(
      page.getByText(
        'Date of birth' +
          formatDateTo_dMMMMyyyy(format(recentDate, 'yyyy-MM-dd')) +
          formatDateTo_dMMMMyyyy(format(lateRegDate, 'yyyy-MM-dd'))
      )
    ).toBeVisible()
    await expect(
      page.getByText(
        'Reason for delayed registration-Late registration reason'
      )
    ).toBeVisible()
  })
})
