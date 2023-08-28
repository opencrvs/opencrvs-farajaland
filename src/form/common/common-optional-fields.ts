/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { MessageDescriptor } from 'react-intl'
import { formMessageDescriptors } from './messages'
import { SerializedFormField, Conditional } from '../types/types'
import { Validator } from '../types/validators'
import { maritalStatusOptions } from './select-options'
import { certificateHandlebars } from '../birth/certificate-handlebars'
import { getFieldMapping } from '@countryconfig/utils/mapping/field-mapping-utils'

const exactDobConditional: Conditional[] = [
  {
    action: 'hide',
    expression: '!window.config.DATE_OF_BIRTH_UNKNOWN'
  }
]

export const exactDateOfBirthUnknown = (
  conditionalCase: Conditional[]
): SerializedFormField => ({
  name: 'exactDateOfBirthUnknown',
  type: 'CHECKBOX',
  label: {
    defaultMessage: 'Exact date of birth unknown',
    description: 'Checkbox for exact date of birth unknown',
    id: 'form.field.label.exactDateOfBirthUnknown'
  },
  hideInPreview: true,
  required: false,
  hideHeader: true,
  initialValue: false,
  validator: [],
  conditionals: exactDobConditional.concat(conditionalCase),
  mapping: {
    query: {
      operation: 'booleanTransformer'
    },
    mutation: {
      operation: 'ignoreFieldTransformer'
    }
  }
})

export const getNationalID = (
  fieldName: string,
  conditionals: Conditional[],
  validator: Validator[],
  certificateHandlebar: string
) =>
  ({
    name: fieldName,
    type: 'TEXT',
    label: formMessageDescriptors.iDTypeNationalID,
    required: false,
    initialValue: '',
    validator,
    conditionals,
    mapping: getFieldMapping('nationalId', certificateHandlebar)
  } satisfies SerializedFormField)

export const getAgeOfIndividualInYears = (
  label: MessageDescriptor,
  conditionals: Conditional[]
): SerializedFormField => ({
  name: 'ageOfIndividualInYears',
  type: 'NUMBER',
  label,
  required: true,
  initialValue: '',
  validator: [
    {
      operation: 'range',
      parameters: [12, 120]
    },
    {
      operation: 'maxLength',
      parameters: [3]
    },
    {
      operation: 'isValidParentsBirthDate',
      parameters: [10, true]
    }
  ],
  conditionals,
  postfix: 'years',
  inputFieldWidth: '78px'
})

export const getMaritalStatus = (
  certificateHandlebar: string,
  conditionals: Conditional[]
): SerializedFormField => ({
  name: 'maritalStatus',
  type: 'SELECT_WITH_OPTIONS',
  label: {
    defaultMessage: 'Marital status',
    description: 'Label for form field: Marital status',
    id: 'form.field.label.maritalStatus'
  },
  required: false,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  mapping: getFieldMapping('maritalStatus', certificateHandlebar),
  conditionals,
  options: maritalStatusOptions
})

export const registrationEmail: SerializedFormField = {
  name: 'registrationEmail',
  type: 'TEXT',
  label: formMessageDescriptors.email,
  required: true, // Email is the configured INFORMANT_NOTIFICATION_DELIVERY_METHOD in Farajaland
  initialValue: '',
  validator: [
    {
      operation: 'emailAddressFormat'
    }
  ],
  conditionals: [],
  mapping: getFieldMapping(
    'registrationEmail',
    certificateHandlebars.contactEmail
  )
}

export const registrationPhone: SerializedFormField = {
  name: 'registrationPhone',
  type: 'TEL',
  label: formMessageDescriptors.phoneNumber,
  required: false,
  initialValue: '',
  validator: [
    {
      operation: 'phoneNumberFormat'
    }
  ],
  conditionals: [],
  mapping: getFieldMapping(
    'registrationPhone',
    certificateHandlebars.contactPhoneNumber
  )
}

export const divider = (
  name = 'seperator',
  conditionals?: Conditional[]
): SerializedFormField => ({
  name,
  type: 'DIVIDER',
  label: {
    defaultMessage: ' ',
    description: 'empty string',
    id: 'form.field.label.empty'
  },
  initialValue: '',
  ignoreBottomMargin: true,
  validator: [],
  conditionals
})

// This optional field is used to validate user input with an externally integrated national ID system
export const getNIDVerificationButton = (
  fieldName: string,
  conditionals: Conditional[],
  validator: any[]
): SerializedFormField => ({
  name: fieldName,
  type: 'NID_VERIFICATION_BUTTON',
  label: formMessageDescriptors.iDTypeNationalID,
  required: true,
  initialValue: '',
  validator,
  conditionals,
  mapping: getFieldMapping('nationalIdVerification'),
  labelForVerified: formMessageDescriptors.nidVerified,
  labelForUnverified: formMessageDescriptors.nidNotVerified,
  labelForOffline: formMessageDescriptors.nidOffline
})
