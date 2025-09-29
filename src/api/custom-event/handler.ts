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
import { tennisClubMembershipEvent } from '@countryconfig/form/tennis-club-membership'
import { birthEvent } from '@countryconfig/form/v2/birth'
import { deathEvent } from '@countryconfig/form/v2/death'
import * as Hapi from '@hapi/hapi'
import { sendInformantNotification } from '../notification/informantNotification'
import { ActionConfirmationRequest } from '../registration'
import {
  getPendingAction,
  deepMerge,
  aggregateActionDeclarations
} from '@opencrvs/toolkit/events'
import { createMosipInteropClient } from '@opencrvs/mosip/api'
import { MOSIP_INTEROP_URL } from '@countryconfig/constants'

export function getCustomEventsHandler(
  _: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  return h
    .response([tennisClubMembershipEvent, birthEvent, deathEvent])
    .code(200)
}

export async function onAnyActionHandler(
  request: ActionConfirmationRequest,
  h: Hapi.ResponseToolkit
) {
  // This catch-all event route will receive v2 events with `Content-Type: application/json`

  const token = request.auth.artifacts.token as string

  const event = request.payload
  await sendInformantNotification({ event, token })

  return h.response().code(200)
}

export async function onBirthActionHandler(
  request: ActionConfirmationRequest,
  h: Hapi.ResponseToolkit
) {
  const token = request.auth.artifacts.token as string

  const event = request.payload
  await sendInformantNotification({ event, token })

  const pendingAction = getPendingAction(event.actions)
  const declaration = deepMerge(
    aggregateActionDeclarations(event, birthEvent),
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

  if (isMotherAvailable)
    updatedFields['mother.verified'] = await mosipInteropClient.verifyNid({
      dob: declaration['mother.dob'],
      nid: declaration['mother.nid'],
      name: declaration['mother.name'],
      gender: 'female',
      transactionId: `mother-${event.id}`
    })

  const isFatherAvailable =
    declaration['father.dob'] &&
    declaration['father.nid'] &&
    declaration['father.name']

  if (isFatherAvailable)
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

  if (isInformantAvailable)
    updatedFields['informant.verified'] = await mosipInteropClient.verifyNid({
      dob: declaration['informant.dob'],
      nid: declaration['informant.nid'],
      name: declaration['informant.name'],
      transactionId: `informant-${event.id}`
    })

  return h.response({ declaration: updatedFields }).code(200)
}

export async function onDeathActionHandler(
  request: ActionConfirmationRequest,
  h: Hapi.ResponseToolkit
) {
  const token = request.auth.artifacts.token as string

  const event = request.payload
  await sendInformantNotification({ event, token })

  const pendingAction = getPendingAction(event.actions)
  const declaration = deepMerge(
    aggregateActionDeclarations(event, birthEvent),
    pendingAction.declaration
  )

  const mosipInteropClient = createMosipInteropClient(
    MOSIP_INTEROP_URL,
    `Bearer ${token}`
  )

  const deceased = await mosipInteropClient.verifyNid({
    dob: declaration['deceased.dob'],
    nid: declaration['deceased.nationalId'],
    name: declaration['deceased.name'],
    gender: declaration['deceased.gender']
  })

  const informant = await mosipInteropClient.verifyNid({
    dob: declaration['informant.dob'],
    nid: declaration['informant.nationalId'],
    name: declaration['informant.name']
  })

  return h
    .response({
      declaration: {
        'deceased.verified': deceased,
        'informant.verified': informant
      }
    })
    .code(200)
}
