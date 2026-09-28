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
  PageTypes,
  TranslationConfig,
  field,
  never,
  or
} from '@opencrvs/toolkit/events'
import { createSelectOptions, emptyMessage } from '@countryconfig/events/utils'

export const NumberOfAdoptiveParents = {
  ONE: '1',
  TWO: '2'
} as const

const numberOfAdoptiveParentsMessageDescriptors = {
  ONE: {
    defaultMessage: '1',
    description: 'Label for one adoptive parent',
    id: 'form.field.label.numberOfAdoptiveParents.one'
  },
  TWO: {
    defaultMessage: '2',
    description: 'Label for two adoptive parents',
    id: 'form.field.label.numberOfAdoptiveParents.two'
  }
} satisfies Record<keyof typeof NumberOfAdoptiveParents, TranslationConfig>

const numberOfAdoptiveParentsOptions = createSelectOptions(
  NumberOfAdoptiveParents,
  numberOfAdoptiveParentsMessageDescriptors
)

export const InformantType = {
  ADOPTIVE_PARENT_1: 'ADOPTIVE_PARENT_1',
  ADOPTIVE_PARENT_2: 'ADOPTIVE_PARENT_2'
} as const

const informantMessageDescriptors = {
  ADOPTIVE_PARENT_1: {
    defaultMessage: 'Adoptive parent 1',
    description: 'Label for option adoptive parent 1',
    id: 'form.field.label.informantRelation.adoptiveParent1'
  },
  ADOPTIVE_PARENT_2: {
    defaultMessage: 'Adoptive parent 2',
    description: 'Label for option adoptive parent 2',
    id: 'form.field.label.informantRelation.adoptiveParent2'
  }
} satisfies Record<keyof typeof InformantType, TranslationConfig>

const adoptionInformantTypeOptions = createSelectOptions(
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
      id: 'adoption.numberOfAdoptiveParents',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Number of adoptive parents',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.informant.field.numberOfAdoptiveParents.label'
      },
      options: numberOfAdoptiveParentsOptions
    },
    {
      id: 'informant.relation',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Informant',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.informant.field.relation.label'
      },
      options: adoptionInformantTypeOptions,
      parent: field('adoption.numberOfAdoptiveParents'),
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('adoption.numberOfAdoptiveParents').isEqualTo(
            NumberOfAdoptiveParents.TWO
          )
        }
      ]
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
        id: 'event.adoption.action.declare.form.section.informant.field.contactPointHelper.label'
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
        id: 'event.adoption.action.declare.form.section.informant.field.phoneNo.label'
      },
      validation: [
        {
          message: {
            defaultMessage:
              'Must be a valid 10 digit number that starts with 0(7|9)',
            description:
              'The error message that appears on phone numbers where the first two characters must be 07 or 09, and length must be 10',
            id: 'event.adoption.action.declare.form.section.informant.field.phoneNo.error'
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
        defaultMessage: 'Email',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.informant.field.email.label'
      },
      configuration: {
        maxLength: 255
      }
    }
  ]
})
