/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as Hapi from '@hapi/hapi'
import fetch from 'node-fetch'
import { URL } from 'url'
import { OSIA_JWT, OSIA_UIN_MANAGEMENT_URL } from '@countryconfig/constants'

interface OSIATopicPublicPayload {
  source: string
  uin?: string
  uin1?: string
  uin2?: string
}

type IFullOSIAPayload = OSIATopicPublicPayload & {
  uuid: string
  subject: string
}

export async function sendOSIATopicNotificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { uuid, subject, ...osiaTopicPayload } =
    request.payload as IFullOSIAPayload

  const url = new URL(`/v1/topics/${uuid}/publish`, OSIA_UIN_MANAGEMENT_URL)
  url.searchParams.set('subject', subject)

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${OSIA_JWT}`
    },
    body: JSON.stringify(osiaTopicPayload)
  })
  const resJSON = res.json()
  return h.response(resJSON)
}
