import { test, expect, type Page } from '@playwright/test'
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
import { navigateToCertificatePrintAction } from '../print-certificate/birth/helpers'

const recentDate = subDays(new Date(), 10)
const recentDay = format(recentDate, 'dd')
const recentMonth = format(recentDate, 'MM')
const recentYear = format(recentDate, 'yyyy')

const motherBirhtDate = subDays(
  recentDate,
  faker.number.int({ min: 20 * 365, max: 50 * 365 })
)
const motherDay = format(motherBirhtDate, 'dd')
const motherMonth = format(motherBirhtDate, 'MM')
const motherYear = format(motherBirhtDate, 'yyyy')

const email = faker.internet.email()
test.describe.serial('Complete Declaration with Certified copy', () => {
  let page: Page

  const childName = {
    firstNames: faker.person.firstName('female'),
    familyName: faker.person.lastName('female')
  }

  const childNameFormatted = formatName(childName)

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('Declaration started by HO', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Fill child details with birth date from over a year ago', async () => {
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
    })

    test('Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page.getByText('Mother', { exact: true }).click()

      await page.locator('#informant____email').fill(email)

      await continueForm(page)
    })

    test("Fill mother's details", async () => {
      await page.locator('#firstname').fill(faker.person.firstName('female'))
      await page.locator('#surname').fill(faker.person.lastName('female'))

      await page.getByPlaceholder('dd').fill(motherDay)
      await page.getByPlaceholder('mm').fill(motherMonth)
      await page.getByPlaceholder('yyyy').fill(motherYear)

      await page.locator('#mother____idType').click()
      await page.getByText('None', { exact: true }).click()

      await continueForm(page)
    })

    test("Fill father's details", async () => {
      await page.locator('#firstname').fill(faker.person.firstName('male'))
      await page.locator('#surname').fill(faker.person.lastName('male'))

      await page.getByPlaceholder('dd').fill('12')
      await page.getByPlaceholder('mm').fill('05')
      await page.getByPlaceholder('yyyy').fill('1989')

      await page.locator('#father____idType').click()
      await page.getByText('None', { exact: true }).click()

      await page.locator('#father____nationality').click()
      await page.getByText('Gabon', { exact: true }).click()

      await page.locator('#father____addressSameAs_YES').click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('Fill up informant comment & signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('Declare', async () => {
      await selectDeclarationAction(page, 'Declare')
      await ensureOutboxIsEmpty(page)
      await page.getByText('Recent').click()
    })
  })

  test.describe('Declaration Review by RO', async () => {
    test('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
      await page.getByText('Pending Validation').click()
      await page.getByRole('button', { name: childNameFormatted }).click()
      await ensureAssigned(page)
    })
    test.skip("Event should have the 'No flags' -flag", async () => {
      await expect(page.getByText('No flags')).toBeVisible()
    })
    test('Validate Declaration performed by RO', async () => {
      await selectAction(page, 'Validate declaration')
      await expect(
        page.getByText(
          'Validating this declaration confirms it meets all requirements and is eligible for registration.'
        )
      ).toBeVisible()

      const confirmButton = page.getByRole('button', { name: 'Confirm' })
      await expect(confirmButton).toBeEnabled()

      const notesField = page.locator('#comments')
      await notesField.fill(
        'Validating after verifying all late submission details.'
      )

      await expect(confirmButton).toBeEnabled()
      await confirmButton.click()
    })
    test("Event should have the 'Validated' -flag and 'Declared' -Status", async () => {
      await searchFromSearchBar(page, childNameFormatted)
      await expect(page.getByText('Validated')).toBeVisible()
      await expect(page.getByText('Declared')).toBeVisible()
    })
  })
  test.describe('Declaration Review by Registrar ', async () => {
    test('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.REGISTRAR)

      await searchFromSearchBar(page, childNameFormatted)
      // await searchFromSearchBar(page, 'Vicky Pacocha')
      await expect(page.getByText('Registered')).toBeVisible()

      // await page.getByRole('button', {name: /Vicky Pacocha/}).click()
      await ensureAssigned(page)
      const row = page
        .getByTestId('assignedTo')
        .filter({ hasText: 'Assigned to' })
      await expect(row.getByText('Kennedy Mweene')).toBeVisible()
    })
    test("Event should have the 'Declared' -Status & 'Validated' -flag", async () => {
      await expect(page.getByText('Declared')).toBeVisible()
      await expect(page.getByText('Validated')).toBeVisible()
    })
    test('Register the declaration Registrar', async () => {
      await selectAction(page, 'Register')
      await expect(
        page.getByText(
          'Registering this birth event will create an official civil registration record. Please ensure all details are correct before proceeding.'
        )
      ).toBeVisible()

      const confirmButton = page.getByRole('button', { name: 'Confirm' })
      await expect(confirmButton).toBeEnabled()
      await confirmButton.click()
    })
    test("Event should have the 'Validated' -flag", async () => {
      await searchFromSearchBar(page, childNameFormatted)
      await expect(page.getByText('Registered')).toBeVisible()
    })
  })
  test.describe('Print in advance ', async () => {
    test('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)

      await searchFromSearchBar(page, childNameFormatted)
      await expect(page.getByText('Registered')).toBeVisible()
      await ensureAssigned(page)
      const row = page
        .getByTestId('assignedTo')
        .filter({ hasText: 'Assigned to' })
      await expect(row.getByText('Kennedy Mweene')).toBeVisible()
    })
    test('Navigate to print', async () => {
      await navigateToCertificatePrintAction(page, { 'child.name': childName })
    })
  })
})
