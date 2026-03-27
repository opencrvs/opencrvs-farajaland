import { expect, test } from '@playwright/test'
import { createClient } from '@opencrvs/toolkit/api'
import { omit } from 'lodash'
import { CREDENTIALS, GATEWAY_HOST } from '../../constants'
import { getToken } from '../../helpers'
import {
  createDeclaration,
  getDeclaration,
  type Declaration
} from '../test-data/birth-declaration'

async function getEventById(eventId: string, token: string) {
  const client = createClient(`${GATEWAY_HOST}/events`, `Bearer ${token}`)
  return client.event.get.query({ eventId })
}

test.describe.serial('Birth registration forwarding to MOSIP', () => {
  let token: string
  let declaration: Declaration
  let eventId: string

  test.beforeAll(async () => {
    token = await getToken(
      CREDENTIALS.REGISTRAR.USERNAME,
      CREDENTIALS.REGISTRAR.PASSWORD
    )

    const declarationForMosipForwarding = await getDeclaration({
      token,
      partialDeclaration: {
        'mother.verified': 'authenticated'
      }
    })

    const res = await createDeclaration(
      token,
      omit(declarationForMosipForwarding, ['mother.idType', 'mother.nid'])
    )

    declaration = res.declaration
    eventId = res.eventId

    expect(res.registrationNumber).toBeUndefined()
  })

  test('register action is requested then accepted through MOSIP flow', async () => {
    expect((declaration as Record<string, unknown>)['mother.verified']).toBe(
      'authenticated'
    )

    const startedAt = Date.now()
    const timeoutMs = 30000
    const intervalMs = 1000

    while (Date.now() - startedAt < timeoutMs) {
      const event = await getEventById(eventId, token)
      const registerActions = event.actions.filter(
        (action: { type: string }) => action.type === 'REGISTER'
      )

      if (
        registerActions.some(
          (action: { status: string }) => action.status === 'Requested'
        )
      ) {
        const acceptedAction = registerActions.find(
          (action: { status: string }) => action.status === 'Accepted'
        )

        if (acceptedAction) {
          expect(
            (acceptedAction as { registrationNumber?: string })
              .registrationNumber
          ).toBeDefined()
          return
        }
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }

    throw new Error(
      'REGISTER action did not complete MOSIP requested-to-accepted flow'
    )
  })
})
