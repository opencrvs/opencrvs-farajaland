import { expect, Page, test } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import {
  CLIENT_URL,
  GATEWAY_HOST,
  SAFE_IN_EXTERNAL_VALIDATION_MS
} from '../../constants'
import { CREDENTIALS } from '../../constants'
import {
  drawSignature,
  fetchUserLocationHierarchy,
  formatName,
  getClientToken,
  getToken,
  login,
  selectDeclarationAction,
  switchEventTab,
  validateActionMenuButton
} from '../../helpers'
import { addDays, format, subDays } from 'date-fns'
import { faker } from '@faker-js/faker'
import { ensureAssigned, expectInUrl, selectAction } from '../../utils'
import {
  getAdministrativeAreas,
  getIdByName,
  getLocations
} from '../birth/helpers'
import { createClient } from '@opencrvs/toolkit/api'

import decode from 'jwt-decode'
import { formatV2ChildName, REQUIRED_VALIDATION_ERROR } from '../birth/helpers'
import {
  createDeclaration,
  getDeclaration
} from '../test-data/birth-declaration'
import {
  printAndExpectPopup,
  selectRequesterType
} from '../print-certificate/birth/helpers'

async function fetchClientAPI(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  token: string,
  body: object = {}
) {
  const url = new URL(`${CLIENT_URL}${path}`)

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }

  const options: {
    method: string
    headers: Record<string, string>
    body?: string
  } = {
    method,
    headers
  }

  if (method !== 'GET' && method !== 'DELETE') {
    options.body = JSON.stringify(body)
  }

  return fetch(url, options)
}

const EVENT_TYPE = 'birth'
const NON_EXISTING_UUID = 'b3ca0644-ffc4-461f-afe0-5fb84bedfcfd'
const INTEGRATION_SCOPES = [
  'record.create[event=birth]',
  '?type=record.search',
  'record.read[event=birth]',
  'record.notify[event=birth]',
  'record.registered.correct[event=birth]'
]

test.describe('Events REST API', () => {
  let clientToken: string
  let clientId: string
  let systemAdminToken: string
  let registrarToken: string
  let clientName: string
  let healthFacilityId: string

  test.beforeAll(async () => {
    systemAdminToken = await getToken(
      CREDENTIALS.NATIONAL_SYSTEM_ADMIN.USERNAME,
      CREDENTIALS.NATIONAL_SYSTEM_ADMIN.PASSWORD
    )
    registrarToken = await getToken(
      CREDENTIALS.REGISTRAR.USERNAME,
      CREDENTIALS.REGISTRAR.PASSWORD
    )
    const name = `Health integration ${format(new Date(), 'dd.MM. HH:mm:ss')}`
    const integrationClient = createClient(
      `${GATEWAY_HOST}/events`,
      `Bearer ${systemAdminToken}`
    )
    const integration = await integrationClient.integrations.create.mutate({
      name,
      scopes: INTEGRATION_SCOPES
    })

    clientName = name
    clientId = integration.clientId

    clientToken = await getClientToken(clientId, integration.clientSecret)

    const healthFacilities = await getLocations('HEALTH_FACILITY', clientToken)

    if (!healthFacilities[0].id) {
      throw new Error('No health facility found')
    }

    healthFacilityId = healthFacilities[0].id
  })

  test.describe('GET /api/events/config', () => {
    test('HTTP 200 with config payload', async () => {
      const response = await fetchClientAPI(
        '/api/events/config',
        'GET',
        clientToken
      )

      expect(response.status).toBe(200)
      const body = await response.json()

      if (Array.isArray(body)) {
        expect(body.length).toBeGreaterThan(0)
        expect(body[0]).toHaveProperty('id')
      } else {
        expect(body).toHaveProperty('id')
      }
    })
  })

  test.describe('GET /api/events/locations', () => {
    test('HTTP 200 with locations payload', async () => {
      const response = await fetchClientAPI(
        '/api/events/locations',
        'GET',
        clientToken
      )

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBeGreaterThan(0)
    })
  })

  test.describe('GET /api/events/events/{eventId}', () => {
    test('HTTP 200 with event payload', async () => {
      const createEventResponse = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId: uuidv4(),
          createdAtLocation: healthFacilityId
        }
      )

      const createEventBody = await createEventResponse.json()
      const eventId = createEventBody.id

      const response = await fetchClientAPI(
        `/api/events/events/${eventId}`,
        'GET',
        clientToken
      )

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.id).toBe(eventId)
    })
  })

  test.describe('POST /api/events/events/search', () => {
    test('HTTP 200 with search results', async () => {
      const response = await fetchClientAPI(
        '/api/events/events/search',
        'POST',
        clientToken,
        {
          query: {
            type: 'and',
            clauses: [
              {
                eventType: EVENT_TYPE
              }
            ]
          },
          limit: 5,
          offset: 0
        }
      )

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toHaveProperty('results')
      expect(Array.isArray(body.results)).toBe(true)
    })
  })

  test.describe('POST /api/events/events', () => {
    test('HTTP 401 when invalid token is used', async () => {
      const response = await fetchClientAPI(
        '/api/events/events',
        'POST',
        'foobar'
      )
      expect(response.status).toBe(401)
    })

    test('HTTP 403 when user is missing scope', async () => {
      const response = await fetchClientAPI(
        '/api/events/events',
        'POST',
        // use system admin token which doesnt have required scope to create event
        systemAdminToken
      )

      expect(response.status).toBe(403)
    })

    test('HTTP 400 with missing payload', async () => {
      const response = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.message).toBe('Input validation failed')
    })

    test('HTTP 400 without', async () => {
      const response = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: 'foobar'
        }
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.message).toBe('Input validation failed')
    })

    test('HTTP 400 when createdAtLocation is missing', async () => {
      const response = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId: uuidv4()
        }
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.message).toBe(
        'createdAtLocation is required and must be a valid location id'
      )
    })

    test('HTTP 400 when createdAtLocation is invalid', async () => {
      const response = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId: uuidv4(),
          createdAtLocation: uuidv4()
        }
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.message).toBe('createdAtLocation must be a valid location id')
    })

    test('HTTP 200 with valid payload', async () => {
      const response = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId: uuidv4(),
          createdAtLocation: healthFacilityId
        }
      )

      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.type).toBe(EVENT_TYPE)
      expect(body.actions.length).toBe(1)
    })

    test('API is idempotent', async () => {
      const transactionId = uuidv4()
      const response1 = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId,
          createdAtLocation: healthFacilityId
        }
      )

      const response2 = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          createdAtLocation: healthFacilityId,
          transactionId
        }
      )

      const body1 = await response1.json()
      const body2 = await response2.json()

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      expect(body1).toEqual(body2)
    })
  })

  test.describe('POST /api/events/events/notify', () => {
    test('HTTP 401 when invalid token is used', async () => {
      const response = await fetchClientAPI(
        `/api/events/events/${NON_EXISTING_UUID}/notify`,
        'POST',
        'foobar'
      )
      expect(response.status).toBe(401)
    })

    test('HTTP 403 when user is missing scope', async () => {
      const response = await fetchClientAPI(
        `/api/events/events/${NON_EXISTING_UUID}/notify`,
        'POST',
        // use system admin token which doesnt have required scope to create event
        systemAdminToken
      )
      expect(response.status).toBe(403)
    })

    test('HTTP 400 with missing payload', async () => {
      const response = await fetchClientAPI(
        `/api/events/events/${NON_EXISTING_UUID}/notify`,
        'POST',
        clientToken
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.message).toBe('Input validation failed')
    })

    test('HTTP 400 with invalid payload', async () => {
      const response = await fetchClientAPI(
        `/api/events/events/${NON_EXISTING_UUID}/notify`,
        'POST',
        clientToken,
        {
          type: 'foobar'
        }
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.message).toBe('Input validation failed')
    })

    test('HTTP 400 with payload containing declaration with unexpected fields', async () => {
      const createEventResponse = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId: uuidv4(),
          createdAtLocation: healthFacilityId
        }
      )

      const createEventResponseBody = await createEventResponse.json()
      const eventId = createEventResponseBody.id

      const fakeSurname = faker.person.lastName()
      const response = await fetchClientAPI(
        `/api/events/events/${eventId}/notify`,
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'NOTIFY',
          declaration: {
            'foo.bar': 'this should cause an error',
            'child.name': { surname: fakeSurname },
            'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
          },
          annotation: {}
        }
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.message).toBe(
        `[{"message":"Unexpected field","id":"foo.bar","value":"this should cause an error"}]`
      )
    })

    test('HTTP 200 with payload containing declaration with half filled names', async ({
      page
    }) => {
      const token = await login(page)
      const { sub } = decode<{ sub: string }>(token)
      const location = await fetchUserLocationHierarchy(sub, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const createEventResponse = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId: uuidv4(),
          createdAtLocation: location[location.length - 1]
        }
      )

      const createEventResponseBody = await createEventResponse.json()
      const eventId = createEventResponseBody.id

      const fakeSurname = faker.person.lastName()

      const response = await fetchClientAPI(
        `/api/events/events/${eventId}/notify`,
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'NOTIFY',
          createdAtLocation: location[location.length - 1],
          declaration: {
            'child.name': { surname: fakeSurname },
            // this should cause an error because the date is in the future
            'child.dob': format(addDays(new Date(), 10), 'yyyy-MM-dd')
          },
          annotation: {}
        }
      )

      expect(response.status).toBe(200)
    })

    test('HTTP 400 with payload containing declaration with values of wrong type', async () => {
      const createEventResponse = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId: uuidv4(),
          createdAtLocation: healthFacilityId
        }
      )

      const createEventResponseBody = await createEventResponse.json()
      const eventId = createEventResponseBody.id

      const response = await fetchClientAPI(
        `/api/events/events/${eventId}/notify`,
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'NOTIFY',
          declaration: {
            'child.name': { surname: 12345 }
          },
          annotation: {}
        }
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.message).toBe(
        '[{"message":"Invalid input","id":"child.name","value":{"surname":12345}}]'
      )
    })

    test('HTTP 404 when trying to notify a non-existing event', async () => {
      const response = await fetchClientAPI(
        '/api/events/events/notify',
        'POST',
        clientToken,
        {
          eventId: uuidv4(),
          transactionId: uuidv4(),
          type: 'NOTIFY',
          declaration: {
            'child.name': {
              firstname: faker.person.firstName(),
              surname: faker.person.lastName()
            },
            'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
          },
          annotation: {}
        }
      )

      expect(response.status).toBe(404)
    })

    test('HTTP 400 when trying to notify an event without createdAtLocation', async () => {
      const createEventResponse = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId: uuidv4(),
          createdAtLocation: healthFacilityId
        }
      )

      const createEventResponseBody = await createEventResponse.json()
      const eventId = createEventResponseBody.id

      const childName = {
        firstNames: faker.person.firstName(),
        familyName: faker.person.lastName()
      }

      const response = await fetchClientAPI(
        `/api/events/events/${eventId}/notify`,
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'NOTIFY',
          declaration: {
            'child.name': {
              firstname: childName.firstNames,
              surname: childName.familyName
            },
            'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
          },
          annotation: {}
        }
      )

      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.message).toBe(
        'createdAtLocation is required and must be a valid location id'
      )
    })

    test('HTTP 400 when trying to notify an event with an invalid createdAtLocation', async () => {
      const createEventResponse = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId: uuidv4(),
          createdAtLocation: healthFacilityId
        }
      )

      const createEventResponseBody = await createEventResponse.json()
      const eventId = createEventResponseBody.id

      const childName = {
        firstNames: faker.person.firstName(),
        familyName: faker.person.lastName()
      }

      const response = await fetchClientAPI(
        `/api/events/events/${eventId}/notify`,
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'NOTIFY',
          declaration: {
            'child.name': {
              firstname: childName.firstNames,
              surname: childName.familyName
            },
            'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
          },
          annotation: {},
          createdAtLocation: 'invalid-location-id'
        }
      )

      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.message).toBe('Input validation failed')
    })

    test('HTTP 400 when trying to notify an event with a non-office createdAtLocation', async () => {
      const createEventResponse = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId: uuidv4(),
          createdAtLocation: healthFacilityId
        }
      )

      const createEventResponseBody = await createEventResponse.json()
      const eventId = createEventResponseBody.id

      const childName = {
        firstNames: faker.person.firstName(),
        familyName: faker.person.lastName()
      }

      const administrativeAreas = await getAdministrativeAreas(clientToken)
      const centralId = getIdByName(administrativeAreas, 'Central')

      const response = await fetchClientAPI(
        `/api/events/events/${eventId}/notify`,
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'NOTIFY',
          declaration: {
            'child.name': {
              firstname: childName.firstNames,
              surname: childName.familyName
            },
            'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
          },
          annotation: {},
          createdAtLocation: centralId
        }
      )

      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.message).toBe('createdAtLocation must be a valid location id')
    })

    test('HTTP 200 with valid payload', async ({ page }) => {
      const createEventResponse = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId: uuidv4(),
          createdAtLocation: healthFacilityId
        }
      )

      expect(createEventResponse.status).toBe(200)

      const createEventResponseBody = await createEventResponse.json()
      const eventId = createEventResponseBody.id

      const childName = {
        firstNames: faker.person.firstName(),
        familyName: faker.person.lastName()
      }

      const token = await login(page)
      const { sub } = decode<{ sub: string }>(token)

      const location = await fetchUserLocationHierarchy(sub, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const response = await fetchClientAPI(
        `/api/events/events/${eventId}/notify`,
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'NOTIFY',
          declaration: {
            'child.name': {
              firstname: childName.firstNames,
              surname: childName.familyName
            },
            'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
          },
          annotation: {},
          createdAtLocation: location[location.length - 1]
        }
      )

      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.type).toBe(EVENT_TYPE)
      expect(body.actions.length).toBe(3)
      expect(body.actions[0].type).toBe('CREATE')
      expect(body.actions[1].type).toBe('NOTIFY')
      expect(body.actions[1].status).toBe('Requested')
      expect(body.actions[2].type).toBe('NOTIFY')
      expect(body.actions[2].status).toBe('Accepted')

      // check that event is created in UI

      await page.getByRole('button', { name: 'Notifications' }).click()

      await page.getByText(await formatName(childName)).click()

      await ensureAssigned(page)

      await page.getByRole('button', { name: 'Audit' }).click()

      await expect(page.locator('#row_0')).toContainText('Notified')
      await expect(page.locator('#row_0')).toContainText(clientName)
      await expect(page.locator('#row_0')).toContainText('Health integration')

      // Open modal by clicking 'Notified' action row
      await page.getByText('Notified').click()
      const modal = await page.getByTestId('event-history-modal')
      expect(modal).toContainText('Notified')
      expect(modal).toContainText(clientName)

      // Close the modal
      await page.locator('#close-btn').click()

      // View the event details
      await page.getByRole('button', { name: 'Record', exact: true }).click()
      await expect(page.getByTestId('row-value-child.name')).toHaveText(
        formatName(childName)
      )
    })

    test('API is idempotent', async () => {
      const createEventResponse = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId: uuidv4(),
          createdAtLocation: healthFacilityId
        }
      )

      const createEventResponseBody = await createEventResponse.json()
      const eventId = createEventResponseBody.id

      const childName = {
        firstNames: faker.person.firstName(),
        familyName: faker.person.lastName()
      }

      const requestBody = {
        eventId,
        transactionId: uuidv4(),
        type: 'NOTIFY',
        declaration: {
          'child.name': {
            firstname: childName.firstNames,
            surname: childName.familyName
          },
          'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
        },
        annotation: {},
        createdAtLocation: healthFacilityId
      }

      const response1 = await fetchClientAPI(
        `/api/events/events/${eventId}/notify`,
        'POST',
        clientToken,
        requestBody
      )

      const response2 = await fetchClientAPI(
        `/api/events/events/${eventId}/notify`,
        'POST',
        clientToken,
        requestBody
      )

      const body1 = await response1.json()
      const body2 = await response2.json()

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      expect(body1).toEqual(body2)
    })
  })

  test.describe('POST /api/events/events/{eventId}/correction/*', () => {
    const createRegisteredEvent = async () => {
      const { eventId } = await createDeclaration(registrarToken)
      // const client = createClient(
      //   GATEWAY_HOST + '/events',
      //   `Bearer ${registrarToken}`
      // )
      // await client.event.actions.assignment.unassign.mutate({
      //   eventId,
      //   transactionId: uuidv4()
      // })
      return eventId
    }

    test('HTTP 200 for correction request', async () => {
      const eventId = await createRegisteredEvent()

      console.log(1)
      const response = await fetchClientAPI(
        `/api/events/events/${eventId}/correction/request`,
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'REQUEST_CORRECTION',
          declaration: {
            'child.name': {
              firstname: faker.person.firstName(),
              surname: faker.person.lastName()
            }
          },
          annotation: {},
          createdAtLocation: healthFacilityId
        }
      )
      console.log(2)

      const body = await response.json()
      expect(response.status).toBe(200)
      const requestAction = body.actions.find(
        (action: { type: string }) => action.type === 'REQUEST_CORRECTION'
      )
      expect(requestAction).toBeDefined()
    })

    test('HTTP 200 for correction approve with updated state', async () => {
      const eventId = await createRegisteredEvent()

      const requestResponse = await fetchClientAPI(
        `/api/events/events/${eventId}/correction/request`,
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'REQUEST_CORRECTION',
          declaration: {},
          annotation: {},
          createdAtLocation: healthFacilityId
        }
      )

      expect(requestResponse.status).toBe(200)
      const requestBody = await requestResponse.json()
      const requestAction = requestBody.actions.find(
        (action: { type: string }) => action.type === 'REQUEST_CORRECTION'
      )

      if (!requestAction?.id) {
        throw new Error('Correction request action not found')
      }

      const response = await fetchClientAPI(
        `/api/events/events/${eventId}/correction/approve`,
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          requestId: requestAction.id,
          type: 'APPROVE_CORRECTION',
          declaration: {},
          annotation: {},
          createdAtLocation: healthFacilityId
        }
      )

      expect(response.status).toBe(200)

      const getResponse = await fetchClientAPI(
        `/api/events/events/${eventId}`,
        'GET',
        clientToken
      )
      const getBody = await getResponse.json()

      const approveAction = getBody.actions.find(
        (action: { type: string }) => action.type === 'APPROVE_CORRECTION'
      )
      expect(approveAction).toBeDefined()
    })

    test('HTTP 200 for correction reject with updated state', async () => {
      const eventId = await createRegisteredEvent()

      const requestResponse = await fetchClientAPI(
        `/api/events/events/${eventId}/correction/request`,
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'REQUEST_CORRECTION',
          declaration: {},
          annotation: {},
          createdAtLocation: healthFacilityId
        }
      )

      expect(requestResponse.status).toBe(200)
      const requestBody = await requestResponse.json()
      const requestAction = requestBody.actions.find(
        (action: { type: string }) => action.type === 'REQUEST_CORRECTION'
      )

      if (!requestAction?.id) {
        throw new Error('Correction request action not found')
      }

      const response = await fetchClientAPI(
        `/api/events/events/${eventId}/correction/reject`,
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          requestId: requestAction.id,
          type: 'REJECT_CORRECTION',
          content: {
            reason: faker.lorem.sentence()
          },
          declaration: {},
          annotation: {},
          createdAtLocation: healthFacilityId
        }
      )

      expect(response.status).toBe(200)

      const getResponse = await fetchClientAPI(
        `/api/events/events/${eventId}`,
        'GET',
        clientToken
      )
      const getBody = await getResponse.json()
      const rejectAction = getBody.actions.find(
        (action: { type: string }) => action.type === 'REJECT_CORRECTION'
      )
      expect(rejectAction).toBeDefined()
    })
  })

  test.describe
    .serial('Registrar can register and print an event notified via integration', async () => {
    const childName = {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    }

    let token: string
    let page: Page
    let eventId: string

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
    })

    test.afterAll(async () => {
      await page.close()
    })

    test('Login', async () => {
      token = await login(page)
    })

    test('Notify an event via integration', async () => {
      const createEventResponse = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId: uuidv4(),
          createdAtLocation: healthFacilityId
        }
      )

      const createEventResponseBody = await createEventResponse.json()
      eventId = createEventResponseBody.id
      const { sub } = decode<{ sub: string }>(token)

      const location = await fetchUserLocationHierarchy(sub, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const declaration = {
        ...(await getDeclaration({ token })),
        'child.name': childName,
        'child.dob': undefined
      }

      const response = await fetchClientAPI(
        `/api/events/events/${eventId}/notify`,
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'NOTIFY',
          declaration,
          annotation: {},
          createdAtLocation: location[location.length - 1]
        }
      )
      expect(response.status).toBe(200)
    })

    test("Navigate to event via 'Notifications' -workqueue", async () => {
      await page.getByRole('button', { name: 'Notifications' }).click()
      await page
        .getByText(await formatV2ChildName({ 'child.name': childName }))
        .click()
    })

    test('Edit event', async () => {
      await selectAction(page, 'Edit')

      await expect(page.getByTestId('row-value-child.name')).toHaveText(
        formatV2ChildName({ 'child.name': childName })
      )

      await expect(page.getByTestId('row-value-child.dob')).toHaveText(
        REQUIRED_VALIDATION_ERROR
      )

      await validateActionMenuButton(page, 'Register with edits', false)
    })

    test('Fill missing child dob field', async () => {
      await page.getByTestId('change-button-child.dob').click()

      const yesterday = new Date()
      yesterday.setDate(new Date().getDate() - 1)
      const [yyyy, mm, dd] = yesterday.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
    })

    const newChildName = {
      firstname: childName.firstname,
      surname: `Laurila-${childName.surname}`
    }

    test('Change child surname', async () => {
      await page.getByTestId('text__surname').fill(newChildName.surname)
      await page.getByRole('button', { name: 'Back to review' }).click()

      await expect(page.getByTestId('row-value-child.dob')).not.toHaveText(
        REQUIRED_VALIDATION_ERROR
      )
    })

    test('Fill comment & signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('Register event', async () => {
      await selectDeclarationAction(page, 'Register with edits')
    })

    test("Navigate to event via 'Pending certification' -workqueue", async () => {
      await page.getByRole('button', { name: 'Pending certification' }).click()
      await page
        .getByText(await formatV2ChildName({ 'child.name': newChildName }))
        .click()
    })

    test('Print certificate', async () => {
      await selectAction(page, 'Print')
      await selectRequesterType(page, 'Print and issue to Informant (Mother)')
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Verified' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()

      await expect(page.locator('#print')).toContainText(
        formatV2ChildName({ 'child.name': newChildName })
      )

      await expect(page.locator('#print')).toContainText(
        'Ibombo District Office'
      )

      await expect(page.locator('#print')).toContainText(
        'Ibombo, Central, Farajaland'
      )

      await printAndExpectPopup(page)

      await expectInUrl(page, `/workqueue/pending-certification`)
    })
  })

  test.describe
    .serial('Registrar can reject an event notified via integration', async () => {
    const childName = {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    }

    let token: string
    let page: Page
    let eventId: string

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
    })

    test.afterAll(async () => {
      await page.close()
    })

    test('Login', async () => {
      token = await login(page)
    })

    let trackingId: string

    test('Notify event an event via integration', async () => {
      const createEventResponse = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId: uuidv4(),
          createdAtLocation: healthFacilityId
        }
      )

      const createEventResponseBody = await createEventResponse.json()
      eventId = createEventResponseBody.id
      const { sub } = decode<{ sub: string }>(token)

      const location = await fetchUserLocationHierarchy(sub, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const declaration = {
        ...(await getDeclaration({ token })),
        'child.name': childName,
        'child.dob': undefined
      }

      const res = await fetchClientAPI(
        `/api/events/events/${eventId}/notify`,
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'NOTIFY',
          declaration,
          annotation: {},
          createdAtLocation: location[location.length - 1]
        }
      )

      trackingId = (await res.json()).trackingId
    })

    test("Navigate to event via 'Notifications' -workqueue", async () => {
      await page.getByRole('button', { name: 'Notifications' }).click()
      await page
        .getByText(await formatV2ChildName({ 'child.name': childName }))
        .click()
    })

    test('Reject event', async () => {
      await selectAction(page, 'Reject')
      await page.getByTestId('reject-reason').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Send For Update' }).click()
    })

    test('Navigate to event via search', async () => {
      await page.getByRole('button', { name: 'Search' }).click()
      await page.getByPlaceholder('Search').fill(trackingId)
      await page.getByRole('button', { name: 'Search' }).click()
      await page
        .getByText(await formatV2ChildName({ 'child.name': childName }))
        .click()

      await ensureAssigned(page)
      await page.waitForTimeout(SAFE_IN_EXTERNAL_VALIDATION_MS)
    })

    test('Audit event', async () => {
      await switchEventTab(page, 'Audit')
      await expect(page.locator('#row_0')).toContainText('Notified')
      await expect(page.locator('#row_0')).toContainText(clientName)
      await expect(page.locator('#row_3')).toContainText('Rejected')
    })
  })
})
