import { test } from '@playwright/test'
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

test('1.Farajaland as location parent', async ({ browser }) => {
  trackAndDeleteCreatedEvents()

  const token: string = await getToken(
    CREDENTIALS.HOSPITAL_OFFICIAL.USERNAME,
    CREDENTIALS.HOSPITAL_OFFICIAL.PASSWORD
  )
  const declaration: any = await getDeclaration({
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
  const name: string = formatV2ChildName(declaration)
  const page = await browser.newPage()

  await test.step('1.1.0 Hospital official creates an incomplete declaration', async () => {
    await createDeclaration(token, declaration, ActionType.NOTIFY)
  })

  await test.step('1.1.1 Embassy official in another administrative area should not find the declaration', async () => {
    await login(page, CREDENTIALS.EMBASSY_OFFICIAL)

    await searchFromSearchBar(page, name, false)
  })

  await test.step('1.1.2 Registrar general within the same administrative area should find the declaration', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)

    await searchFromSearchBar(page, name, true)
  })

  await page.close()
})
