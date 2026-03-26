import { expect, test, type Page } from '@playwright/test'
import {
  auditRecord,
  getToken,
  login,
  logout,
  uploadImageToSection
} from '../../helpers'
import { faker } from '@faker-js/faker'
import {
  createDeclaration as createDeclarationV2,
  Declaration as DeclarationV2
} from '../test-data/birth-declaration-with-mother-father'
import { format, subDays, subYears } from 'date-fns'
import { CREDENTIALS } from '../../constants'
import { formatV2ChildName } from '../birth/helpers'
import { ensureAssigned, selectAction } from '../../utils'

test("Correct record - Change father's ID number", async ({ browser }) => {
  let declaration: DeclarationV2

  
  let trackingId = ''

  
  let page: Page
  page = await browser.newPage()

  const oldIdNumber = faker.string.numeric(10)

  
  const newIdNumber = faker.string.numeric(10)

  await test.step('Shortcut declaration', async () => {

    
    let token = await getToken(
      CREDENTIALS.REGISTRAR.USERNAME,
      CREDENTIALS.REGISTRAR.PASSWORD
    )

    
    const res = await createDeclarationV2(
      token,
      {
        'child.name': {
          firstname: faker.person.firstName('male'),
          surname: faker.person.lastName()
        },
        'child.gender': 'male',
        'child.dob': format(subDays(new Date(), 2), 'yyyy-MM-dd'),
        'child.placeOfBirth': 'PRIVATE_HOME',
        'child.attendantAtBirth': 'PHYSICIAN',
        'child.birthType': 'SINGLE',
        'child.weightAtBirth': 3,
        'informant.relation': 'MOTHER',
        'informant.phoneNo': '0911725897',
        'mother.name': {
          firstname: faker.person.firstName('female'),
          surname: faker.person.lastName('female')
        },
        'mother.dob': format(subYears(new Date(), 29), 'yyyy-MM-dd'),
        'mother.nationality': 'FAR',
        'mother.idType': 'NATIONAL_ID',
        'mother.nid': faker.string.numeric(10),
        'mother.maritalStatus': 'SINGLE',
        'mother.educationalAttainment': 'NO_SCHOOLING',
        'mother.occupation': 'Housewife',
        'mother.previousBirths': 0,
        'father.name': {
          firstname: faker.person.firstName('male'),
          surname: faker.person.lastName('male')
        },
        'father.detailsNotAvailable': false,
        'father.dob': format(subYears(new Date(), 31), 'yyyy-MM-dd'),
        'father.idType': 'NATIONAL_ID',
        'father.nid': oldIdNumber,
        'father.nationality': 'FAR',
        'father.maritalStatus': 'SINGLE',
        'father.educationalAttainment': 'NO_SCHOOLING',
        'father.occupation': 'Unemployed',
        'father.addressSameAs': 'YES'
      },
      'REGISTER',
      'PRIVATE_HOME'
    )

    
    expect(res).toEqual(
      expect.objectContaining({
        trackingId: expect.any(String)
      })
    )

    
    trackingId = res.trackingId!

    
    token = await getToken('k.mweene', 'test')

    
    declaration = res.declaration

  })

  await test.step('Login as RO', async () => {

    
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)

  })

  await test.step('Ready to correct record > record audit', async () => {

    
    await auditRecord({
      page,
      name: formatV2ChildName(declaration),
      trackingId
    })

    
    await ensureAssigned(page)

    

    await selectAction(page, 'Correct')

  })

  await test.step('Correction requester: legal guardian', async () => {

    
    await page.locator('#requester____type').click()

    
    await page.getByText('Legal Guardian', { exact: true }).click()

    
    await page.locator('#reason____option').click()

    
    await page
      .getByText('Informant provided incorrect information (Material error)', {
        exact: true
      })
      .click()

    
    await page.getByRole('button', { name: 'Continue' }).click()

  })

  await test.step('Verify identity', async () => {

    
    await page.getByRole('button', { name: 'Verified' }).click()

  })

  await test.step('Upload supporting documents', async () => {

    
    expect(page.url().includes('correction')).toBeTruthy()

    

    expect(page.url().includes('onboarding/documents')).toBeTruthy()

    

    await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled()

    

    const imageUploadSectionTitles = ['Affidavit', 'Court Document', 'Other']

    

    for (const sectionTitle of imageUploadSectionTitles) {
      await uploadImageToSection({
        page,
        sectionLocator: page.locator('#corrector_form'),
        sectionTitle,
        buttonLocator: page.getByRole('button', { name: 'Upload' })
      })
    }

    

    await page.getByRole('button', { name: 'Continue' }).click()

  })

  await test.step('Correction fee', async () => {

    
    await page
      .locator('#fees____amount')
      .fill(faker.number.int({ min: 1, max: 1000 }).toString())

    

    await page.getByRole('button', { name: 'Continue' }).click()

    

    expect(page.url().includes('correction')).toBeTruthy()

    
    expect(page.url().includes('review')).toBeTruthy()

  })

  await test.step('Change father id number', async () => {

    
    await page.getByTestId('change-button-father.nid').click()

    

    await page.getByTestId('text__father____nid').fill(newIdNumber)

    

    await page
      .getByRole('button', { name: 'Back to review', exact: true })
      .click()

    

    await expect(
      page.getByTestId('row-value-father.nid').getByRole('deletion')
    ).toHaveText(oldIdNumber)

    

    await expect(
      page.getByTestId('row-value-father.nid').getByText(newIdNumber)
    ).toBeVisible()

  })

  await test.step('Correction summary', async () => {

    
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    

    expect(page.url().includes('correction')).toBeTruthy()

    
    expect(page.url().includes('summary')).toBeTruthy()

    

    await expect(page.getByText("Child's details")).not.toBeVisible()

    
    await expect(page.getByText("Mother's details")).not.toBeVisible()

    
    await expect(page.getByText("Father's details")).toBeVisible()

    
    await expect(
      page.getByText('ID Number' + oldIdNumber + newIdNumber)
    ).toBeVisible()

  })

  await test.step('Submit correction request', async () => {

    
    await page
      .getByRole('button', { name: 'Submit correction request' })
      .click()

    

    await page.getByRole('button', { name: 'Confirm' }).click()

  })

  await test.step('Logout', async () => {

    
    await logout(page)

  })

  await test.step('Login as Registrar', async () => {

    
    await login(page, CREDENTIALS.REGISTRAR)

  })

  await test.step('Find the event in the "Pending corrections" workqueue', async () => {

    
    await page.getByRole('button', { name: 'Pending corrections' }).click()

    

    await page
      .getByRole('button', { name: formatV2ChildName(declaration) })
      .click()

  })

  await test.step('Approve correction request', async () => {

    
    await selectAction(page, 'Review correction request')

    
    await page.getByRole('button', { name: 'Approve', exact: true }).click()

    
    await page.getByRole('button', { name: 'Confirm', exact: true }).click()

  })

  await test.step('View record', async () => {

    
    await auditRecord({
      page,
      name: formatV2ChildName(declaration),
      trackingId
    })

    

    await ensureAssigned(page)

    

    await page.getByRole('button', { name: 'Record', exact: true }).click()

    

    await expect(
      page.getByTestId('row-value-father.nid').getByText(newIdNumber)
    ).toBeVisible()

  })

  await page.close()
})
