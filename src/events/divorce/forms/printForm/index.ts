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
import { DIVORCE_REGISTRATION_TARGET_DAYS } from '@countryconfig/events/utils'
import { printCertificateCollectors } from './collectors'
import { printCertificateCollectorOther } from './collector-other'

export const DIVORCE_CERTIFICATE_COLLECTOR_FORM = defineActionForm({
  label: {
    id: 'event.divorce.action.certificate.form.label',
    defaultMessage: 'Divorce certificate collector',
    description: 'This is what this form is referred as in the system'
  },
  pages: [
    {
      id: 'collector',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: {
        id: 'event.divorce.action.certificate.form.section.who.title',
        defaultMessage: 'Certify record',
        description: 'This is the title of the section'
      },
      fields: [...printCertificateCollectors, ...printCertificateCollectorOther]
    },
    {
      id: 'collector.collect.payment',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: {
        id: 'event.divorce.action.print.collectPayment',
        defaultMessage: 'Collect fees',
        description: 'This is the title of the section'
      },
      conditional: and(
        not(field('collector.requesterId').isEqualTo('PRINT_IN_ADVANCE')),
        not(
          field('certificateTemplateId').isEqualTo(
            'v2.divorce-certified-certificate'
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
            id: 'event.divorce.action.certificate.form.section.collectPayment.data.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: and(
                field('divorce.dateOfDivorce')
                  .isAfter()
                  .days(DIVORCE_REGISTRATION_TARGET_DAYS)
                  .inPast(),
                field('divorce.dateOfDivorce').isBefore().now()
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
                  id: 'event.divorce.action.certificate.form.section.collectPayment.service.label'
                },
                value: {
                  defaultMessage:
                    'Divorce registration within 30 days of date of divorce',
                  description:
                    'Divorce registration within 30 days of date of divorce message',
                  id: 'event.divorce.action.certificate.form.section.collectPayment.service.label.inBetweenRegistrationTargets'
                }
              },
              {
                id: 'fee',
                label: {
                  defaultMessage: 'Fee',
                  description: 'Title for the data entry',
                  id: 'event.divorce.action.certificate.form.section.collectPayment.fee.label'
                },
                value: '$0.00'
              }
            ]
          }
        }
      ]
    },
    {
      id: 'collector.collect.payment',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: {
        id: 'event.divorce.action.print.collectPayment',
        defaultMessage: 'Collect fees',
        description: 'This is the title of the section'
      },
      conditional: field('certificateTemplateId').isEqualTo(
        'v2.divorce-certified-certificate'
      ),
      fields: [
        {
          id: 'collector.collect.payment.data.inBetweenRegistrationTargets',
          type: FieldType.DATA,
          analytics: true,
          label: {
            defaultMessage: 'Payment details',
            description: 'Title for the data section',
            id: 'event.divorce.action.certificate.form.section.collectPayment.data.label'
          },
          configuration: {
            data: [
              {
                id: 'service',
                label: {
                  defaultMessage: 'Service',
                  description: 'Title for the data entry',
                  id: 'event.divorce.action.certificate.form.section.collectPayment.service.label'
                },
                value: {
                  defaultMessage: 'Certified copy of divorce record',
                  description: 'Certified copy of divorce record message',
                  id: 'event.divorce.action.certificate.form.section.collectPayment.service.label.certifiedCopyOfDivorceRecord'
                }
              },
              {
                id: 'fee',
                label: {
                  defaultMessage: 'Fee',
                  description: 'Title for the data entry',
                  id: 'event.divorce.action.certificate.form.section.collectPayment.fee.label'
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
            id: 'event.divorce.action.certificate.form.section.collectPayment.receiptNumber.label'
          }
        }
      ]
    }
  ]
})
