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
  AddressType,
  ConditionalType,
  defineConditional,
  defineFormPage,
  FieldType,
  PageTypes,
  field,
  never,
  user
} from '@opencrvs/toolkit/events'
import { farajalandNameConfig } from '@countryconfig/events/birth/validators'
import {
  defaultStreetAddressConfiguration,
  emptyMessage,
  getNestedFieldValidators
} from '@countryconfig/events/utils'

export const adoptionDetails = defineFormPage({
  id: 'adoptionDetails',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Adoption details',
    description: 'Form section title for adoption details',
    id: 'form.section.adoptionDetails.title'
  },
  fields: [
    {
      id: 'adoptee.brnSearch',
      type: FieldType.SEARCH,
      label: {
        defaultMessage: "Search child's birth registration no.",
        description: 'Search BRN',
        id: 'form.field.label.adoptee.brnSearch'
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
            id: 'form.field.error.adoptee.brnSearch.invalid'
          }
        },
        indicators: {
          ok: {
            defaultMessage: 'Birth record found',
            description: 'OK indicator text',
            id: 'form.field.indicator.adoptee.brnSearch.found'
          },
          clearModal: {
            title: {
              defaultMessage: 'Clear birth registration no.?',
              description: 'Title for the clear confirmation modal',
              id: 'form.field.clearModal.adoptee.brnSearch.title'
            },
            description: {
              defaultMessage:
                'This will remove the auto-populated details from the birth record.',
              description: 'Description for the clear confirmation modal',
              id: 'form.field.clearModal.adoptee.brnSearch.description'
            }
          }
        }
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: 'adoptee.brn',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: "Child's birth registration no.",
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.adoptionDetails.field.adoptee.brn.label'
      },
      parent: field('adoptee.brnSearch'),
      value: field('adoptee.brnSearch').getByPath([
        'data',
        'firstResult',
        'legalStatuses',
        'REGISTERED',
        'registrationNumber'
      ]),
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: field('adoptee.brnSearch')
            .getByPath(['data', 'firstResult'])
            .isFalsy()
        }
      ]
    },
    {
      id: 'adoptee.name',
      type: FieldType.NAME,
      required: true,
      configuration: farajalandNameConfig,
      hideLabel: true,
      label: {
        defaultMessage: "Child's name",
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.adoptionDetails.field.adoptee.name.label'
      },
      parent: field('adoptee.brnSearch'),
      value: field('adoptee.brnSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.name'
      ]),
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: field('adoptee.brnSearch')
            .getByPath(['data', 'firstResult'])
            .isFalsy()
        }
      ]
    },
    {
      id: 'adoptee.dob',
      type: FieldType.DATE,
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'event.adoption.action.declare.form.section.adoptionDetails.field.adoptee.dob.error'
          },
          validator: field('adoptee.dob').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.adoptionDetails.field.adoptee.dob.label'
      },
      parent: field('adoptee.brnSearch'),
      value: field('adoptee.brnSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.dob'
      ]),
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: field('adoptee.brnSearch')
            .getByPath(['data', 'firstResult'])
            .isFalsy()
        }
      ]
    },
    {
      id: 'adoptee.placeOfBirth',
      type: FieldType.ADDRESS,
      required: true,
      hideLabel: false,
      label: {
        defaultMessage: 'Place of birth',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.adoptionDetails.field.adoptee.placeOfBirth.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field(
            'adoptee.placeOfBirth'
          ).isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'adoptee.placeOfBirth',
          defaultStreetAddressConfiguration
        )
      ],
      defaultValue: {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('administrativeAreaId')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      }
    },
    {
      id: 'adoptionDetails.divider',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'adoption.date',
      type: FieldType.DATE,
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid date',
            description: 'This is the error message for invalid date',
            id: 'event.adoption.action.declare.form.section.adoptionDetails.field.adoption.date.error'
          },
          validator: field('adoption.date').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Date of adoption',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.adoptionDetails.field.adoption.date.label'
      }
    },
    {
      id: 'adoption.courtOrderNumber',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Court order reference no.',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.adoptionDetails.field.adoption.courtOrderNumber.label'
      }
    },
    {
      id: 'adoption.courtName',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Name of court',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.adoptionDetails.field.adoption.courtName.label'
      }
    },
    {
      id: 'adoption.judgeName',
      type: FieldType.NAME,
      required: true,
      configuration: farajalandNameConfig,
      label: {
        defaultMessage: "Court judge's name",
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.adoptionDetails.field.adoption.judgeName.label'
      }
    }
  ]
})
