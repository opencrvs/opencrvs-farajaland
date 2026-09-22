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
  defineConditional,
  defineFormPage,
  field,
  FieldType,
  never,
  PageTypes,
  TranslationConfig
} from '@opencrvs/toolkit/events'
import {
  farajalandNameConfig,
  passportValidator
} from '@countryconfig/events/birth/validators'
import { createSelectOptions } from '@countryconfig/events/utils'

const IdType = {
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  NONE: 'NONE'
} as const

const idTypeMessageDescriptors = {
  NATIONAL_ID: {
    defaultMessage: 'National ID',
    description: 'Option for form field: Form of ID',
    id: 'form.field.label.iDTypeNationalID'
  },
  PASSPORT: {
    defaultMessage: 'Passport',
    description: 'Option for form field: Form of ID',
    id: 'form.field.label.iDTypePassport'
  },
  NONE: {
    defaultMessage: 'No ID',
    description: 'Option for form field: Form of ID',
    id: 'form.field.label.iDTypeNone'
  }
} satisfies Record<keyof typeof IdType, TranslationConfig>

const idTypeOptions = createSelectOptions(IdType, idTypeMessageDescriptors)

const isFarajalandNationalId = and(
  field('subject.nationality').isEqualTo('FAR'),
  field('subject.idType').isEqualTo(IdType.NATIONAL_ID)
)

export { IdType as SubjectIdType }

export const subject = defineFormPage({
  id: 'subject',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Event subject's details",
    description: 'Form section title for the event subject details',
    id: 'form.section.subject.title'
  },
  fields: [
    {
      id: 'subject.nationality',
      type: FieldType.COUNTRY,
      required: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: 'event.name-change.action.declare.form.section.subject.field.nationality.label'
      },
      defaultValue: 'FAR'
    },
    {
      id: 'subject.idType',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Form of ID',
        description: 'This is the label for the field',
        id: 'event.name-change.action.declare.form.section.subject.field.idType.label'
      },
      options: idTypeOptions,
      parent: field('subject.nationality')
    },
    {
      id: 'subject.brnSearch',
      type: FieldType.SEARCH,
      label: {
        defaultMessage: "Search subject's birth registration no.",
        description: 'Search BRN',
        id: 'form.field.label.subject.brnSearch'
      },
      configuration: {
        query: {
          type: 'and',
          clauses: [
            {
              'legalStatuses.REGISTERED.registrationNumber': {
                term: '{term}',
                type: 'exact'
              }
            },
            {
              eventType: 'birth'
            }
          ]
        },
        limit: 10,
        offset: 0,
        validation: {
          validator: defineConditional({
            type: 'string',
            pattern: '^[A-Za-z0-9]{12}$',
            description: 'Must be alpha-numeric and 12 characters long'
          }),
          message: {
            defaultMessage:
              'Invalid value: Must be alpha-numeric and 12 characters long',
            description: 'Error message for invalid value',
            id: 'form.field.error.subject.brnSearch.invalid'
          }
        },
        indicators: {
          ok: {
            defaultMessage: 'Birth record found',
            description: 'OK indicator text',
            id: 'form.field.indicator.subject.brnSearch.found'
          },
          clearModal: {
            title: {
              defaultMessage: 'Clear birth registration no.?',
              description: 'Title for the clear confirmation modal',
              id: 'form.field.clearModal.subject.brnSearch.title'
            },
            description: {
              defaultMessage:
                'This will remove the auto-populated details from the birth record.',
              description: 'Description for the clear confirmation modal',
              id: 'form.field.clearModal.subject.brnSearch.description'
            }
          }
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: isFarajalandNationalId
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ],
      parent: [field('subject.nationality'), field('subject.idType')]
    },
    {
      id: 'subject.nid',
      type: FieldType.ID,
      required: true,
      label: {
        defaultMessage: 'National ID no.',
        description: 'This is the label for the field',
        id: 'event.name-change.action.declare.form.section.subject.field.nid.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: isFarajalandNationalId
        },
        {
          type: ConditionalType.ENABLE,
          conditional: field('subject.brnSearch')
            .getByPath(['data', 'firstResult'])
            .isFalsy()
        }
      ],
      parent: [field('subject.nationality'), field('subject.idType')],
      value: field('subject.brnSearch').getByPath(['data', 'input'])
    },
    {
      id: 'subject.passport',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Passport no.',
        description: 'This is the label for the field',
        id: 'event.name-change.action.declare.form.section.subject.field.passport.label'
      },
      validation: [passportValidator('subject.passport')],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subject.idType').isEqualTo(IdType.PASSPORT)
        }
      ],
      parent: field('subject.idType')
    },
    {
      id: 'subject.nameAtBirth',
      type: FieldType.NAME,
      required: true,
      configuration: farajalandNameConfig,
      hideLabel: true,
      label: {
        defaultMessage: "Subject's name at birth",
        description: 'This is the label for the field',
        id: 'event.name-change.action.declare.form.section.subject.field.nameAtBirth.label'
      },
      parent: field('subject.brnSearch'),
      value: field('subject.brnSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.name'
      ]),
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: field('subject.brnSearch')
            .getByPath(['data', 'firstResult'])
            .isFalsy()
        }
      ]
    },
    {
      id: 'subject.dob',
      type: FieldType.DATE,
      required: true,
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.name-change.action.declare.form.section.subject.field.dob.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'event.name-change.action.declare.form.section.subject.field.dob.error'
          },
          validator: field('subject.dob').isBefore().now()
        }
      ],
      parent: field('subject.brnSearch'),
      value: field('subject.brnSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.dob'
      ]),
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: field('subject.brnSearch')
            .getByPath(['data', 'firstResult'])
            .isFalsy()
        }
      ]
    }
  ]
})
