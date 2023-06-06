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
import {
  SMSTemplateType,
  informantTemplates,
  sendSMSClickatell,
  sendSMSInfobip
} from './sms-service'
import {
  EmailTemplateType,
  TemplateVariables,
  sendEmail
} from './email-service'
import { SMS_PROVIDER, USER_NOTIFICATION_DELIVERY_METHOD } from './constant'
import { APPLICATION_CONFIG_URL } from '@countryconfig/constants'
import fetch from 'node-fetch'
import { URL } from 'url'
import { logger } from '@countryconfig/logger'

type NotificationPayload = {
  templateName: {
    sms: SMSTemplateType
    email?: EmailTemplateType
  }
  recipient: {
    sms?: string
    email?: string
  }
  locale: string
  variables: TemplateVariables
  convertUnicode?: boolean
}

interface ILoginBackground {
  backgroundColor: string
  backgroundImage: string
  imageFit: string
}
interface ICountryLogo {
  fileName: string
  file: string
}
interface IApplicationConfig {
  APPLICATION_NAME: string
  COUNTRY: string
  COUNTRY_LOGO: ICountryLogo
  SENTRY: string
  LOGROCKET: string
  LOGIN_BACKGROUND: ILoginBackground
}
interface IApplicationConfigResponse {
  config: IApplicationConfig
}

export const notificationScheme = Joi.object({
  templateName: Joi.object({
    email: Joi.string().allow('').optional(),
    sms: Joi.string().required()
  }),
  recipient: Joi.object({
    email: Joi.string().allow('').optional(),
    sms: Joi.string()
  })
}).unknown(true)

export async function notificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { templateName, variables, recipient, locale, convertUnicode } =
    request.payload as NotificationPayload

  const isInformantNotification =
    !templateName?.email && templateName.sms in informantTemplates
  const notificationMethod = isInformantNotification
    ? 'sms'
    : USER_NOTIFICATION_DELIVERY_METHOD
  logger.log(`Notification method is ${notificationMethod}`)
  const applicationName = await getApplicationName()
  switch (notificationMethod) {
    case 'email':
      await sendEmail(
        templateName.email as EmailTemplateType,
        { ...variables, applicationName },
        recipient.email as string
      )
      break
    case 'sms':
      if (SMS_PROVIDER === 'infobip') {
        await sendSMSInfobip(
          templateName.sms as SMSTemplateType,
          { ...variables, applicationName },
          recipient.sms as string,
          locale
        )
      } else if (SMS_PROVIDER === 'clickatell') {
        await sendSMSClickatell(
          templateName.sms as SMSTemplateType,
          { ...variables, applicationName },
          recipient.sms as string,
          locale,
          convertUnicode
        )
      }
      break
  }
  return h.response().code(200)
}

async function getApplicationName() {
  try {
    const configURL = new URL('publicConfig', APPLICATION_CONFIG_URL).toString()
    const res = await fetch(configURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const configData = (await res.json()) as IApplicationConfigResponse
    return configData.config.APPLICATION_NAME
  } catch (err) {
    logger.error(`Unable to get public application config for error : ${err}`)
    throw err
  }
}
