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
import * as Joi from 'joi'
import { sendSMSClickatell, sendSMSInfobip } from './sms-service'
import { TemplateType, sendEmail } from './email-service'

type InfobipPayload = {
  type: 'infobip'
  msisdn: string
  message: string
}

type ClickatellPayload = {
  type: 'clickatell'
  msisdn: string
  message: string
  convertUnicode?: boolean
}

type EmailPayload = {
  type: 'email'
  template: TemplateType
  recipient: string
  firstNames: string
  username: string
  password: string
  completeSetupUrl: string
}

type NotificationPayload = InfobipPayload | ClickatellPayload | EmailPayload

export const notificationSchema = Joi.object({
  type: Joi.string().valid('infobip', 'clickatell', 'email')
}).unknown(true)

export async function notificationHandler(request: Hapi.Request) {
  const payload = request.payload as NotificationPayload

  switch (payload.type) {
    case 'email':
      return sendEmail(payload.template, payload)
    case 'infobip':
      return sendSMSInfobip(payload.msisdn, payload.message)
    case 'clickatell':
      return sendSMSClickatell(
        payload.msisdn,
        payload.message,
        payload.convertUnicode
      )
  }
}
