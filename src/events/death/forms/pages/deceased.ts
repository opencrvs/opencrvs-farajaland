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
  idTypeOptions,
  maritalStatusOptions,
  createSelectOptions,
  emptyMessage,
  defaultStreetAddressConfiguration,
  getNestedFieldValidators,
  idTypeOptionsForeigner
} from '@countryconfig/events/utils'
import {
  farajalandNameConfig,
  invalidNameValidator,
  nationalIdValidator
} from '@countryconfig/events/birth/validators'
import {
  connectToMOSIPIdReader,
  connectToMOSIPVerificationStatus,
  getMOSIPIntegrationFields
} from '@countryconfig/events/mosip'

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
    /**
     *  {
          id: 'recommender.search',
          type: FieldType.SEARCH,
          label: {
            defaultMessage: 'Registration Number of recommender',
            description: 'This is the label for the field',
            id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.search.label'
          },
          helperText: {
            defaultMessage:
              'You can search tennis records created on Farajaland since beginning of 2023',
            description: 'This is the helper text for the field',
            id: 'tennis-club-membership.searchField.helperText'
          },
          configuration: {
            query: {
              type: 'or',
              clauses: [
                {
                  'legalStatuses.REGISTERED.registrationNumber': {
                    term: '{term}',
                    type: 'exact'
                  }
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
                defaultMessage: 'Recommender found',
                description: 'OK button text',
                id: 'tennis-club-membership.searchField.indicators.ok'
              },
              clearModal: {
                title: {
                  defaultMessage: 'Clear recommender?',
                  description: 'Title for the clear confirmation modal',
                  id: 'tennis-club-membership.searchField.indicators.clearModal.title'
                },
                description: {
                  defaultMessage:
                    'This will remove the details of the current recommender.',
                  description: 'Description for the clear confirmation modal',
                  id: 'tennis-club-membership.searchField.indicators.clearModal.description'
                }
              }
            }
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('recommender.none').isFalsy()
            },
            {
              type: ConditionalType.DISPLAY_ON_REVIEW,
              conditional: never()
            }
          ]
        },
        {
          id: 'recommender1.heading',
          type: FieldType.HEADING,
          label: {
            defaultMessage: 'Recommender 1',
            description: 'This is the label for the field',
            id: `recommender1.heading.label`
          },
          configuration: { styles: { fontVariant: 'h3' } }
        },
        {
          id: 'recommender.name',
          configuration: { maxLength: MAX_NAME_LENGTH },
          type: FieldType.NAME,
          required: true,
          parent: field('recommender.search'),
          defaultValue: {
            firstname: user('firstname'),
            middlename: user('middlename'),
            surname: user('surname')
          },
     */
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
              defaultMessage:
                'This will remove the BRN.',
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
        }
      ],
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
          conditional: field('deceased.nationality').isEqualTo('FAR')
        }
      ]
    },
    connectToMOSIPIdReader(
      {
        id: `deceased.idType`,
        type: FieldType.SELECT,
        required: true,
        label: {
          defaultMessage: 'Form of ID',
          description: 'This is the label for the field',
          id: `v2.event.death.action.declare.form.section.person.field.idType.label`
        },
        options: idTypeOptions,
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('deceased.nationality').isEqualTo('FAR')
          }
        ]
      },
      {
        valuePath: 'data.idType',
        hideIf: ['authenticated'],
        disableIf: ['pending', 'verified']
      }
    ),
    connectToMOSIPIdReader(
      {
        id: `deceased.idType`,
        type: FieldType.SELECT,
        required: true,
        label: {
          defaultMessage: 'Form of ID',
          description: 'This is the label for the field',
          id: `v2.event.death.action.declare.form.section.person.field.idType.label`
        },
        options: idTypeOptionsForeigner,
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: not(field('deceased.nationality').isEqualTo('FAR'))
          }
        ]
      },
      {
        valuePath: 'data.idType',
        hideIf: ['authenticated'],
        disableIf: ['pending', 'verified']
      }
    ),
    // fields:
    // deceased.verified, deceased.query-params, deceased.verify-nid-http-fetch,
    // deceased.fetch-loader, deceased.id-reader
    ...getMOSIPIntegrationFields('deceased', {
      existingConditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('deceased.nationality').isEqualTo('FAR')
        }
      ]
    }),
    connectToMOSIPIdReader(
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
        valuePath: 'data.nid',
        hideIf: ['authenticated'],
        disableIf: ['pending', 'verified']
      }
    ),
    connectToMOSIPIdReader(
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
        ]
      },
      {
        valuePath: 'data.passport',
        hideIf: ['authenticated'],
        disableIf: ['pending', 'verified']
      }
    ),
    connectToMOSIPIdReader(
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
        validation: [invalidNameValidator('deceased.name')]
      },
      {
        valuePath: 'data.name',
        disableIf: ['pending', 'verified', 'authenticated']
      }
    ),
    connectToMOSIPIdReader(
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
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: not(field(`deceased.dobUnknown`).isEqualTo(true))
          }
        ]
      },
      {
        valuePath: 'data.birthDate',
        disableIf: ['pending', 'verified', 'authenticated']
      }
    ),
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
