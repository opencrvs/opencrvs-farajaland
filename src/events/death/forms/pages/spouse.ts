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
  and,
  ConditionalType,
  defineFormPage,
  FieldType,
  never,
  field,
  or,
  user
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'
import {
  farajalandNameConfig,
  invalidNameValidator,
  nationalIdValidator
} from '@countryconfig/events/birth/validators'

import { InformantType } from './informant'
import {
  IdType,
  idTypeOptions,
  yesNoRadioOptions,
  YesNoTypes,
  defaultStreetAddressConfiguration,
  getNestedFieldValidators,
  emptyMessage,
  getIdentityFields
} from '@countryconfig/events/utils'
import {
  connectToMOSIPIdReader,
  connectToMOSIPVerificationStatus,
  getMOSIPIntegrationFields
} from '@countryconfig/events/mosip'

const requireSpouseDetails = or(
  field('spouse.detailsNotAvailable').isFalsy(),
  field('informant.relation').isEqualTo(InformantType.SPOUSE)
)

export const spouse = defineFormPage({
  id: 'spouse',
  title: {
    defaultMessage: 'Spouse details',
    description: 'Form section title for spouse details',
    id: 'form.section.spouse.title'
  },
  fields: [
    {
      id: 'spouse.detailsNotAvailable',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: "Deceased had no spouse",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.detailsNotAvailable.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.relation').isEqualTo(InformantType.SPOUSE)
          )
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('spouse.detailsNotAvailable').isEqualTo(true)
        }
      ]
    },
    {
      id: 'spouse.details.divider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.relation').isEqualTo(InformantType.SPOUSE)
          )
        }
      ]
    },
    ...getIdentityFields({
      prefix: 'spouse',
      showConditional: requireSpouseDetails,
      parent: field('informant.relation'),
      uniqueNidAgainst: ['informant.nid', 'deceased.nid']
    }),
    {
      id: 'spouse.addressDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireSpouseDetails
        }
      ]
    },
    {
      id: 'spouse.address',
      type: FieldType.ADDRESS,
      required: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Place of residence',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.address.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireSpouseDetails
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field('spouse.address').isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'spouse.address',
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
