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
  field,
  FieldType,
  never,
  not,
  PageTypes,
  user
} from '@opencrvs/toolkit/events'
import {
  defaultStreetAddressConfiguration,
  emptyMessage,
  getIdentityFields,
  getNestedFieldValidators
} from '@countryconfig/events/utils'
import { InformantType } from './informant'

export const parent = defineFormPage({
  id: 'parent',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Parent's details",
    description: 'Form section title for the parent details',
    id: 'form.section.parent.title'
  },
  conditional: field('informant.relation').isEqualTo(InformantType.PARENT),
  fields: [
    ...getIdentityFields({
      prefix: 'parent',
      showConditional: not(never())
    }),
    {
      id: 'parent.addressDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'parent.addressHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Place of residence',
        description: 'This is the label for the field',
        id: 'event.name-change.action.declare.form.section.person.field.addressHelper.label'
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
      id: 'parent.address',
      type: FieldType.ADDRESS,
      required: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Place of residence',
        description: 'This is the label for the field',
        id: 'event.name-change.action.declare.form.section.person.field.address.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field('parent.address').isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'parent.address',
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
