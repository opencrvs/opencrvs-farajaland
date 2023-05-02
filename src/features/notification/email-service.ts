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

import * as fs from 'fs'
import * as Handlebars from 'handlebars'
import { join } from 'path'

const readTemplate = <T extends Record<string, any>>(templateName: string) =>
  Handlebars.compile<T>(
    fs
      .readFileSync(
        join(__dirname, `../../email-templates/${templateName}.html`)
      )
      .toString()
  )

type OnboardingInviteVariables = {
  firstNames: string
  username: string
  password: string
  completeSetupUrl: string
}

const templates = {
  'onboarding-invite': {
    type: 'onboarding-invite',
    title: 'Welcome to OpenCRVS!',
    template: readTemplate<OnboardingInviteVariables>('onboarding-invite')
  }
}

export type TemplateType = keyof typeof templates

export const sendEmail = (
  type: TemplateType,
  variables: OnboardingInviteVariables
) => {
  const emailPayload = templates[type].template(variables)
  console.log(emailPayload)

  // TODO: Send the email with nodemailer using SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS from constants
}
