import { test, type Page } from '@playwright/test'
import { getToken, login, searchFromSearchBar } from '../../helpers'
import { trackAndDeleteCreatedEvents } from '../test-data/eventDeletion'
import { CREDENTIALS } from '../../constants'
import {
  createDeclaration,
  getDeclaration,
  getPlaceOfBirth
} from '../test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '../birth/helpers'

test.describe.serial('1.Farajaland as location parent', () => {
  trackAndDeleteCreatedEvents()

  let page: Page
  let declaration: any
  let name: string
  let token: string

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.HEALTH_OFFICER.USERNAME,
      CREDENTIALS.HEALTH_OFFICER.PASSWORD
    )
    declaration = await getDeclaration({
      partialDeclaration: {
        'mother.nid': null,
        'mother.dob': null,
        ...(await getPlaceOfBirth(
          'HEALTH_FACILITY',
          token,
          'Mpepo Rural Health Centre'
        ))
      },
      token
    })
    name = formatV2ChildName(declaration)
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('1.1. Health officer creates an incomplete declaration', async () => {
    token = await getToken(
      CREDENTIALS.HEALTH_OFFICER.USERNAME,
      CREDENTIALS.HEALTH_OFFICER.PASSWORD
    )
    await createDeclaration(token, undefined, ActionType.NOTIFY)
  })

  test('1.2.1 Local Registrar in another administrative area should not find the declaration', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    // Try to search for the declaration with name. It should not be found.

    await searchFromSearchBar(page, name, false)
  })

  test('1.2.2 Registrar general completes and registers', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)
    // Try to search for the declaration with name. It should be found.
    await searchFromSearchBar(page, name, true)
  })

  test('1.3 Print certified copies', async () => {})
})
