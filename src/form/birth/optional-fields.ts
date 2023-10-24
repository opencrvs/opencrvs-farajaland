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
import { getFieldMapping } from '@countryconfig/utils/mapping/field-mapping-utils'
import { formMessageDescriptors } from '../common/messages'
import {
  attendantAtBirthOptions,
  educationalAttainmentOptions,
  typeOfBirthOptions
} from '../common/select-options'
import { SerializedFormField } from '../types/types'
import { certificateHandlebars } from './certificate-handlebars'

export const attendantAtBirth: SerializedFormField = {
  name: 'attendantAtBirth',
  type: 'SELECT_WITH_OPTIONS',
  label: formMessageDescriptors.attendantAtBirth,
  required: false,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  options: attendantAtBirthOptions,
  mapping: getFieldMapping(
    'attendantAtBirth',
    certificateHandlebars.attendantAtBirth
  ),
  exampleValues: ['Nurse'],
}

export const birthType: SerializedFormField = {
  name: 'birthType',
  type: 'SELECT_WITH_OPTIONS',
  label: {
    defaultMessage: 'Type of birth',
    description: 'Label for form field: Type of birth',
    id: 'form.field.label.birthType'
  },
  required: false,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  options: typeOfBirthOptions,
  mapping: getFieldMapping('birthType', certificateHandlebars.birthType),
  exampleValues: ['Single'],
}

export const weightAtBirth: SerializedFormField = {
  name: 'weightAtBirth',
  type: 'NUMBER',
  step: 0.01,
  label: formMessageDescriptors.weightAtBirth,
  required: false,
  initialValue: '',
  validator: [
    {
      operation: 'range',
      parameters: [0, 6]
    }
  ],
  postfix: 'Kg',
  exampleValues: ['3'],
  mapping: getFieldMapping(
    'weightAtBirth',
    certificateHandlebars.weightAtBirth
  ),
  inputFieldWidth: '78px'
}

export const multipleBirth: SerializedFormField = {
  name: 'multipleBirth',
  type: 'NUMBER',
  label: {
    defaultMessage: 'No. of previous births',
    description: 'Label for form field: multipleBirth',
    id: 'form.field.label.multipleBirth'
  },
  conditionals: [
    {
      action: 'hide',
      expression: '!values.detailsExist'
    }
  ],
  required: false,
  initialValue: '',
  validator: [
    {
      operation: 'greaterThanZero'
    },
    {
      operation: 'maxLength',
      parameters: [2]
    }
  ],
  mapping: getFieldMapping(
    'multipleBirth',
    certificateHandlebars.multipleBirth
  ),
  inputFieldWidth: '64px',
  exampleValues: ['10'],
}

export const getOccupation = (
  certificateHandlebar: string
): SerializedFormField => ({
  name: 'occupation',
  type: 'TEXT',
  label: {
    defaultMessage: 'Occupation',
    description: 'text for occupation form field',
    id: 'form.field.label.occupation'
  },
  required: false,
  initialValue: '',
  validator: [],
  conditionals: [
    {
      action: 'hide',
      expression: '!values.detailsExist'
    }
  ],
  mapping: getFieldMapping('occupation', certificateHandlebar),
  exampleValues: ['Occupation'],
})

export const getEducation = (
  certificateHandlebar: string
): SerializedFormField => ({
  name: 'educationalAttainment',
  type: 'SELECT_WITH_OPTIONS',
  label: formMessageDescriptors.educationAttainment,
  required: false,
  initialValue: '',
  validator: [],
  conditionals: [
    {
      action: 'hide',
      expression: '!values.detailsExist'
    }
  ],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  options: educationalAttainmentOptions,
  mapping: getFieldMapping('educationalAttainment', certificateHandlebar),
  exampleValues: ['No schooling'],
})
