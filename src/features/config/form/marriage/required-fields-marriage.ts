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

import {
  formMessageDescriptors,
  informantMessageDescriptors
} from '../formatjs-messages'
import { SerializedFormField } from '../types'

export const marriageInformantType: SerializedFormField = {
  name: 'informantType',
  type: 'SELECT_WITH_OPTIONS',
  label: informantMessageDescriptors.birthInformantTitle,
  required: true,
  hideInPreview: false,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  mapping: {
    mutation: {
      operation: 'sectionFieldToBundleFieldTransformer',
      parameters: ['registration.informantType']
    },
    query: {
      operation: 'bundleFieldToSectionFieldTransformer',
      parameters: ['registration.informantType']
    },
    template: {
      fieldName: 'informantType',
      operation: 'selectTransformer'
    }
  },
  options: [
    {
      value: 'GROOM',
      label: informantMessageDescriptors.GROOM
    },
    {
      value: 'BRIDE',
      label: informantMessageDescriptors.BRIDE
    },
    {
      value: 'HEAD_OF_GROOM_FAMILY',
      label: formMessageDescriptors.headOfGroomFamily
    },
    {
      value: 'HEAD_OF_BRIDE_FAMILY',
      label: formMessageDescriptors.headOfBrideFamily
    },
    {
      value: 'OTHER',
      label: informantMessageDescriptors.OTHER
    }
  ]
}

export const groomBirthDateValidators = [
  {
    operation: 'dateFormatIsCorrect',
    parameters: []
  },
  {
    operation: 'dateInPast',
    parameters: []
  },
  {
    operation: 'isValidDateOfBirthForMarriage',
    parameters: ['groom', 18]
  }
]
