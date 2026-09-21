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

import { emptyMessage } from '@countryconfig/events/utils'
import {
  defineFormPage,
  FieldType,
  PageTypes,
  field,
  ConditionalType,
  user,
  not,
  never
} from '@opencrvs/toolkit/events'

export const divorceDetails = defineFormPage({
  id: 'divorceDetails',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Divorce details',
    description: 'Form section title for Divorce',
    id: 'form.divorce.details.title'
  },
  fields: [
    {
      id: 'divorce.dateOfDivorce',
      analytics: true,
      type: 'DATE',
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Date of Divorce',
            description: 'This is the error message for invalid date',
            id: 'event.divorce.action.declare.form.section.person.field.dateOfDivorce.error'
          },
          validator: field('divorce.dateOfDivorce').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Date of Divorce',
        description: 'This is the label for the field',
        id: 'event.divorce.action.declare.form.section.person.field.dateOfDivorce.label'
      }
    },
    {
      id: 'court.name',
      type: FieldType.TEXT,
      required: true,
      label: {
        id: 'event.divorce.action.declare.form.section.person.field.courtName.label',
        defaultMessage: 'Name of the court',
        description: 'This is the label for the field'
      }
    },
    {
      id: 'court.orderNumber',
      type: FieldType.NUMBER,
      required: true,
      label: {
        id: 'event.divorce.action.declare.form.section.person.field.courtOrderNumber.label',
        defaultMessage: 'Court order reference number',
        description: 'This is the label for the field'
      }
    },
    {
      id: 'divorce.judgeDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(user.hasRole('HOSPITAL_CLERK'))
        }
      ]
    },
    {
      id: 'divorce.judgeHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: "Court Judge's details",
        description: 'This is the label for the field',
        id: 'event.divorce.action.declare.form.section.person.field.judgeHelper.label'
      },
      configuration: {
        styles: { fontVariant: 'h3' }
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        },
        {
          type: ConditionalType.SHOW,
          conditional: not(user.hasRole('HOSPITAL_CLERK'))
        }
      ]
    },
    {
      id: 'judge.name',
      type: FieldType.NAME,
      required: true,
      hideLabel: true,
      label: {
        id: 'event.divorce.action.declare.form.section.person.field.judgeName.label',
        defaultMessage: 'Court judge',
        description: 'This is the label for the field'
      }
    }
  ]
})
