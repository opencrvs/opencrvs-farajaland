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

import {
  and,
  ConditionalType,
  defineActionForm,
  field,
  FieldType,
  not,
  PageTypes
} from '@opencrvs/toolkit/events'
import { MARRIAGE_REGISTRATION_TARGET_DAYS } from '@countryconfig/events/utils'
import { printCertificateCollectors } from './collectors'
import { printCertificateCollectorOther } from './collector-other'
import { printCertificateCollectorIdentityVerify } from './collector-identity-verify'

export const BIRTH_CERTIFICATE_COLLECTOR_FORM = defineActionForm({
  label: {
    id: 'event.marriage.action.certificate.form.label',
    defaultMessage: 'Marriage certificate collector',
    description: 'This is what this form is referred as in the system'
  },
  pages: [
    {
      id: 'collector',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: {
        id: 'event.marriage.action.certificate.form.section.who.title',
        defaultMessage: 'Certify record',
        description: 'This is the title of the section'
      },
      fields: [...printCertificateCollectors, ...printCertificateCollectorOther]
    },
    {
      id: 'collector.identity.verify',
      type: PageTypes.enum.VERIFICATION,
      requireCompletionToContinue: true,
      title: {
        id: 'event.marriage.action.print.verifyIdentity',
        defaultMessage: 'Verify their identity',
        description: 'This is the title of the section'
      },
      conditional: and(
        not(field('collector.requesterId').isEqualTo('SOMEONE_ELSE')),
        not(field('collector.requesterId').isEqualTo('PRINT_IN_ADVANCE'))
      ),
      fields: printCertificateCollectorIdentityVerify,
      actions: {
        verify: {
          label: {
            defaultMessage: 'Verified',
            description: 'This is the label for the verification button',
            id: 'event.marriage.action.certificate.form.verify'
          }
        },
        cancel: {
          label: {
            defaultMessage: 'Identity does not match',
            description:
              'This is the label for the verification cancellation button',
            id: 'event.marriage.action.certificate.form.cancel'
          },
          confirmation: {
            title: {
              defaultMessage: 'Print without proof of ID?',
              description:
                'This is the title for the verification cancellation modal',
              id: 'event.marriage.action.certificate.form.cancel.confirmation.title'
            },
            body: {
              defaultMessage:
                'Please be aware that if you proceed, you will be responsible for issuing a certificate without the necessary proof of ID from the collector',
              description:
                'This is the body for the verification cancellation modal',
              id: 'event.marriage.action.certificate.form.cancel.confirmation.body'
            }
          }
        }
      }
    },
    {
      id: 'collector.collect.payment',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: {
        id: 'event.marriage.action.print.collectPayment',
        defaultMessage: 'Collect fees',
        description: 'This is the title of the section'
      },
      conditional: and(
        not(field('collector.requesterId').isEqualTo('PRINT_IN_ADVANCE')),
        not(
          field('certificateTemplateId').isEqualTo(
            'v2.marriage-certified-certificate'
          )
        )
      ),
      fields: [
        {
          id: 'collector.collect.payment.data.inBetweenRegistrationTargets',
          type: FieldType.DATA,
          analytics: true,
          label: {
            defaultMessage: 'Payment details',
            description: 'Title for the data section',
            id: 'event.marriage.action.certificate.form.section.collectPayment.data.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: and(
                field('marriageDetails.dateOfMarriage')
                  .isAfter()
                  .days(MARRIAGE_REGISTRATION_TARGET_DAYS)
                  .inPast(),
                field('marriageDetails.dateOfMarriage').isBefore().now()
              )
            }
          ],
          configuration: {
            data: [
              {
                id: 'service',
                label: {
                  defaultMessage: 'Service',
                  description: 'Title for the data entry',
                  id: 'event.marriage.action.certificate.form.section.collectPayment.service.label'
                },
                value: {
                  defaultMessage:
                    'Marriage registration within 30 days of date of marriage',
                  description:
                    'Marriage registration within 30 days of date of marriage message',
                  id: 'event.marriage.action.certificate.form.section.collectPayment.service.label.inBetweenRegistrationTargets'
                }
              },
              {
                id: 'fee',
                label: {
                  defaultMessage: 'Fee',
                  description: 'Title for the data entry',
                  id: 'event.marriage.action.certificate.form.section.collectPayment.fee.label'
                },
                value: '$5.00'
              }
            ]
          }
        },
        {
          id: 'collector.collect.payment.data.receipt',
          type: FieldType.TEXT,
          label: {
            defaultMessage: 'Receipt Number',
            description: 'Title for the data entry',
            id: 'event.marriage.action.certificate.form.section.collectPayment.receiptNumber.label'
          }
        }
      ]
    },
    {
      id: 'collector.collect.payment',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: {
        id: 'event.marriage.action.print.collectPayment',
        defaultMessage: 'Collect fees',
        description: 'This is the title of the section'
      },
      conditional: field('certificateTemplateId').isEqualTo(
        'v2.marriage-certified-certificate'
      ),
      fields: [
        {
          id: 'collector.collect.payment.data.inBetweenRegistrationTargets',
          type: FieldType.DATA,
          analytics: true,
          label: {
            defaultMessage: 'Payment details',
            description: 'Title for the data section',
            id: 'event.marriage.action.certificate.form.section.collectPayment.data.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: and(
                field('marriageDetails.dateOfMarriage')
                  .isAfter()
                  .days(MARRIAGE_REGISTRATION_TARGET_DAYS)
                  .inPast(),
                field('marriageDetails.dateOfMarriage').isBefore().now()
              )
            }
          ],
          configuration: {
            data: [
              {
                id: 'service',
                label: {
                  defaultMessage: 'Service',
                  description: 'Title for the data entry',
                  id: 'event.marriage.action.certificate.form.section.collectPayment.service.label'
                },
                value: {
                  defaultMessage: 'Certified copy of marriage record',
                  description: 'Certified copy of marriage record message',
                  id: 'event.marriage.action.certificate.form.section.collectPayment.service.label.certifiedCopyOfMarriageRecord'
                }
              },
              {
                id: 'fee',
                label: {
                  defaultMessage: 'Fee',
                  description: 'Title for the data entry',
                  id: 'event.marriage.action.certificate.form.section.collectPayment.fee.label'
                },
                value: '$10.00'
              }
            ]
          }
        },
        {
          id: 'collector.collect.payment.data.receipt',
          type: FieldType.TEXT,
          label: {
            defaultMessage: 'Receipt Number',
            description: 'Title for the data entry',
            id: 'event.marriage.action.certificate.form.section.collectPayment.receiptNumber.label'
          }
        }
      ]
    }
  ]
})
