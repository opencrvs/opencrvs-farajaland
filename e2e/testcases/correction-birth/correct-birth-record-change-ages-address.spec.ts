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
  createDeclaration,
  Declaration,
  getPlaceOfBirth
} from '../test-data/birth-declaration'
import { CREDENTIALS } from '../../constants'
import { formatV2ChildName, getAdministrativeAreas } from '../birth/helpers'
import { ensureAssigned, selectAction } from '../../utils'
import { getIdByName } from '../birth/helpers'
import { AddressType } from '@opencrvs/toolkit/events'

test('Correct record - Change ages', async ({ browser }) => {
  let declaration: Declaration

  let trackingId = ''

  let page: Page
  page = await browser.newPage()

  const motherAgeBefore = '28'

  const motherAgeAfter = '29'

  const informantAgeBefore = '16'

  const informantAgeAfter = '22'

  await test.step('Shortcut declaration', async () => {
    let token = await getToken(
      CREDENTIALS.REGISTRAR.USERNAME,
      CREDENTIALS.REGISTRAR.PASSWORD
    )

    const administrativeAreas = await getAdministrativeAreas(token)

    const province = getIdByName(administrativeAreas, 'Central')

    const district = getIdByName(administrativeAreas, 'Ibombo')

    const village = getIdByName(administrativeAreas, 'Klow')

    if (!province || !district || !village) {
      throw new Error('Province, district or village not found')
    }

    const childDob = new Date(Date.now() - 60 * 60 * 24 * 1000)
      .toISOString()
      .split('T')[0]

    const payload = {
      'informant.relation': 'BROTHER',
      'informant.email': 'brothers@email.com',
      'informant.name': {
        firstname: faker.person.firstName(),
        surname: faker.person.lastName()
      },
      'informant.dobUnknown': true,
      'informant.age': {
        age: Number.parseInt(informantAgeBefore),
        asOfDateRef: 'child.dob'
      },
      'informant.nationality': 'FAR',
      'informant.idType': 'NATIONAL_ID',
      'informant.nid': faker.string.numeric(10),
      'informant.address': {
        country: 'FAR',
        administrativeArea: village,
        addressType: AddressType.DOMESTIC
      },
      'father.detailsNotAvailable': true,
      'father.reason': 'Father is missing.',
      'mother.dobUnknown': true,
      'mother.age': {
        age: Number.parseInt(motherAgeBefore),
        asOfDateRef: 'child.dob'
      },
      ...(await getPlaceOfBirth('PRIVATE_HOME', token)),
      'mother.name': {
        firstname: faker.person.firstName(),
        surname: faker.person.lastName()
      },
      'mother.nationality': 'FAR',
      'mother.idType': 'NATIONAL_ID',
      'mother.nid': faker.string.numeric(10),
      'mother.address': {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: village
      },
      'child.name': {
        firstname: faker.person.firstName(),
        surname: faker.person.lastName()
      },
      'child.gender': 'female',
      'child.dob': childDob
    }

    const res = await createDeclaration(token, payload)

    expect(res).toEqual(
      expect.objectContaining({
        trackingId: expect.any(String)
      })
    )

    trackingId = res.trackingId!

    token = await getToken('k.mweene', 'test')

    declaration = res.declaration
  })

  await test.step('Login as Registration Officer', async () => {
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

  await test.step('Change informant age', async () => {
    await page.getByTestId('change-button-informant.age').click()

    await page.getByTestId('age__informant____age').fill(informantAgeAfter)

    await page
      .getByRole('button', { name: 'Back to review', exact: true })
      .click()

    await expect(
      page.getByTestId('row-value-informant.age').getByRole('deletion')
    ).toHaveText(informantAgeBefore)

    await expect(
      page.getByTestId('row-value-informant.age').getByText(informantAgeAfter)
    ).toBeVisible()
  })

  await test.step('Change mother address to international', async () => {
    await page.getByTestId('change-button-mother.address').click()

    await page.getByTestId('location__country').click()

    await page.getByText('Ethiopia').click()

    await page
      .getByRole('button', { name: 'Back to review', exact: true })
      .click()

    await expect(page.getByTestId('row-value-mother.address')).toHaveText(
      'State is required'
    )

    await page.getByTestId('change-button-mother.address').click()

    await page.getByTestId('text__state').fill('Oromia')

    await page
      .getByRole('button', { name: 'Back to review', exact: true })
      .click()

    await expect(page.getByTestId('row-value-mother.address')).toHaveText(
      'District is required'
    )

    await page.getByTestId('change-button-mother.address').click()

    await page.getByTestId('text__district2').fill('Woreda')

    await page
      .getByRole('button', { name: 'Back to review', exact: true })
      .click()

    await expect(page.getByTestId('row-value-mother.address')).toHaveText(
      'FarajalandCentralIbomboKlowEthiopiaOromiaWoreda'
    )
  })

  await test.step('Change mother age', async () => {
    await page.getByTestId('change-button-mother.age').click()

    await page.getByTestId('age__mother____age').fill(motherAgeAfter)

    await page
      .getByRole('button', { name: 'Back to review', exact: true })
      .click()

    await expect(
      page.getByTestId('row-value-mother.age').getByRole('deletion')
    ).toHaveText(motherAgeBefore)

    await expect(
      page.getByTestId('row-value-mother.age').getByText(motherAgeAfter)
    ).toBeVisible()
  })

  await test.step('Correction summary', async () => {
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    expect(page.url().includes('correction')).toBeTruthy()

    expect(page.url().includes('summary')).toBeTruthy()

    await expect(page.getByText("Father's details")).not.toBeVisible()

    await expect(page.getByText("Child's details")).not.toBeVisible()

    await expect(page.getByText("Mother's details")).toBeVisible()

    await page.pause()

    await expect(
      page.getByText(
        'Age of mother (at the time of event)' +
          motherAgeBefore +
          motherAgeAfter
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Usual place of residenceFarajalandCentralIbomboKlowEthiopiaOromiaWoreda'
      )
    ).toBeVisible()

    await expect(page.getByText("Informant's details")).toBeVisible()

    await expect(
      page.getByText(
        'Age of informant (at the time of event)' +
          informantAgeBefore +
          informantAgeAfter
      )
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
      page.getByTestId('row-value-informant.age').getByText(informantAgeAfter)
    ).toBeVisible()

    await expect(
      page.getByTestId('row-value-mother.age').getByText(motherAgeAfter)
    ).toBeVisible()
  })

  await page.close()
})
