import { test, type Page } from '@playwright/test'
import { getToken, login } from '../../helpers'
import { faker } from '@faker-js/faker'
import { trackAndDeleteCreatedEvents } from '../test-data/eventDeletion'
import { CREDENTIALS } from '../../constants'
import { createDeclaration } from '../test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'

const child = {
  name: {
    firstNames: faker.person.firstName('female'),
    surname: faker.person.lastName()
  }
}

test.describe.serial('1.Farajaland as location parent', () => {
  trackAndDeleteCreatedEvents()

  let page: Page
  let declaration: any
  let eventId: string

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('1.1. Health officer creates an incomplete declaration', async () => {
    const token = await getToken(
      CREDENTIALS.HEALTH_OFFICER.USERNAME,
      CREDENTIALS.HEALTH_OFFICER.PASSWORD
    )
    // Update fn to allow notify actions.
    const res = await createDeclaration(token, undefined, ActionType.NOTIFY)
    declaration = res.declaration
    eventId = res.eventId
  })

  test('1.2.1 Local Registrar in another administrative area should not find the declaration', async () => {
    await login(page, CREDENTIALS.LOCAL_REGISTRAR)
  })

  test('1.2.2 Registrar general completes and registers', async () => {
    await login(page, CREDENTIALS.NATIONAL_REGISTRAR)
  })

  test('1.3 Print certified copies', async () => {})
})
