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
  defineFormPage,
  ConditionalType,
  and,
  FieldType,
  AddressType,
  PageTypes,
  field,
  user,
  never
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'
import {
  defaultStreetAddressConfiguration,
  emptyMessage,
  getNestedFieldValidators,
  mrnSearchConfig
} from '@countryconfig/events/utils'

export const marriageDetails = defineFormPage({
  id: 'marriageDetails',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Marriage details',
    description: 'Form section title for Marriage',
    id: 'form.marriage.details.title'
  },
  fields: [
    {
      id: 'divorce.marriageRegistrationNumberSearch',
      ...mrnSearchConfig,
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: 'divorce.marriageRegistrationNumber',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Marriage registration number',
        description: 'This is the label for the field',
        id: 'form.field.label.divorce.marriageRegistrationNumber'
      },
      parent: field('divorce.marriageRegistrationNumberSearch'),
      value: field('divorce.marriageRegistrationNumberSearch').getByPath([
        'data',
        'input'
      ]),
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: field('divorce.marriageRegistrationNumberSearch')
            .getByPath(['data', 'input'])
            .isFalsy()
        }
      ]
    },
    {
      id: 'divorce.dateOfMarriage',
      analytics: true,
      type: 'DATE',
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Date of Marriage',
            description: 'This is the error message for invalid date',
            id: 'event.divorce.action.declare.form.section.person.field.dateOfMarriage.error'
          },
          validator: and(
            field('divorce.dateOfMarriage').isBefore().now(),
            field('divorce.dateOfMarriage')
              .isBefore()
              .date(field('divorce.dateOfDivorce'))
          )
        }
      ],
      label: {
        defaultMessage: 'Date of Marriage',
        description: 'This is the label for the field',
        id: 'event.divorce.action.declare.form.section.person.field.dateOfMarriage.label'
      },
      parent: field('divorce.marriageRegistrationNumberSearch'),
      value: field('divorce.marriageRegistrationNumberSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'marriageDetails.dateOfMarriage'
      ]),
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: field('divorce.marriageRegistrationNumberSearch')
            .getByPath(['data', 'input'])
            .isFalsy()
        }
      ]
    },
    {
      id: 'divorce.placeOfMarriage',
      type: FieldType.ADDRESS,
      required: true,
      secured: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Place of marriage',
        description: 'This is the label for the field',
        id: 'event.divorce.action.declare.form.section.person.field.placeOfMarriage.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(not(user.hasRole('HOSPITAL_CLERK')))
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field(
            'divorce.placeOfMarriage'
          ).isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'divorce.placeOfMarriage',
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
      id: 'divorce.husbandDivider',
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
      id: 'divorce.husbandHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: "Husband's details",
        description: 'This is the label for the field',
        id: 'event.divorce.action.declare.form.section.person.field.husbandHelper.label'
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
      id: 'husband.firstname',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'First name',
        description: 'This is the label for the field',
        id: 'event.divorce.action.declare.form.section.person.field.husbandFirstname.label'
      },
      parent: field('divorce.marriageRegistrationNumberSearch'),
      value: field('divorce.marriageRegistrationNumberSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'groom.name',
        'firstname'
      ]),
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: field('divorce.marriageRegistrationNumberSearch')
            .getByPath(['data', 'input'])
            .isFalsy()
        }
      ]
    },
    {
      id: 'husband.surname',
      type: FieldType.TEXT,
      required: true,
      label: {
        id: 'event.divorce.action.declare.form.section.person.field.husbandName.label',
        defaultMessage: 'Last name',
        description: 'This is the label for the field'
      },
      parent: field('divorce.marriageRegistrationNumberSearch'),
      value: field('divorce.marriageRegistrationNumberSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'groom.name',
        'surname'
      ]),
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: field('divorce.marriageRegistrationNumberSearch')
            .getByPath(['data', 'input'])
            .isFalsy()
        }
      ]
    },
    {
      id: 'divorce.wifeDivider',
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
      id: 'divorce.wifeHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: "Wife's details",
        description: 'This is the label for the field',
        id: 'event.divorce.action.declare.form.section.person.field.wifeHelper.label'
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
      id: 'wife.firstname',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'First name',
        description: 'This is the label for the field',
        id: 'event.divorce.action.declare.form.section.person.field.wifeFirstname.label'
      },
      parent: field('divorce.marriageRegistrationNumberSearch'),
      value: field('divorce.marriageRegistrationNumberSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'bride.name',
        'firstname'
      ]),
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: field('divorce.marriageRegistrationNumberSearch')
            .getByPath(['data', 'input'])
            .isFalsy()
        }
      ]
    },
    {
      id: 'wife.surname',
      type: FieldType.TEXT,
      required: true,
      label: {
        id: 'event.divorce.action.declare.form.section.person.field.wifeName.label',
        defaultMessage: 'Last name',
        description: 'This is the label for the field'
      },
      parent: field('divorce.marriageRegistrationNumberSearch'),
      value: field('divorce.marriageRegistrationNumberSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'bride.name',
        'surname'
      ]),
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: field('divorce.marriageRegistrationNumberSearch')
            .getByPath(['data', 'input'])
            .isFalsy()
        }
      ]
    }
  ]
})
