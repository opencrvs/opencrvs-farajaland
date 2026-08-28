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
  FieldType,
  never,
  or,
  TranslationConfig,
  field,
  user
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'
import { createSelectOptions, emptyMessage } from '@countryconfig/events/utils'

export const InformantType = {
  BRIDE: 'BRIDE',
  GROOM: 'GROOM'
} as const
export type InformantTypeKey = keyof typeof InformantType

const PHONE_NUMBER_REGEX = '^0(7|9)[0-9]{8}$'
const informantMessageDescriptors = {
  BRIDE: {
    defaultMessage: 'Bride',
    description: 'Label for option Bride',
    id: 'form.field.label.informantRelation.bride'
  },
  GROOM: {
    defaultMessage: 'Groom',
    description: 'Label for option Groom',
    id: 'form.field.label.informantRelation.groom'
  }
} satisfies Record<keyof typeof InformantType, TranslationConfig>

const marriageInformantTypeOptions = createSelectOptions(
  InformantType,
  informantMessageDescriptors
)

export const idReaderHelperText = {
  id: 'event.marriage.id-reader.helper-text',
  defaultMessage:
    "Authentication isn't required to register. To issue a UIN for the child, at least one parent must be authenticated",
  description: 'Helper text'
}

export const informant = defineFormPage({
  id: 'informant',
  title: {
    defaultMessage: "Informant's details",
    description: 'Form section title for informants details',
    id: 'form.section.informant.title'
  },
  fields: [
    {
      id: 'informant.relation',
      type: FieldType.SELECT,
      analytics: true,
      required: true,
      label: {
        defaultMessage: 'Informant type',
        description: 'This is the label for the field',
        id: 'event.marriage.action.declare.form.section.informant.field.relation.label'
      },
      options: marriageInformantTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(user.hasRole('HOSPITAL_CLERK'))
        }
      ]
    },
    {
      id: 'informant.contactPoint.divider',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'informant.contactPointHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Point of contact',
        description: 'This is the label for the field',
        id: 'event.marriage.action.declare.form.section.informant.field.contactPointHelper.label'
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
      secured: true,
      label: {
        defaultMessage: 'Phone number',
        description: 'This is the label for the field',
        id: 'event.marriage.action.declare.form.section.informant.field.phoneNo.label'
      },
      validation: [
        {
          message: {
            defaultMessage:
              'Must be a valid 10 digit number that starts with 0(7|9)',
            description:
              'The error message that appears on phone numbers where the first two characters must be 07 or 09, and length must be 10',
            id: 'event.marriage.action.declare.form.section.informant.field.phoneNo.error'
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
      secured: true,
      label: {
        defaultMessage: 'Email',
        description: 'This is the label for the field',
        id: 'event.marriage.action.declare.form.section.informant.field.email.label'
      },
      configuration: {
        maxLength: 255
      }
    }
  ]
})
