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
  field,
  not,
  user,
  never,
  AddressType
} from '@opencrvs/toolkit/events'
import {
  defaultStreetAddressConfiguration,
  emptyMessage,
  getIdentityFields,
  getNestedFieldValidators
} from '@countryconfig/events/utils'

export const bride = defineFormPage({
  id: 'bride',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Bride's details",
    description: 'Form section title for brides details',
    id: 'form.section.bride.title'
  },
  fields: [
    ...getIdentityFields({
      prefix: 'bride',
      showConditional: not(never()),
      hideIdFieldsForHospitalClerk: true,
      uniqueNidAgainst: ['groom.nid', 'informant.nid']
    }),
    {
      id: 'bride.addressDivider',
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
      id: 'bride.addressHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Place of residence',
        description: 'This is the label for the field',
        id: 'event.marriage.action.declare.form.section.person.field.addressHelper.label'
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
      id: 'bride.address',
      type: FieldType.ADDRESS,
      required: true,
      hideLabel: true,
      secured: true,
      label: {
        defaultMessage: 'Place of residence',
        description: 'This is the label for the field',
        id: 'event.marriage.action.declare.form.section.person.field.address.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(user.hasRole('HOSPITAL_CLERK'))
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field('bride.address').isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'bride.address',
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
