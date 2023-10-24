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
import {
  formMessageDescriptors,
  informantMessageDescriptors
} from '../common/messages'
import {
  getMarriageInformantTypeOptions,
  witnessRelationshipOptions
} from '../common/select-options'
import { ISelectOption, SerializedFormField, Conditional } from '../types/types'
import { certificateHandlebars } from './certificate-handlebars'

export const marriageInformantType: SerializedFormField = {
  name: 'informantType',
  type: 'SELECT_WITH_OPTIONS',
  label: informantMessageDescriptors.birthInformantTitle,
  required: true,
  hideInPreview: false,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  mapping: getFieldMapping(
    'informantType',
    certificateHandlebars.informantType
  ),
  options: getMarriageInformantTypeOptions
}

export const getMarriageDate: SerializedFormField = {
  name: 'marriageDate',
  type: 'DATE',
  label: formMessageDescriptors.marriageEventDate,
  required: true,
  initialValue: '',
  validator: [
    {
      operation: 'checkMarriageDate',
      parameters: [18]
    }
  ],
  mapping: getFieldMapping('marriageDate', certificateHandlebars.eventDate)
}

export const getRelationshipToSpousesForWitness: SerializedFormField = {
  name: 'relationship',
  type: 'SELECT_WITH_OPTIONS',
  label: formMessageDescriptors.relationshipToSpouses,
  required: true,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  options: witnessRelationshipOptions
}

export const witnessRelationshipForOthers: SerializedFormField = {
  name: 'otherRelationship',
  type: 'TEXT',
  label: formMessageDescriptors.other,
  maxLength: 32,
  required: true,
  initialValue: '',
  validator: [],
  conditionals: [
    {
      action: 'hide',
      expression: '(values.relationship!=="OTHER")'
    }
  ]
}

const marriageDocumentExtraValue = {
  GROOM: 'GROOM',
  BRIDE: 'BRIDE',
  MARRIAGE_NOTICE_PROOF: 'MARRIAGE_NOTICE_PROOF',
  INFORMANT: 'INFORMANT',
  OTHER: 'OTHER',
  HEAD_OF_GROOM_FAMILY: 'HEAD_OF_GROOM_FAMILY',
  HEAD_OF_BRIDE_FAMILY: 'HEAD_OF_BRIDE_FAMILY'
}

export const getDocUploaderForMarriage = (
  name: string,
  label:
    | 'proofOfMarriageNotice'
    | 'proofOfGroomsID'
    | 'proofOfBridesID'
    | 'proofOfInformantsID',
  extraValueEnum: 'GROOM' | 'BRIDE' | 'MARRIAGE_NOTICE_PROOF' | 'INFORMANT',
  options: ISelectOption[],
  conditionals: Conditional[]
): SerializedFormField => ({
  name,
  type: 'DOCUMENT_UPLOADER_WITH_OPTION',
  label: formMessageDescriptors[label],
  required: false,
  initialValue: '',
  extraValue: marriageDocumentExtraValue[extraValueEnum],
  hideAsterisk: true,
  conditionals,
  validator: [],
  options,
  mapping: getFieldMapping('documents')
})
