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
  NameFieldValue
} from '@opencrvs/toolkit/events'
import { MOSIP_INTEROP_URL, NO_MOSIP } from '@countryconfig/constants'
import {
  getBirthInformantSection,
  getInformantPsut,
  shouldForwardBirthRegistrationToMosip
} from '../../events/mosip'
import { logger } from '@countryconfig/logger'
import { capitalize } from 'lodash'

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
          fullName:
            '[ {\n  "language" : "eng",\n  "value" : "' +
            [childName?.firstname, childName?.middlename, childName?.surname]
              .filter(Boolean)
              .join(' ') +
            '"\n}]',

          dateOfBirth: declaration['child.dob']
            ?.toString()
            .replaceAll('-', '/'),
          gender:
            '[ {\n  "language" : "eng",\n  "value" : "' +
            capitalize(declaration['child.gender'] as string) +
            '"\n}]',
          postalCode: '14022',
          email: 'rachik.sharma@gmail.com',
          phone: '7790075085',
          zone: '[ {\n  "language" : "eng",\n  "value" : "Ben Mansour"\n}]',
          region:
            '[ {\n  "language" : "eng",\n  "value" : "Rabat Sale Kenitra"\n}]',
          province: '[ {\n  "language" : "eng",\n  "value" : "Kenitra"\n}]',
          preferredLang: 'English'
        },
        notification: {
          recipientEmail: 'rachik.sharma@gmail.com',
          recipientFullName: 'Rachik Sharma',
          recipientPhone: '7790075085'
        },
        metaInfo: {
          metaData:
            '[{\n  "label" : "registrationType",\n  "value" : "NEW"\n}, {\n  "label" : "machineId",\n  "value" : "20042"\n}, {\n  "label" : "centerId",\n  "value" : "10001"\n}]',
          registrationId: '10001100620007420250522121835',
          operationsData:
            '[ {\n  "label" : "officerId",\n  "value" : "crvs1"\n}, {\n  "label" : "officerBiometricFileName",\n  "value" : null\n}, {\n  "label" : "supervisorId",\n  "value" : null\n}, {\n  "label" : "supervisorBiometricFileName",\n  "value" : null\n}, {\n  "label" : "supervisorPassword",\n  "value" : "false"\n}, {\n  "label" : "officerPassword",\n  "value" : "true"\n}, {\n  "label" : "supervisorPIN",\n  "value" : null\n}, {\n  "label" : "officerPIN",\n  "value" : null\n}, {\n  "label" : "supervisorOTPAuthentication",\n  "value" : "false"\n}, {\n  "label" : "officerOTPAuthentication",\n  "value" : "false"\n} ]',
          capturedRegisteredDevices: '[]',
          creationDate: '20250225110733'
        },
        audit: {
          uuid: 'c75s4521-87d6-6a4x-balw-2432e2355440',
          createdAt: '2025-02-25T13:22:49.214Z',
          eventId: 'REG-EVT-066',
          eventName: 'PACKET_CREATION_SUCCESS',
          eventType: 'USER',
          hostName: 'DESKTOP-JL4BAEV',
          hostIp: 'localhost',
          applicationId: 'REG',
          applicationName: 'REGISTRATION',
          sessionUserId: 'crvs',
          sessionUserName: 'crvs',
          id: '10001100620007420250522121835',
          idType: 'REGISTRATION_ID',
          createdBy: 'crvs',
          moduleName: 'Packet Handler',
          moduleId: 'REG-MOD-117',
          description: 'Packet Succesfully Created',
          actionTimeStamp: '2025-02-25T07:52:49.214Z'
        }
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

  const isDeceasedAvailable =
    declaration['deceased.dob'] &&
    declaration['deceased.nid'] &&
    declaration['deceased.name']

  if (
    isDeceasedAvailable &&
    declaration['deceased.verified'] !== 'authenticated'
  )
    updatedFields['deceased.verified'] = await mosipInteropClient.verifyNid({
      dob: declaration['deceased.dob'],
      nid: declaration['deceased.nid'],
      name: declaration['deceased.name'],
      gender: declaration['deceased.gender']
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
