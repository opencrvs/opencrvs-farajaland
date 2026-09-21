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
  user
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'

import {
  defaultStreetAddressConfiguration,
  getNestedFieldValidators
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
      id: 'marriageDetails.dateOfMarriage',
      analytics: true,
      type: 'DATE',
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Date of Marriage',
            description: 'This is the error message for invalid date',
            id: 'event.marriage.action.declare.form.section.marriageDetails.field.dateOfMarriage.error'
          },
          validator: field('marriageDetails.dateOfMarriage').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Date of Marriage',
        description: 'This is the label for the field',
        id: 'event.marriage.action.declare.form.section.marriageDetails.field.dateOfMarriage.label'
      }
    },
    {
      id: 'marriageDetails.placeOfMarriage',
      type: FieldType.ADDRESS,
      required: true,
      secured: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Place of marriage',
        description: 'This is the label for the field',
        id: 'event.marriage.action.declare.form.section.marriageDetails.field.placeOfMarriage.label'
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
            'marriageDetails.placeOfMarriage'
          ).isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'marriageDetails.placeOfMarriage',
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
