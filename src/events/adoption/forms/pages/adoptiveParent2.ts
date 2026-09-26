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
import { NumberOfAdoptiveParents } from './informant'

export const adoptiveParent2 = defineFormPage({
  id: 'adoptiveParent2',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Adoptive parent 2's details",
    description: 'Form section title for adoptive parent 2 details',
    id: 'form.section.adoptiveParent2.title'
  },
  conditional: field('adoption.numberOfAdoptiveParents').isEqualTo(
    NumberOfAdoptiveParents.TWO
  ),
  fields: [
    ...getIdentityFields({
      prefix: 'adoptiveParent2',
      showConditional: not(never()),
      uniqueNidAgainst: ['adoptiveParent1.nid']
    }),
    {
      id: 'adoptiveParent2.addressDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'adoptiveParent2.addressHelper',
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
      id: 'adoptiveParent2.address',
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
            'adoptiveParent2.address'
          ).isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'adoptiveParent2.address',
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
