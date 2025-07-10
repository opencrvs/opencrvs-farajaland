import { faker } from '@faker-js/faker'
import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  formatName,
  getRandomDate,
  goToSection,
  loginToV2
} from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { ensureOutboxIsEmpty, selectAction } from '../../v2-utils'
import { assertRecordInWorkqueue, fillDate } from '../v2-birth/helpers'

// FA Notifies => LR Registers

test.describe.serial('2. Workqueue flow - 2', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      gender: 'Male',
      birthDate: getRandomDate(0, 200)
    },
    placeOfBirth: 'Health Institution',
    birthLocation: {
      facility: 'Golden Valley Rural Health Centre',
      district: 'Ibombo',
      province: 'Central',
      country: 'Farajaland'
    },
    informantType: 'Mother',
    informantEmail: faker.internet.email(),
    mother: {
      name: {
        firstNames: faker.person.firstName('female'),
        familyName: faker.person.lastName('female')
      },
      birthDate: getRandomDate(20, 200),
      nationality: 'Farajaland',
      identifier: {
        id: faker.string.numeric(10),
        type: 'National ID'
      },
      address: {
        country: 'Farajaland',
        province: 'Sulaka',
        district: 'Irundu',
        urbanOrRural: 'Urban'
      }
    },
    father: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      birthDate: getRandomDate(22, 200),
      nationality: 'Gabon',
      identifier: {
        id: faker.string.numeric(10),
        type: 'National ID'
      },
      address: {
        sameAsMother: true
      }
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('2.1 Notify by FA', async () => {
    test.beforeAll(async () => {
      await loginToV2(page, CREDENTIALS.FIELD_AGENT)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('2.1.1 Fill child details', async () => {
      await page.locator('#firstname').fill(declaration.child.name.firstNames)
      await page.locator('#surname').fill(declaration.child.name.familyName)
      await page.locator('#child____gender').click()
      await page.getByText(declaration.child.gender, { exact: true }).click()

      await page.getByPlaceholder('dd').fill(declaration.child.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.child.birthDate.mm)
      await page.getByPlaceholder('yyyy').fill(declaration.child.birthDate.yyyy)

      await page.locator('#child____placeOfBirth').click()
      await page
        .getByText(declaration.placeOfBirth, {
          exact: true
        })
        .click()
      await page
        .locator('#child____birthLocation')
        .fill(declaration.birthLocation.facility.slice(0, 3))
      await page.getByText(declaration.birthLocation.facility).click()
    })

    test('2.1.2 Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('2.1.3 Fill up informant comment & signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign' }).click()
      await drawSignature(page, true)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('2.1.4 Send for review', async () => {
      await page.getByRole('button', { name: 'Send for review' }).click()
      await expect(page.getByText('Send for review?')).toBeVisible()
      await page.getByRole('button', { name: 'Confirm' }).click()

      await ensureOutboxIsEmpty(page)
    })

    test('2.1.5 Verify workqueue', async () => {
      await assertRecordInWorkqueue({
        page,
        name: formatName(declaration.child.name),
        workqueues: [
          { title: 'Assigned to you', exists: false },
          //   { title: 'Recent', exists: true }, // https://github.com/opencrvs/opencrvs-core/issues/9785
          { title: 'Sent for review', exists: true },
          { title: 'Requires updates', exists: false }
        ]
      })
    })
  })

  test.describe('2.2 Register by LR', async () => {
    test('2.2.1 Verify workqueue', async () => {
      await loginToV2(page, CREDENTIALS.LOCAL_REGISTRAR)

      await assertRecordInWorkqueue({
        page,
        name: formatName(declaration.child.name),
        workqueues: [
          { title: 'Assigned to you', exists: false },
          //   { title: 'Recent', exists: false }, // https://github.com/opencrvs/opencrvs-core/issues/9785
          { title: 'Notifications', exists: true },
          { title: 'Ready for review', exists: false },
          { title: 'Requires updates', exists: false },
          { title: 'In external validation', exists: false },
          { title: 'Ready to print', exists: false }
        ]
      })
    })

    test('2.2.2 Review', async () => {
      await page.getByText('Notifications').click()
      await page
        .getByRole('button', {
          name: formatName(declaration.child.name)
        })
        .click()

      await selectAction(page, 'Validate')

      await page
        .getByTestId('accordion-Accordion_informant')
        .getByRole('button', { name: 'Change all' })
        .click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })
    test('2.2.3 Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.locator('#informant____email').fill(declaration.informantEmail)

      await continueForm(page)
    })

    test("2.2.4 Fill mother's details", async () => {
      await page.locator('#firstname').fill(declaration.mother.name.firstNames)
      await page.locator('#surname').fill(declaration.mother.name.familyName)

      await page.getByPlaceholder('dd').fill(declaration.mother.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.mother.birthDate.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.mother.birthDate.yyyy)

      await page.locator('#mother____idType').click()
      await page
        .getByText(declaration.mother.identifier.type, { exact: true })
        .click()

      await page
        .locator('#mother____nid')
        .fill(declaration.mother.identifier.id)

      await page.locator('#country').click()
      await page
        .locator('#country input')
        .fill(declaration.mother.address.country.slice(0, 3))
      await page
        .locator('#country')
        .getByText(declaration.mother.address.country, { exact: true })
        .click()

      await page.locator('#province').click()
      await page
        .getByText(declaration.mother.address.province, { exact: true })
        .click()
      await page.locator('#district').click()
      await page
        .getByText(declaration.mother.address.district, { exact: true })
        .click()

      await continueForm(page)
    })

    test("2.2.5 Fill father's details", async () => {
      await page.locator('#firstname').fill(declaration.father.name.firstNames)
      await page.locator('#surname').fill(declaration.father.name.familyName)

      await fillDate(page, declaration.father.birthDate)

      await page.locator('#father____idType').click()
      await page
        .getByText(declaration.father.identifier.type, { exact: true })
        .click()

      await page
        .locator('#father____nid')
        .fill(declaration.father.identifier.id)

      await page.locator('#father____nationality').click()
      await page
        .getByText(declaration.father.nationality, { exact: true })
        .click()

      await page.locator('#father____addressSameAs_YES').click()
    })

    test('2.2.6 Register', async () => {
      await goToSection(page, 'review')

      await page.getByRole('button', { name: 'Register' }).click()
      await page.locator('#confirm_Validate').click()

      await ensureOutboxIsEmpty(page)

      await assertRecordInWorkqueue({
        page,
        name: formatName(declaration.child.name),
        workqueues: [
          { title: 'Assigned to you', exists: false },
          //   { title: 'Recent', exists: true }, // https://github.com/opencrvs/opencrvs-core/issues/9785
          { title: 'Notifications', exists: false },
          { title: 'Ready for review', exists: false },
          { title: 'Requires updates', exists: false },
          { title: 'In external validation', exists: false },
          { title: 'Ready to print', exists: true }
        ]
      })
    })
  })

  test("2.3 FA can't see the record", async () => {
    await loginToV2(page, CREDENTIALS.FIELD_AGENT, true)

    await assertRecordInWorkqueue({
      page,
      name: formatName(declaration.child.name),
      workqueues: [
        { title: 'Assigned to you', exists: false },
        //   { title: 'Recent', exists: false }, // https://github.com/opencrvs/opencrvs-core/issues/9785
        { title: 'Sent for review', exists: false },
        { title: 'Requires updates', exists: false }
      ]
    })
  })

  test('2.4 RA can see the record in ready to print', async () => {
    await loginToV2(page, CREDENTIALS.REGISTRATION_AGENT)

    await assertRecordInWorkqueue({
      page,
      name: formatName(declaration.child.name),
      workqueues: [
        { title: 'Assigned to you', exists: false },
        //   { title: 'Recent', exists: false }, // https://github.com/opencrvs/opencrvs-core/issues/9785
        { title: 'Notifications', exists: false },
        { title: 'Ready for review', exists: false },
        { title: 'Requires updates', exists: false },
        { title: 'Sent for approval', exists: false },
        { title: 'In external validation', exists: false },
        { title: 'Ready to print', exists: true }
      ]
    })
  })
})
