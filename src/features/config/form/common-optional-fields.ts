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
import { formMessageDescriptors } from './formatjs-messages'
import { SerializedFormField } from './types'
import {
  IConditional,
  hideIfInformantMotherOrFather
} from './validations-and-conditionals'

export const getBirthDate = (
  fieldName: string,
  conditionals: IConditional[],
  validator: any[],
  certificateHandlebar: string
): SerializedFormField => ({
  name: fieldName, // A field with this name MUST exist
  type: 'DATE',
  label: formMessageDescriptors.dateOfBirth,
  required: true,
  conditionals,
  initialValue: '',
  validator,
  mapping: {
    template: {
      operation: 'dateFormatTransformer',
      fieldName: certificateHandlebar,
      parameters: ['birthDate', 'en', 'do MMMM yyyy']
    },
    mutation: {
      operation: 'longDateTransformer',
      parameters: ['birthDate']
    },
    query: {
      operation: 'fieldValueTransformer',
      parameters: ['birthDate']
    }
  }
})

export const getGender = (
  certificateHandlebar: string
): SerializedFormField => ({
  name: 'gender', // A field with this name MUST exist
  type: 'SELECT_WITH_OPTIONS',
  label: formMessageDescriptors.sex,
  required: true,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  mapping: {
    template: {
      fieldName: certificateHandlebar,
      operation: 'selectTransformer'
    }
  },
  options: [
    {
      value: 'male',
      label: formMessageDescriptors.sexMale
    },
    {
      value: 'female',
      label: formMessageDescriptors.sexFemale
    },
    {
      value: 'unknown',
      label: formMessageDescriptors.sexUnknown
    }
  ]
})

export const exactDateOfBirthUnknown: SerializedFormField = {
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
      parameters: [5, true]
    }
  ],
  conditionals: [
    {
      action: 'hide',
      expression: '!window.config.DATE_OF_BIRTH_UNKNOWN || !values.detailsExist'
    }
  ].concat(hideIfInformantMotherOrFather),
  mapping: {
    query: {
      operation: 'booleanTransformer'
    },
    mutation: {
      operation: 'ignoreFieldTransformer'
    }
  }
}

export const getAgeOfIndividualInYears = (
  label: MessageDescriptor,
  conditionals: IConditional[]
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
  conditionals: IConditional[]
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
  mapping: {
    template: {
      fieldName: certificateHandlebar,
      operation: 'selectTransformer'
    }
  },
  conditionals: conditionals,
  options: [
    {
      value: 'SINGLE',
      label: {
        defaultMessage: 'Single',
        description: 'Option for form field: Marital status',
        id: 'form.field.label.maritalStatusSingle'
      }
    },
    {
      value: 'MARRIED',
      label: {
        defaultMessage: 'Married',
        description: 'Option for form field: Marital status',
        id: 'form.field.label.maritalStatusMarried'
      }
    },
    {
      value: 'WIDOWED',
      label: {
        defaultMessage: 'Widowed',
        description: 'Option for form field: Marital status',
        id: 'form.field.label.maritalStatusWidowed'
      }
    },
    {
      value: 'DIVORCED',
      label: {
        defaultMessage: 'Divorced',
        description: 'Option for form field: Marital status',
        id: 'form.field.label.maritalStatusDivorced'
      }
    },
    {
      value: 'SEPARATED',
      label: {
        id: 'form.field.label.maritalStatusSeparated',
        defaultMessage: 'Separated',
        description: 'Option for form field: Marital status'
      }
    },
    {
      value: 'NOT_STATED',
      label: {
        defaultMessage: 'Not stated',
        description: 'Option for form field: Marital status',
        id: 'form.field.label.maritalStatusNotStated'
      }
    }
  ]
})

export const registrationEmail: SerializedFormField = {
  name: 'registrationEmail',
  type: 'TEL',
  label: formMessageDescriptors.email,
  required: false,
  initialValue: '',
  validator: [
    {
      operation: 'emailAddressFormat'
    }
  ],
  conditionals: [],
  mapping: {
    mutation: {
      operation: 'sectionFieldToBundleFieldTransformer',
      parameters: ['registration.email']
    },
    query: {
      operation: 'bundleFieldToSectionFieldTransformer',
      parameters: ['registration.email']
    },
    template: {
      fieldName: 'email',
      operation: 'plainInputTransformer'
    }
  }
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
  mapping: {
    mutation: {
      operation: 'sectionFieldToBundleFieldTransformer',
      parameters: ['registration.contactPhoneNumber']
    },
    query: {
      operation: 'bundleFieldToSectionFieldTransformer',
      parameters: ['registration.contactPhoneNumber']
    },
    template: {
      fieldName: 'contactPhoneNumber',
      operation: 'selectTransformer'
    }
  }
}

export const seperatorSubsection: SerializedFormField = {
  name: 'seperator',
  type: 'SUBSECTION',
  label: {
    defaultMessage: ' ',
    description: 'empty string',
    id: 'form.field.label.empty'
  },
  initialValue: '',
  ignoreBottomMargin: true,
  validator: [],
  conditionals: []
}
