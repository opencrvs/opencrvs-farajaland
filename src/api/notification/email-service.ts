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

import * as fs from 'fs'
import * as Handlebars from 'handlebars'
import { join } from 'path'
import * as sgMail from '@sendgrid/mail'
import { SENDER_EMAIL_ADDRESS, EMAIL_API_KEY } from './constant'
import { logger } from '@countryconfig/logger'

if (EMAIL_API_KEY) {
  sgMail.setApiKey(EMAIL_API_KEY)
}

const readTemplate = <T extends Record<string, string>>(
  templateName: string,
  event: string
) =>
  Handlebars.compile<T>(
    fs
      .readFileSync(
        join(__dirname, `/email-templates/${event}/${templateName}.html`)
      )
      .toString()
  )

const readOtherTemplate = <T extends Record<string, string>>(
  templateName: string
) =>
  Handlebars.compile<T>(
    fs
      .readFileSync(
        join(__dirname, `/email-templates/other/${templateName}.html`)
      )
      .toString()
  )

type OnboardingInviteVariables = {
  firstNames: string
  username: string
  password: string
  applicationName: string
  completeSetupUrl: string
  countryLogo: string
  loginURL: string
}
type TwoFactorAuthenticationVariables = {
  firstNames: string
  authCode: string
  applicationName: string
  countryLogo: string
}
type ChangePhoneNumberVariables = {
  firstNames: string
  authCode: string
  applicationName: string
  countryLogo: string
}
type ChangeEmailAddressVariables = {
  firstNames: string
  authCode: string
  applicationName: string
  countryLogo: string
}
type ResetPasswordBySysAdminVariables = {
  firstNames: string
  password: string
  applicationName: string
  countryLogo: string
}
type ResetPasswordVariables = {
  firstNames: string
  authCode: string
  applicationName: string
  countryLogo: string
}
type UsernameReminderVariables = {
  firstNames: string
  username: string
  applicationName: string
  countryLogo: string
}

type UsernameUpdateVariables = {
  firstNames: string
  username: string
  applicationName: string
  countryLogo: string
}

type ApproveCorrectionVariables = {
  firstNames: string
  lastName: string
  event: string
  trackingId: string
  applicationName: string
  countryLogo: string
}

type RejectCorrectionVariables = ApproveCorrectionVariables & { reason: string }

type DeclarationCommonVariables = {
  trackingId: string
  crvsOffice: string
  registrationLocation: string
  applicationName: string
  informantName: string
}

type InProgressDeclarationVariables = DeclarationCommonVariables

type InReviewDeclarationVariables = DeclarationCommonVariables

type RegistrationDeclarationVariables = DeclarationCommonVariables & {
  name: string
  registrationNumber: string
}

type RejectionDeclarationVariables = DeclarationCommonVariables & {
  name: string
}

const templates = {
  'onboarding-invite': {
    type: 'onboarding-invite',
    subject: 'Welcome to {{applicationName}}',
    template: readOtherTemplate<OnboardingInviteVariables>('onboarding-invite')
  },
  '2-factor-authentication': {
    type: '2-factor-authentication',
    subject: 'Authentication code',
    template: readOtherTemplate<TwoFactorAuthenticationVariables>(
      '2-factor-authentication'
    )
  },
  'change-phone-number': {
    type: 'change-phone-number',
    subject: 'Phone number change request',
    template: readOtherTemplate<ChangePhoneNumberVariables>(
      'change-phone-number'
    )
  },
  'change-email-address': {
    type: 'change-email-address',
    subject: 'Email address change request',
    template: readOtherTemplate<ChangeEmailAddressVariables>(
      'change-email-address'
    )
  },
  'password-reset-by-system-admin': {
    type: 'password-reset-by-system-admin',
    subject: 'Password reset by system administrator',
    template: readOtherTemplate<ResetPasswordBySysAdminVariables>(
      'password-reset-by-system-admin'
    )
  },
  'password-reset': {
    type: 'password-reset',
    subject: 'Password reset',
    template: readOtherTemplate<ResetPasswordVariables>('password-reset')
  },
  'username-reminder': {
    type: 'username-reminder',
    subject: 'Username reminder',
    template: readOtherTemplate<UsernameReminderVariables>('username-reminder')
  },
  'username-updated': {
    type: 'username-updated',
    subject: 'Username updated',
    template: readOtherTemplate<UsernameUpdateVariables>('username-updated')
  },
  'correction-approved': {
    type: 'correction-approved',
    subject: 'Correction request approved',
    template: readOtherTemplate<ApproveCorrectionVariables>(
      'correction-approved'
    )
  },
  'correction-rejected': {
    type: 'correction-rejected',
    subject: 'Correction request rejected',
    template: readOtherTemplate<RejectCorrectionVariables>(
      'correction-rejected'
    )
  },
  birthInProgressNotification: {
    type: 'birthInProgressNotification',
    subject: 'Birth declaration in progress',
    template: readTemplate<InProgressDeclarationVariables>(
      'inProgress',
      'birth'
    )
  },
  birthDeclarationNotification: {
    type: 'birthDeclarationNotification',
    subject: 'Birth declaration in review',
    template: readTemplate<InReviewDeclarationVariables>('inReview', 'birth')
  },
  birthRegistrationNotification: {
    type: 'birthRegistrationNotification',
    subject: 'Birth registration complete',
    template: readTemplate<RegistrationDeclarationVariables>(
      'registration',
      'birth'
    )
  },
  birthRejectionNotification: {
    type: 'birthRejectionNotification',
    subject: 'Birth declaration requires updates',
    template: readTemplate<RejectionDeclarationVariables>('rejection', 'birth')
  },
  deathInProgressNotification: {
    type: 'deathInProgressNotification',
    subject: 'Death declaration in progress',
    template: readTemplate<InProgressDeclarationVariables>(
      'inProgress',
      'death'
    )
  },
  deathDeclarationNotification: {
    type: 'deathDeclarationNotification',
    subject: 'Death declaration in review',
    template: readTemplate<InReviewDeclarationVariables>('inReview', 'death')
  },
  deathRegistrationNotification: {
    type: 'deathRegistrationNotification',
    subject: 'Death registration complete',
    template: readTemplate<RegistrationDeclarationVariables>(
      'registration',
      'death'
    )
  },
  deathRejectionNotification: {
    type: 'deathRejectionNotification',
    subject: 'Death declaration requires updates',
    template: readTemplate<RejectionDeclarationVariables>('rejection', 'death')
  },
  marriageInProgressNotification: {
    type: 'marriageInProgressNotification',
    subject: 'Marriage declaration in progress',
    template: readTemplate<InProgressDeclarationVariables>(
      'inProgress',
      'marriage'
    )
  },
  marriageDeclarationNotification: {
    type: 'marriageDeclarationNotification',
    subject: 'Marriage declaration in review',
    template: readTemplate<InReviewDeclarationVariables>('inReview', 'marriage')
  },
  marriageRegistrationNotification: {
    type: 'marriageRegistrationNotification',
    subject: 'Marriage registration complete',
    template: readTemplate<RegistrationDeclarationVariables>(
      'registration',
      'marriage'
    )
  },
  marriageRejectionNotification: {
    type: 'marriageRejectionNotification',
    subject: 'Marriage declaration requires updates',
    template: readTemplate<RejectionDeclarationVariables>(
      'rejection',
      'marriage'
    )
  }
}

export type EmailTemplateType = keyof typeof templates

export type TemplateVariables =
  | OnboardingInviteVariables
  | TwoFactorAuthenticationVariables
  | ChangePhoneNumberVariables
  | ResetPasswordBySysAdminVariables
  | ResetPasswordVariables
  | UsernameReminderVariables
  | UsernameUpdateVariables
  | InProgressDeclarationVariables
  | InReviewDeclarationVariables
  | RegistrationDeclarationVariables
  | RejectionDeclarationVariables

export const sendEmail = async (
  type: EmailTemplateType,
  variables: TemplateVariables,
  recipient: string
) => {
  let emailSubject = ''
  let emailBody = ''

  emailSubject = templates[type].subject.replace(
    '{{applicationName}}',
    variables.applicationName
  )
  emailBody = templates[type].template(variables as any)

  const msg = {
    to: recipient,
    from: SENDER_EMAIL_ADDRESS,
    subject: emailSubject,
    html: emailBody
  }

  if (recipient.endsWith('@example.com')) {
    logger.info(`Example email detected: ${msg.to}. Not sending the email.`)
    return
  }

  try {
    logger.info(`Sending email to ${msg.to}`)
    await sgMail.send(msg)
  } catch (error) {
    logger.error(`Unable to send email to ${recipient} for error : ${error}`)

    if (error.response) {
      logger.error(error.response.body)
    }
  }
}
