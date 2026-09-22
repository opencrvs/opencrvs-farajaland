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
  ConditionalType,
  defineFormPage,
  field,
  FieldType,
  never,
  or,
  PageTypes,
  TranslationConfig
} from '@opencrvs/toolkit/events'
import { createSelectOptions, emptyMessage } from '@countryconfig/events/utils'

export const InformantType = {
  SUBJECT: 'SUBJECT',
  PARENT: 'PARENT'
} as const

const informantMessageDescriptors = {
  SUBJECT: {
    defaultMessage: 'Subject',
    description: 'Label for option subject',
    id: 'form.field.label.informantRelation.subject'
  },
  PARENT: {
    defaultMessage: 'Parent',
    description: 'Label for option parent',
    id: 'form.field.label.informantRelation.parent'
  }
} satisfies Record<keyof typeof InformantType, TranslationConfig>

const nameChangeInformantTypeOptions = createSelectOptions(
  InformantType,
  informantMessageDescriptors
)

const PHONE_NUMBER_REGEX = '^0(7|9)[0-9]{8}$'

export const informant = defineFormPage({
  id: 'informant',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Informant's details",
    description: 'Form section title for informants details',
    id: 'form.section.informant.title'
  },
  fields: [
    {
      id: 'informant.relation',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Informant',
        description: 'This is the label for the field',
        id: 'event.name-change.action.declare.form.section.informant.field.relation.label'
      },
      options: nameChangeInformantTypeOptions
    },
    {
      id: 'informant.divider',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'informant.contactPointHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Point of contact',
        description: 'This is the label for the field',
        id: 'event.name-change.action.declare.form.section.informant.field.contactPointHelper.label'
      },
      configuration: {
        styles: { fontVariant: 'h3' }
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: 'informant.phoneNo',
      type: FieldType.PHONE,
      required: false,
      label: {
        defaultMessage: 'Phone number',
        description: 'This is the label for the field',
        id: 'event.name-change.action.declare.form.section.informant.field.phoneNo.label'
      },
      validation: [
        {
          message: {
            defaultMessage:
              'Must be a valid 10 digit number that starts with 0(7|9)',
            description:
              'The error message that appears on phone numbers where the first two characters must be 07 or 09, and length must be 10',
            id: 'event.name-change.action.declare.form.section.informant.field.phoneNo.error'
          },
          validator: or(
            field('informant.phoneNo').matches(PHONE_NUMBER_REGEX),
            field('informant.phoneNo').isFalsy()
          )
        }
      ]
    },
    {
      id: 'informant.email',
      type: FieldType.EMAIL,
      required: true,
      label: {
        defaultMessage: 'Email address',
        description: 'This is the label for the field',
        id: 'event.name-change.action.declare.form.section.informant.field.email.label'
      },
      configuration: {
        maxLength: 255
      }
    }
  ]
})
