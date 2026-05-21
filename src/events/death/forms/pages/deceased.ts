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
  TranslationConfig,
  ConditionalType,
  and,
  FieldType,
  AddressType,
  PageTypes,
  field,
  user,
  defineConditional
} from '@opencrvs/toolkit/events'
import { not, never } from '@opencrvs/toolkit/conditionals'
import {
  IdType,
  maritalStatusOptions,
  createSelectOptions,
  emptyMessage,
  defaultStreetAddressConfiguration,
  getNestedFieldValidators,
  getIdTypeOptions
} from '@countryconfig/events/utils'
import {
  farajalandNameConfig,
  invalidNameValidator,
  nationalIdValidator,
  passportValidator
} from '@countryconfig/events/birth/validators'

const GenderTypes = {
  MALE: 'male',
  FEMALE: 'female',
  UNKNOWN: 'unknown'
} as const

const genderMessageDescriptors = {
  MALE: {
    defaultMessage: 'Male',
    description: 'Label for option male',
    id: 'form.field.label.sexMale'
  },
  FEMALE: {
    defaultMessage: 'Female',
    description: 'Label for option female',
    id: 'form.field.label.sexFemale'
  },
  UNKNOWN: {
    defaultMessage: 'Unknown',
    description: 'Label for option unknown',
    id: 'form.field.label.sexUnknown'
  }
} satisfies Record<keyof typeof GenderTypes, TranslationConfig>

const genderOptions = createSelectOptions(GenderTypes, genderMessageDescriptors)

export const deceased = defineFormPage({
  id: 'deceased',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Deceased's details",
    description: 'Form section title for Deceased',
    id: 'form.death.deceased.title'
  },
  fields: [
    {
      id: `deceased.nationality`,
      type: FieldType.COUNTRY,
      required: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: `v2.event.death.action.declare.form.section.person.field.nationality.label`
      },
      defaultValue: 'FAR'
    },
    {
      id: `deceased.brn.search`,
      type: FieldType.SEARCH,
      label: {
        defaultMessage: 'Search BRN',
        description: 'Search BRN',
        id: 'form.field.label.searchBRN'
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
            id: 'tennis-club-membership.searchField.validation.invalid'
          }
        },
        indicators: {
          ok: {
            defaultMessage: 'BRN found',
            description: 'OK button text',
            id: 'form.field.label.searchBRN.indicators.ok'
          },
          clearModal: {
            title: {
              defaultMessage: 'Clear BRN?',
              description: 'Title for the clear confirmation modal',
              id: 'form.field.label.searchBRN.indicators.clearModal.title'
            },
            description: {
              defaultMessage: 'This will remove the BRN.',
              description: 'Description for the clear confirmation modal',
              id: 'form.field.label.searchBRN.indicators.clearModal.description'
            }
          }
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('deceased.nationality').isEqualTo('FAR')
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: `deceased.brn`,
      type: FieldType.TEXT,
      required: true,
      parent: field('deceased.brn.search'),
      value: field('deceased.brn.search').getByPath([
        'data',
        'firstResult',
        'legalStatuses',
        'REGISTERED',
        'registrationNumber'
      ]),
      label: {
        defaultMessage: 'Birth registration no.',
        description: 'Birth Registration Number',
        id: 'form.field.label.brn'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(
              field('deceased.brn.search')
                .getByPath(['data', 'firstResult'])
                .isFalsy()
            ),
            field('deceased.nationality').isEqualTo('FAR')
          )
        },
        {
          type: ConditionalType.ENABLE,
          conditional: never()
        }
      ]
    },
    {
      id: `deceased.idType`,
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Form of ID',
        description: 'This is the label for the field',
        id: `v2.event.death.action.declare.form.section.person.field.idType.label`
      },
      options: getIdTypeOptions('deceased')
    },
    {
      id: 'deceased.nid',
      type: FieldType.ID,
      required: true,
      label: {
        defaultMessage: 'National ID no.',
        description: 'This is the label for the field',
        id: `v2.event.death.action.declare.form.section.person.field.nid.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('deceased.idType').isEqualTo(IdType.NATIONAL_ID),
            field('deceased.nationality').isEqualTo('FAR')
          )
        }
      ],
      validation: [
        nationalIdValidator('deceased.nid'),
        {
          message: {
            defaultMessage: 'National id must be unique',
            description: 'This is the error message for non-unique ID Number',
            id: 'event.death.action.declare.form.nid.unique'
          },
          validator: and(
            not(field('deceased.nid').isEqualTo(field('informant.nid')))
          )
        }
      ]
    },
    {
      id: `deceased.passport`,
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Passport no.',
        description: 'This is the label for the field',
        id: `v2.event.death.action.declare.form.section.person.field.passport.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field(`deceased.idType`).isEqualTo(IdType.PASSPORT)
        }
      ],
      validation: [passportValidator('deceased.passport')]
    },
    {
      id: 'deceased.name',
      type: FieldType.NAME,
      configuration: farajalandNameConfig,
      required: true,
      hideLabel: true,
      label: {
        defaultMessage: "Deceased's name",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.name.label'
      },
      parent: field('deceased.brn.search'),
      value: field('deceased.brn.search').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.name'
      ]),
      validation: [invalidNameValidator('deceased.name')],
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: field('deceased.brn.search')
            .getByPath(['data', 'firstResult'])
            .isFalsy()
        }
      ]
    },
    {
      id: 'deceased.dob',
      type: FieldType.DATE,
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'event.death.action.declare.form.section.deceased.field.dob.error'
          },
          validator: field('deceased.dob').isBefore().now()
        },
        {
          message: {
            defaultMessage: 'Date of birth must be before the date of death',
            description:
              'This is the error message for date of birth later than date of death',
            id: 'event.death.action.declare.form.section.deceased.field.dob.error.laterThanDeath'
          },
          validator: field('deceased.dob')
            .isBefore()
            .date(field('eventDetails.date'))
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.dob.label'
      },
      parent: field('deceased.brn.search'),
      value: field('deceased.brn.search').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.dob'
      ]),
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: field('deceased.brn.search')
            .getByPath(['data', 'firstResult'])
            .isFalsy()
        }
      ]
    },
    {
      id: 'deceased.gender',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Sex',
        description: 'This is the label for the field',
        id: `v2.event.death.action.declare.form.section.deceased.field.gender.label`
      },
      options: genderOptions,
      parent: field('deceased.brn.search'),
      value: field('deceased.brn.search').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.gender'
      ]),
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: field('deceased.brn.search')
            .getByPath(['data', 'firstResult'])
            .isFalsy()
        }
      ]
    },
    {
      id: 'deceased.maritalStatus',
      type: FieldType.SELECT,
      required: false,
      label: {
        defaultMessage: 'Marital Status',
        description: 'This is the label for the field',
        id: `v2.event.death.action.declare.form.section.deceased.field.maritalStatus.label`
      },
      options: maritalStatusOptions
    },
    {
      id: `deceased.addressDivider`,
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: `deceased.addressHelper`,
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Place of residence',
        description: 'This is the label for the field',
        id: `v2.event.death.action.declare.form.section.deceased.field.addressHelper.label`
      },
      configuration: { styles: { fontVariant: 'h3' } },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: `deceased.address`,
      type: FieldType.ADDRESS,
      required: true,
      hideLabel: true,
      secured: true,
      label: {
        defaultMessage: 'Place of residence',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.address.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field('deceased.address').isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'deceased.address',
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
    }
  ]
})
