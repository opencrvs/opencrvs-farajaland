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
  defineFormPage,
  FieldType,
  PageTypes,
  field,
  never,
  not,
  user
} from '@opencrvs/toolkit/events'
import {
  defaultStreetAddressConfiguration,
  emptyMessage,
  getIdentityFields,
  getNestedFieldValidators
} from '@countryconfig/events/utils'

export const adoptiveParent1 = defineFormPage({
  id: 'adoptiveParent1',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Adoptive parent 1's details",
    description: 'Form section title for adoptive parent 1 details',
    id: 'form.section.adoptiveParent1.title'
  },
  fields: [
    ...getIdentityFields({
      prefix: 'adoptiveParent1',
      showConditional: not(never()),
      uniqueNidAgainst: ['adoptiveParent2.nid']
    }),
    {
      id: 'adoptiveParent1.addressDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'adoptiveParent1.addressHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Place of residence',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.person.field.addressHelper.label'
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
      id: 'adoptiveParent1.address',
      type: FieldType.ADDRESS,
      required: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Place of residence',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.person.field.address.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field(
            'adoptiveParent1.address'
          ).isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'adoptiveParent1.address',
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
