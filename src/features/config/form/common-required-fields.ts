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
} from './formatjs-messages'
import { IFormFieldMapping, ISelectOption, SerializedFormField } from './types'
import { IConditional } from './validations-and-conditionals'

export const getFamilyNameField = (
  previewGroup: string,
  conditionals: IConditional[],
  certificateHandlebar: string
): SerializedFormField => ({
  name: 'familyNameEng', // A field with this name MUST exist
  previewGroup,
  conditionals,
  type: 'TEXT',
  label: formMessageDescriptors.familyName,
  maxLength: 32,
  required: true,
  initialValue: '',
  validator: [
    {
      operation: 'englishOnlyNameFormat'
    }
  ],
  mapping: {
    template: {
      fieldName: certificateHandlebar,
      operation: 'nameToFieldTransformer',
      parameters: ['en', 'familyName']
    },
    mutation: {
      operation: 'fieldToNameTransformer',
      parameters: ['en', 'familyName']
    },
    query: {
      operation: 'nameToFieldTransformer',
      parameters: ['en', 'familyName']
    }
  }
})

export const getFirstNameField = (
  previewGroup: string,
  conditionals: IConditional[],
  certificateHandlebar: string
): SerializedFormField => ({
  name: 'firstNamesEng', // A field with this name MUST exist
  previewGroup,
  type: 'TEXT',
  label: {
    defaultMessage: 'First name(s)',
    description: 'Label for form field: First names',
    id: 'form.field.label.firstNames'
  },
  conditionals,
  maxLength: 32,
  required: true,
  initialValue: '',
  validator: [
    {
      operation: 'englishOnlyNameFormat'
    }
  ],
  mapping: {
    template: {
      fieldName: certificateHandlebar,
      operation: 'nameToFieldTransformer',
      parameters: ['en', 'firstNames']
    },
    mutation: {
      operation: 'fieldToNameTransformer',
      parameters: ['en', 'firstNames']
    },
    query: {
      operation: 'nameToFieldTransformer',
      parameters: ['en', 'firstNames']
    }
  }
})

export const getNationality = (
  certificateHandlebar: string,
  conditionals: IConditional[]
): SerializedFormField => ({
  name: 'nationality',
  type: 'SELECT_WITH_OPTIONS',
  label: formMessageDescriptors.nationality,
  required: true,
  initialValue: 'FAR',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  options: {
    resource: 'countries'
  },
  conditionals: [
    {
      action: 'hide',
      expression: '!values.detailsExist'
    }
  ].concat(conditionals),
  mapping: {
    template: {
      fieldName: certificateHandlebar,
      operation: 'nationalityTransformer'
    },
    mutation: {
      operation: 'fieldToArrayTransformer'
    },
    query: {
      operation: 'arrayToFieldTransformer'
    }
  }
})

export const getNationalID = (
  fieldName: string,
  conditionals: IConditional[],
  validator: any[],
  certificateHandlebar: string
): SerializedFormField => ({
  name: fieldName,
  type: 'TEXT',
  label: formMessageDescriptors.iDTypeNationalID,
  required: false,
  initialValue: '',
  validator,
  conditionals,
  mapping: {
    template: {
      fieldName: certificateHandlebar,
      operation: 'identityToFieldTransformer',
      parameters: ['id', 'NATIONAL_ID']
    },
    mutation: {
      operation: 'fieldToIdentityTransformer',
      parameters: ['id', 'NATIONAL_ID']
    },
    query: {
      operation: 'identityToFieldTransformer',
      parameters: ['id', 'NATIONAL_ID']
    }
  }
})

export const informantType: SerializedFormField = {
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
      value: 'MOTHER',
      label: informantMessageDescriptors.MOTHER
    },
    {
      value: 'FATHER',
      label: informantMessageDescriptors.FATHER
    },
    {
      value: 'GRANDFATHER',
      label: informantMessageDescriptors.GRANDFATHER
    },
    {
      value: 'GRANDMOTHER',
      label: informantMessageDescriptors.GRANDMOTHER
    },
    {
      value: 'BROTHER',
      label: informantMessageDescriptors.BROTHER
    },
    {
      value: 'SISTER',
      label: informantMessageDescriptors.SISTER
    },
    {
      value: 'OTHER_FAMILY_MEMBER',
      label: informantMessageDescriptors.OTHER_FAMILY_MEMBER
    },
    {
      value: 'LEGAL_GUARDIAN',
      label: informantMessageDescriptors.LEGAL_GUARDIAN
    },
    {
      value: 'OTHER',
      label: informantMessageDescriptors.OTHER
    }
  ]
}

export const otherInformantType: SerializedFormField = {
  name: 'otherInformantType',
  type: 'TEXT',
  label: formMessageDescriptors.informantsRelationWithChild,
  placeholder: formMessageDescriptors.relationshipPlaceHolder,
  required: true,
  initialValue: '',
  validator: [
    {
      operation: 'englishOnlyNameFormat'
    }
  ],
  conditionals: [
    {
      action: 'hide',
      expression: 'values.informantType !== "OTHER"'
    }
  ],
  mapping: {
    mutation: {
      operation: 'sectionFieldToBundleFieldTransformer',
      parameters: ['registration.otherInformantType']
    },
    query: {
      operation: 'bundleFieldToSectionFieldTransformer',
      parameters: ['registration.otherInformantType']
    }
  }
}

export const getPlaceOfBirthOrDeathFields = (
  fieldName: string,
  options: ISelectOption[],
  mappingObject: IFormFieldMapping,
  locationName: string,
  healthFacilityConditionals: IConditional[],
  mappingObjectForLocation: IFormFieldMapping
): SerializedFormField[] => [
  {
    name: fieldName + 'title',
    type: 'SUBSECTION',
    label: formMessageDescriptors[fieldName],
    previewGroup: fieldName,
    ignoreBottomMargin: true,
    initialValue: '',
    validator: []
  },
  {
    name: fieldName,
    type: 'SELECT_WITH_OPTIONS',
    previewGroup: fieldName,
    ignoreFieldLabelOnErrorMessage: true,
    label: formMessageDescriptors[fieldName],
    required: true,
    initialValue: '',
    validator: [],
    placeholder: formMessageDescriptors.formSelectPlaceholder,
    options: options,
    mapping: mappingObject
  },
  {
    name: locationName,
    type: 'LOCATION_SEARCH_INPUT',
    label: formMessageDescriptors.healthInstitution,
    previewGroup: fieldName,
    required: true,
    initialValue: '',
    searchableResource: ['facilities'],
    searchableType: ['HEALTH_FACILITY'],
    dynamicOptions: {
      resource: 'facilities'
    },
    validator: [
      {
        operation: 'facilityMustBeSelected'
      }
    ],
    conditionals: healthFacilityConditionals,
    mapping: mappingObjectForLocation
  }
]

export const deathInformantType: SerializedFormField = {
  name: 'contactPoint',
  type: 'SELECT_WITH_OPTIONS',
  label: formMessageDescriptors.relationshipToDeceased,
  required: true,
  previewGroup: 'contactPointGroup',
  hideInPreview: false,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  mapping: {
    mutation: {
      operation: 'sectionFieldToBundleFieldTransformer',
      parameters: ['registration.contact']
    },
    query: {
      operation: 'bundleFieldToSectionFieldTransformer',
      parameters: ['registration.contact']
    },
    template: {
      fieldName: 'contactPoint',
      operation: 'selectTransformer'
    }
  },
  options: [
    {
      value: 'SPOUSE',
      label: informantMessageDescriptors.SPOUSE
    },
    {
      value: 'SON',
      label: informantMessageDescriptors.SON
    },
    {
      value: 'DAUGHTER',
      label: informantMessageDescriptors.DAUGHTER
    },
    {
      value: 'SON_IN_LAW',
      label: informantMessageDescriptors.SON_IN_LAW
    },
    {
      value: 'DAUGHTER_IN_LAW',
      label: informantMessageDescriptors.DAUGHTER_IN_LAW
    },
    {
      value: 'MOTHER',
      label: informantMessageDescriptors.MOTHER
    },
    {
      value: 'FATHER',
      label: informantMessageDescriptors.FATHER
    },
    {
      value: 'GRANDSON',
      label: informantMessageDescriptors.GRANDSON
    },
    {
      value: 'GRANDDAUGHTER',
      label: informantMessageDescriptors.GRANDDAUGHTER
    },
    {
      value: 'OTHER',
      label: informantMessageDescriptors.OTHER
    }
  ]
}
