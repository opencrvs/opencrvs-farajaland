/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as Hapi from '@hapi/hapi'
import { eventConfigs } from '@countryconfig/events'
import { sendInformantNotification } from '../notification/informantNotification'
import { ActionConfirmationRequest } from '../registration'
import { createMosipInteropClient } from '@opencrvs/mosip/api'
import {
  Action,
  ActionType,
  aggregateActionDeclarations,
  deepMerge,
  getPendingAction,
  RegisterAction,
  NameFieldValue,
  EventDocument
} from '@opencrvs/toolkit/events'
import { v4 as uuidv4 } from 'uuid'
import {
  GATEWAY_URL,
  MOSIP_INTEROP_URL,
  NO_MOSIP
} from '@countryconfig/constants'
import {
  getBirthInformantSection,
  getInformantPsut,
  shouldForwardBirthRegistrationToMosip
} from '../../events/mosip'
import { logger } from '@countryconfig/logger'
import { generateRegistrationNumber } from '../registration/registrationNumber'
import { createClient } from '@opencrvs/toolkit/api'
import { Event } from '@countryconfig/events/utils'
import { getMarriageDissolutionToken } from './dissolution-service'

export function getEventsHandler(_: Hapi.Request, h: Hapi.ResponseToolkit) {
  return h.response(eventConfigs).code(200)
}

export async function onCustomActionHandler(
  _: ActionConfirmationRequest,
  h: Hapi.ResponseToolkit
) {
  return h.response().code(200)
}

/**
 * This catch-all action route will receive event actions with `Content-Type: application/json`
 */
export async function onAnyActionHandler(
  request: ActionConfirmationRequest,
  h: Hapi.ResponseToolkit
) {
  const token = request.auth.artifacts.token as string
  const event = request.payload

  await sendInformantNotification({ event, token })

  return h.response().code(200)
}

export async function onBirthActionHandler(
  request: ActionConfirmationRequest,
  h: Hapi.ResponseToolkit
) {
  // Used in local development to disable MOSIP registration dependency
  if (NO_MOSIP) {
    return h.response({}).code(200)
  }

  const token = request.auth.artifacts.token as string
  const event = request.payload
  await sendInformantNotification({ event, token })

  const pendingAction = getPendingAction(event.actions)
  const declaration = deepMerge(
    aggregateActionDeclarations(event),
    pendingAction.declaration
  )

  const mosipInteropClient = createMosipInteropClient(
    MOSIP_INTEROP_URL,
    `Bearer ${token}`
  )

  const updatedFields: Record<string, 'verified' | 'failed'> = {}

  const isMotherAvailable =
    declaration['mother.dob'] &&
    declaration['mother.nid'] &&
    declaration['mother.name']

  if (isMotherAvailable && declaration['mother.verified'] !== 'authenticated') {
    updatedFields['mother.verified'] = await mosipInteropClient.verifyNid({
      dob: declaration['mother.dob'],
      nid: declaration['mother.nid'],
      name: declaration['mother.name'],
      gender: 'female',
      transactionId: `mother-${event.id}`
    })
  }

  const isFatherAvailable =
    declaration['father.dob'] &&
    declaration['father.nid'] &&
    declaration['father.name']

  if (isFatherAvailable && declaration['father.verified'] !== 'authenticated')
    updatedFields['father.verified'] = await mosipInteropClient.verifyNid({
      dob: declaration['father.dob'],
      nid: declaration['father.nid'],
      name: declaration['father.name'],
      gender: 'male',
      transactionId: `father-${event.id}`
    })

  const isInformantAvailable =
    declaration['informant.dob'] &&
    declaration['informant.nid'] &&
    declaration['informant.name']
  if (
    isInformantAvailable &&
    declaration['informant.verified'] !== 'authenticated'
  )
    updatedFields['informant.verified'] = await mosipInteropClient.verifyNid({
      dob: declaration['informant.dob'],
      nid: declaration['informant.nid'],
      name: declaration['informant.name'],
      transactionId: `informant-${event.id}`
    })
  return h.response({ declaration: updatedFields }).code(200)
}

const getAcceptedBirthRegistrationNumber = (actions: Action[]) => {
  const acceptedRegisterAction = actions.find(
    ({ type, status }) => type === ActionType.REGISTER && status === 'Accepted'
  ) as RegisterAction | undefined

  // `APPROVE_CORRECTION` is only available when the event has been registered
  return acceptedRegisterAction!.registrationNumber!
}

export async function onBirthCorrectionActionHandler(
  request: ActionConfirmationRequest,
  h: Hapi.ResponseToolkit
) {
  // Used in local development to disable MOSIP registration dependency
  if (NO_MOSIP) {
    return h.response({}).code(200)
  }

  const token = request.auth.artifacts.token as string
  const event = request.payload
  await sendInformantNotification({ event, token })
  const pendingAction = getPendingAction(event.actions)
  const declaration = deepMerge(
    aggregateActionDeclarations(event),
    pendingAction.declaration
  )

  const childHasNid = Boolean(declaration['child.nid'])
  const shouldForwardToMosip =
    shouldForwardBirthRegistrationToMosip(declaration)

  if (!shouldForwardToMosip) {
    logger.info(
      'Birth registration correction will not be forwarded to MOSIP based on custom logic.'
    )

    return h.response({}).code(200)
  }

  logger.info(
    'Passed country specified custom logic check for birth correction. Forwarding to MOSIP...'
  )
  const birthCertificateNumber = getAcceptedBirthRegistrationNumber(
    event.actions
  )
  const mosipInteropClient = createMosipInteropClient(
    MOSIP_INTEROP_URL,
    `Bearer ${token}`
  )
  const childName = declaration['child.name'] as NameFieldValue

  const childIdentifier = declaration['child.nid'] as string | undefined
  const birthInformantSection = getBirthInformantSection(
    declaration['informant.relation'] as string
  )
  const introducerInfoToken = getInformantPsut(
    declaration,
    birthInformantSection
  )

  try {
    if (!childHasNid) {
      await mosipInteropClient.register({
        trackingId: event.trackingId,
        requestFields: {
          birthCertificateNumber,
          fullName: [
            childName.firstname,
            childName.middlename,
            childName.surname
          ]
            .filter(Boolean)
            .join(' '),
          dateOfBirth: declaration['child.dob'],
          gender: declaration['child.gender']
        },
        notification: {
          recipientEmail: '@TODO',
          recipientFullName: '@TODO',
          recipientPhone: '@TODO'
        },
        metaInfo: {},
        audit: {}
      })
      return h.response({}).code(202)
    }

    await mosipInteropClient
      .updateBiographics({
        trackingId: event.trackingId,
        requestFields: {
          VID: childIdentifier!,
          fullName: [
            childName.firstname,
            childName.middlename,
            childName.surname
          ]
            .filter(Boolean)
            .join(' '),
          dateOfBirth: declaration['child.dob'] as string,
          gender: declaration['child.gender'] as string,
          introducerInfoToken
        },
        notification: {
          recipientEmail: '@TODO',
          recipientFullName: '@TODO',
          recipientPhone: '@TODO'
        },
        metaInfo: {},
        audit: {}
      })
      .catch((error) => {
        logger.error(
          { eventId: event.id, err: error },
          'Failed to send birth correction biographic update to MOSIP'
        )
      })

    return h.response({}).code(200)
  } catch (error) {
    logger.error(
      { eventId: event.id, err: error },
      'Failed to forward birth correction approval to MOSIP'
    )

    return h
      .response({
        reason: 'Unexpected error in OpenCRVS-MOSIP interoperability layer'
      })
      .code(400)
  }
}

export async function onDeathActionHandler(
  request: ActionConfirmationRequest,
  h: Hapi.ResponseToolkit
) {
  // Used in local development to disable MOSIP registration dependency
  if (NO_MOSIP) {
    return h.response({}).code(200)
  }

  const token = request.auth.artifacts.token as string
  const event = request.payload
  await sendInformantNotification({ event, token })

  const pendingAction = getPendingAction(event.actions)
  const declaration = deepMerge(
    aggregateActionDeclarations(event),
    pendingAction.declaration
  )

  const mosipInteropClient = createMosipInteropClient(
    MOSIP_INTEROP_URL,
    `Bearer ${token}`
  )

  const updatedFields: Record<string, 'verified' | 'failed'> = {}

  const isInformantAvailable =
    declaration['informant.dob'] &&
    declaration['informant.nid'] &&
    declaration['informant.name']

  if (
    isInformantAvailable &&
    declaration['informant.verified'] !== 'authenticated'
  )
    updatedFields['informant.verified'] = await mosipInteropClient.verifyNid({
      dob: declaration['informant.dob'],
      nid: declaration['informant.nid'],
      name: declaration['informant.name']
    })

  const isSpouseAvailable =
    declaration['spouse.dob'] &&
    declaration['spouse.nid'] &&
    declaration['spouse.name']

  if (isSpouseAvailable && declaration['spouse.verified'] !== 'authenticated')
    updatedFields['spouse.verified'] = await mosipInteropClient.verifyNid({
      dob: declaration['spouse.dob'],
      nid: declaration['spouse.nid'],
      name: declaration['spouse.name']
    })

  return h.response({ declaration: updatedFields }).code(200)
}

export async function onMarriageRegisterHandler(
  request: ActionConfirmationRequest,
  h: Hapi.ResponseToolkit
) {
  return h
    .response({ registrationNumber: generateRegistrationNumber() })
    .code(200)
}

export async function onDivorceRegisterHandler(
  request: ActionConfirmationRequest,
  h: Hapi.ResponseToolkit
) {
  // DISSOLVING MARRIAGE — Flag the linked marriage to be inactive
  const event = request.payload
  const declaration = aggregateActionDeclarations(event)

  const dissolveResult = await dissolveMarriageRecord(declaration, event)

  if (!dissolveResult.success) {
    return h.response({ reason: dissolveResult.reason }).code(400)
  }

  // MARRIAGE DISSOLVED — Return a new registration number for the divorce event

  return h
    .response({ registrationNumber: generateRegistrationNumber() })
    .code(200)
}

type dissolveMarriageResult =
  | { success: true }
  | { success: false; reason: string }

type SearchFieldValue = {
  data?: {
    input?: string
    firstResult?: { id: string; flags?: string[] } | null
  }
}

async function dissolveMarriageRecord(
  declaration: ReturnType<typeof aggregateActionDeclarations>,
  divorceEvent: EventDocument
): Promise<dissolveMarriageResult> {
  const dissolutionToken = await getMarriageDissolutionToken()

  if (!dissolutionToken) {
    return {
      success: false,
      reason: 'Unable to authenticate the dissolution service'
    }
  }

  const mrnField = declaration['divorce.marriageRegistrationNumber'] as
    | SearchFieldValue
    | undefined
  const url = new URL('events', GATEWAY_URL).toString()
  const client = createClient(url, `Bearer ${dissolutionToken}`)

  const marriageRecord = await findMarriageRecordByMrn(mrnField, client)

  if (!marriageRecord) {
    logger.warn(
      `Divorce ${divorceEvent.id}: no registered marriage record found for the provided registration number ${mrnField?.data?.input}.`
    )
    return {
      success: false,
      reason: 'No registered marriage record found for the provided MRN'
    }
  }

  if (marriageRecord.flags?.includes('dissolved')) {
    logger.info(
      `Divorce ${divorceEvent.id}: marriage record ${marriageRecord.id} is already dissolved, skipping.`
    )
    return { success: true }
  }

  try {
    await client.event.actions.custom.request.mutate({
      eventId: marriageRecord.id,
      transactionId: uuidv4(),
      customActionType: 'DISSOLVE_MARRIAGE',
      annotation: {
        reason: 'DIVORCE',
        courtOrderReference: declaration['documents.courtOrder']
      }
    })

    return { success: true }
  } catch (error) {
    logger.error(
      { eventId: marriageRecord.id, err: error },
      'Failed to dissolve the original marriage record after divorce registration'
    )
    return {
      success: false,
      reason: 'Failed to dissolve the original marriage record'
    }
  }
}

type MarriageRecord = { id: string; flags?: string[] }

async function findMarriageRecordByMrn(
  mrnField: SearchFieldValue | undefined,
  client: ReturnType<typeof createClient>
): Promise<MarriageRecord | undefined> {
  if (mrnField?.data?.firstResult) {
    return mrnField.data.firstResult
  }

  if (!mrnField) {
    return undefined
  }

  const { results } = await client.event.search.query({
    query: {
      type: 'and',
      clauses: [
        {
          eventType: Event.Marriage,
          'legalStatuses.REGISTERED.registrationNumber': {
            type: 'exact',
            term: mrnField
          }
        }
      ]
    }
  })

  return results[0]
}
