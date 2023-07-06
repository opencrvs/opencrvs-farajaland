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
  FLEX_DIRECTION,
  SerializedFormField,
  IPreviewGroup,
  ISerializedForm
} from './types'
import { formMessageDescriptors } from './formatjs-messages'
import { MessageDescriptor } from 'react-intl'
import {
  AllowedAddressConfigurations,
  IAddressConfiguration,
  getFieldIdentifiers,
  getAddrressFhirPropertyLocationSelect,
  getAddressLineLocationSelect,
  getPlaceOfEventLocationSelect,
  sentenceCase
} from './address-utils'
import { cloneDeep } from 'lodash'
import {
  FATHER_DETAILS_DONT_EXIST,
  MOTHER_DETAILS_DONT_EXIST,
  fathersDetailsDontExist,
  getRuralOrUrbanConditionals,
  informantNotMotherOrFather,
  mothersDetailsDontExistOnOtherPage,
  primaryAddressSameAsOtherPrimaryAddress,
  secondaryAddressesDisabled
} from './validations-and-conditionals'
import { getPreviewGroups } from './birth/preview-groups'

// ADMIN_LEVELS must equate to the number of levels of administrative structure provided by your Humdata CSV import
// For example, in Farajaland, we have 2 main administrative levels: State and District.
// Therefore our ADMIN_LEVELS property is 2.
// You can set up to 5 supported administrative levels.

export const ADMIN_LEVELS: Number = 2

// Addresses take up a lot of repeated code in the forms, making the birth.ts, marriage.ts and death.ts files long and difficult to read
// Therefore we apply the addresses dynamically to sections of the form using this configuration constant
// Its possible to show and hide address fields for individuals using conditionals.
// Its also possible to add 2 addresses per individual: PRIMARY_ADDRESS & SECONDARY_ADDRESS depending if the global config setting: secondaryAddressesDisabled is true/false

export enum EventLocationAddressCases {
  PLACE_OF_BIRTH = 'placeOfBirth',
  PLACE_OF_DEATH = 'placeOfDeath',
  PLACE_OF_MARRIAGE = 'placeOfMarriage'
}

export enum AddressCases {
  // the below are UPPER_CASE because they map to GQLAddress type enums
  PRIMARY_ADDRESS = 'PRIMARY_ADDRESS',
  SECONDARY_ADDRESS = 'SECONDARY_ADDRESS'
}

export enum AddressCopyConfigCases {
  PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY = 'primaryAddressSameAsOtherPrimary'
}

export enum AddressSubsections {
  PRIMARY_ADDRESS_SUBSECTION = 'primaryAddress',
  SECONDARY_ADDRESS_SUBSECTION = 'secondaryAddress'
}

// TODO: will deprecate this once all are set up
export const defaultAddressConfiguration: IAddressConfiguration[] = [
  {
    precedingFieldId: 'birth.child.child-view-group.birthLocation',
    configurations: [{ config: EventLocationAddressCases.PLACE_OF_BIRTH }]
  },
  {
    precedingFieldId: 'death.deathEvent.death-event-details.deathLocation',
    configurations: [{ config: EventLocationAddressCases.PLACE_OF_DEATH }]
  },
  {
    precedingFieldId:
      'marriage.marriageEvent.marriage-event-details.placeOfMarriageTitle',
    configurations: [{ config: EventLocationAddressCases.PLACE_OF_MARRIAGE }]
  },
  {
    precedingFieldId: 'birth.informant.informant-view-group.familyNameEng',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress,
        conditionalCase: informantNotMotherOrFather
      },
      {
        config: AddressCases.PRIMARY_ADDRESS,
        conditionalCase: informantNotMotherOrFather
      },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.informantSecondaryAddress,
        conditionalCase: `((${secondaryAddressesDisabled}) || (${informantNotMotherOrFather}))`
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        conditionalCase: `((${secondaryAddressesDisabled}) || (${informantNotMotherOrFather}))`
      }
    ]
  },
  {
    precedingFieldId: 'birth.mother.mother-view-group.educationalAttainment',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress,
        conditionalCase: `${MOTHER_DETAILS_DONT_EXIST}`
      },
      {
        config: AddressCases.PRIMARY_ADDRESS,
        conditionalCase: `${MOTHER_DETAILS_DONT_EXIST}`
      },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.secondaryAddress,
        conditionalCase: `${MOTHER_DETAILS_DONT_EXIST} || ${secondaryAddressesDisabled}`
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        conditionalCase: `${MOTHER_DETAILS_DONT_EXIST} || ${secondaryAddressesDisabled}`
      }
    ]
  },
  {
    precedingFieldId: 'birth.father.father-view-group.educationalAttainment',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress,
        conditionalCase: `${FATHER_DETAILS_DONT_EXIST}`
      },
      {
        config: AddressCopyConfigCases.PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY,
        label: formMessageDescriptors.primaryAddressSameAsOtherPrimary,
        xComparisonSection: 'father',
        yComparisonSection: 'mother',
        conditionalCase: `(${fathersDetailsDontExist} || ${mothersDetailsDontExistOnOtherPage})`
      },
      {
        config: AddressCases.PRIMARY_ADDRESS,
        conditionalCase: `((${FATHER_DETAILS_DONT_EXIST} || ${primaryAddressSameAsOtherPrimaryAddress}) && !(${mothersDetailsDontExistOnOtherPage}) || ((${fathersDetailsDontExist}) && (${mothersDetailsDontExistOnOtherPage})))`
      },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.secondaryAddress,
        conditionalCase: `${FATHER_DETAILS_DONT_EXIST} || ${secondaryAddressesDisabled}`
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        conditionalCase: `${FATHER_DETAILS_DONT_EXIST} || ${secondaryAddressesDisabled}`
      }
    ]
  },
  {
    precedingFieldId: 'death.deceased.deceased-view-group.maritalStatus',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.deceasedPrimaryAddress
      },
      { config: AddressCases.PRIMARY_ADDRESS },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.deceasedSecondaryAddress,
        conditionalCase: secondaryAddressesDisabled
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        conditionalCase: secondaryAddressesDisabled
      }
    ]
  },
  {
    precedingFieldId: 'death.informant.informant-view-group.informantID',
    configurations: [
      {
        config: AddressCopyConfigCases.PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY,
        label: formMessageDescriptors.primaryAddressSameAsDeceasedsPrimary,
        xComparisonSection: 'informant',
        yComparisonSection: 'deceased'
      },
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.informantPrimaryAddress,
        conditionalCase: `${primaryAddressSameAsOtherPrimaryAddress}`
      },
      {
        config: AddressCases.PRIMARY_ADDRESS,
        conditionalCase: `${primaryAddressSameAsOtherPrimaryAddress}`
      },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.informantSecondaryAddress,
        conditionalCase: secondaryAddressesDisabled
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        conditionalCase: secondaryAddressesDisabled
      }
    ]
  },
  {
    precedingFieldId: 'marriage.groom.groom-view-group.marriedLastNameEng',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress
      },
      {
        config: AddressCases.PRIMARY_ADDRESS
      },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.secondaryAddress,
        conditionalCase: `${secondaryAddressesDisabled}`
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        conditionalCase: `${secondaryAddressesDisabled}`
      }
    ]
  },
  {
    precedingFieldId: 'marriage.bride.bride-view-group.marriedLastNameEng',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress
      },
      {
        config: AddressCases.PRIMARY_ADDRESS
      },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.secondaryAddress,
        conditionalCase: `${secondaryAddressesDisabled}`
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        conditionalCase: `${secondaryAddressesDisabled}`
      }
    ]
  }
]

export function getAddressFields(
  configuration: AllowedAddressConfigurations
): SerializedFormField[] {
  switch (configuration.config) {
    case EventLocationAddressCases.PLACE_OF_BIRTH:
    case EventLocationAddressCases.PLACE_OF_DEATH:
    case EventLocationAddressCases.PLACE_OF_MARRIAGE:
      return getPlaceOfEventAddressFields(configuration.config)
    case AddressCases.PRIMARY_ADDRESS:
      return getAddress(
        AddressCases.PRIMARY_ADDRESS,
        configuration.conditionalCase
      )
    case AddressCases.SECONDARY_ADDRESS:
      return getAddress(
        AddressCases.SECONDARY_ADDRESS,
        configuration.conditionalCase
      )
    case AddressCopyConfigCases.PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY:
      if (
        !configuration.label ||
        !configuration.xComparisonSection ||
        !configuration.yComparisonSection
      ) {
        throw new Error(
          `Invalid address comparison case configuration for: ${configuration.config}`
        )
      }
      return getXAddressSameAsY(
        configuration.xComparisonSection,
        configuration.yComparisonSection,
        configuration.label,
        configuration.conditionalCase
      )
    case AddressSubsections.PRIMARY_ADDRESS_SUBSECTION:
    case AddressSubsections.SECONDARY_ADDRESS_SUBSECTION:
      if (!configuration.label) {
        throw new Error(
          `Invalid address subsection configuration for: ${configuration.config}`
        )
      }
      return getAddressSubsection(
        configuration.config,
        configuration.label,
        configuration.conditionalCase
      )
    default:
      return []
  }
}

export const getAddressSubsection = (
  previewGroup: AddressSubsections,
  label: MessageDescriptor,
  conditionalCase?: string
): SerializedFormField[] => {
  const fields: SerializedFormField[] = []
  const subsection: SerializedFormField = {
    name: previewGroup,
    type: 'SUBSECTION',
    label,
    previewGroup: previewGroup,
    initialValue: '',
    validator: []
  }

  if (conditionalCase) {
    subsection['conditionals'] = [
      {
        action: 'hide',
        expression: `${conditionalCase}`
      }
    ]
  }
  fields.push(subsection)
  return fields
}

export const getXAddressSameAsY = (
  xComparisonSection: string,
  yComparisonSection: string,
  label: MessageDescriptor,
  conditionalCase?: string
): SerializedFormField[] => {
  const copyAddressField: SerializedFormField = {
    name: AddressCopyConfigCases.PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY,
    type: 'RADIO_GROUP',
    label,
    required: true,
    initialValue: true,
    previewGroup: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
    validator: [],
    options: [
      {
        value: true,
        label: {
          defaultMessage: 'Yes',
          description: 'confirmation label for yes / no radio button',
          id: 'form.field.label.confirm'
        }
      },
      {
        value: false,
        label: {
          defaultMessage: 'No',
          description: 'deny label for yes / no radio button',
          id: 'form.field.label.deny'
        }
      }
    ],
    conditionals: conditionalCase
      ? [
          {
            action: 'hide',
            expression: `${conditionalCase}`
          }
        ]
      : [],
    mapping: {
      mutation: {
        operation: 'copyAddressTransformer',
        parameters: [
          AddressCases.PRIMARY_ADDRESS,
          yComparisonSection,
          AddressCases.PRIMARY_ADDRESS,
          xComparisonSection
        ]
      },
      query: {
        operation: 'sameAddressFieldTransformer',
        parameters: [
          AddressCases.PRIMARY_ADDRESS,
          yComparisonSection,
          AddressCases.PRIMARY_ADDRESS,
          xComparisonSection
        ]
      }
    }
  }
  return [copyAddressField]
}

export function populateRegisterFormsWithAddresses(
  defaultEventForm: ISerializedForm,
  event: string
): ISerializedForm {
  const newForm = cloneDeep(defaultEventForm)

  defaultAddressConfiguration.forEach(
    ({ precedingFieldId, configurations }: IAddressConfiguration) => {
      if (precedingFieldId.includes(event)) {
        const { sectionIndex, groupIndex, fieldIndex } = getFieldIdentifiers(
          precedingFieldId,
          newForm
        )

        let addressFields: SerializedFormField[] = []
        let previewGroups: IPreviewGroup[] = []
        configurations.forEach((configuration) => {
          addressFields = addressFields.concat(getAddressFields(configuration))
          previewGroups = previewGroups.concat(getPreviewGroups(configuration))
        })
        newForm.sections[sectionIndex].groups[groupIndex].fields.splice(
          fieldIndex + 1,
          0,
          ...addressFields
        )

        const group = newForm.sections[sectionIndex].groups[groupIndex]
        if (group.previewGroups) {
          group.previewGroups = group.previewGroups.concat(previewGroups)
        } else {
          group.previewGroups = previewGroups
        }
      }
    }
  )
  return newForm
}

export function getAddress(
  addressCase: AddressCases,
  conditionalCase?: string
): SerializedFormField[] {
  const defaultFields: SerializedFormField[] = getAddressCaseFields(addressCase)
  if (conditionalCase) {
    defaultFields.forEach((field) => {
      let conditional
      if (conditionalCase) {
        conditional = {
          action: 'hide',
          expression: `${conditionalCase}`
        }
      }
      if (
        conditional &&
        field.conditionals &&
        field.conditionals.filter(
          (conditional) => conditional.expression === conditionalCase
        ).length === 0
      ) {
        field.conditionals.push(conditional)
      } else if (conditional && !field.conditionals) {
        field.conditionals = [conditional]
      }
    })
  }
  return defaultFields
}

function getAdminLevelSelects(useCase: string): SerializedFormField[] {
  switch (ADMIN_LEVELS) {
    case 1:
      return [getAddrressFhirPropertyLocationSelect('state', useCase)]
    case 2:
      return [
        getAddrressFhirPropertyLocationSelect('state', useCase),
        getAddrressFhirPropertyLocationSelect('district', useCase)
      ]
    case 3:
      return [
        getAddrressFhirPropertyLocationSelect('state', useCase),
        getAddrressFhirPropertyLocationSelect('district', useCase),
        getAddressLineLocationSelect('locationLevel3', useCase, 10)
      ]
    case 4:
      return [
        getAddrressFhirPropertyLocationSelect('state', useCase),
        getAddrressFhirPropertyLocationSelect('district', useCase),
        getAddressLineLocationSelect('locationLevel3', useCase, 10),
        getAddressLineLocationSelect('locationLevel4', useCase, 11)
      ]
    case 5:
      return [
        getAddrressFhirPropertyLocationSelect('state', useCase),
        getAddrressFhirPropertyLocationSelect('district', useCase),
        getAddressLineLocationSelect('locationLevel3', useCase, 10),
        getAddressLineLocationSelect('locationLevel4', useCase, 11),
        getAddressLineLocationSelect('locationLevel5', useCase, 12)
      ]
    default:
      return [getAddrressFhirPropertyLocationSelect('state', useCase)]
  }
}

function getPlaceOfEventAdminLevelSelects(
  configCase: EventLocationAddressCases
): SerializedFormField[] {
  switch (ADMIN_LEVELS) {
    case 1:
      return [getPlaceOfEventLocationSelect('state', configCase)]
    case 2:
      return [
        getPlaceOfEventLocationSelect('state', configCase),
        getPlaceOfEventLocationSelect('district', configCase)
      ]
    case 3:
      return [
        getPlaceOfEventLocationSelect('state', configCase),
        getPlaceOfEventLocationSelect('district', configCase),
        getPlaceOfEventLocationSelect('locationLevel3', configCase, 10)
      ]
    case 4:
      return [
        getPlaceOfEventLocationSelect('state', configCase),
        getPlaceOfEventLocationSelect('district', configCase),
        getPlaceOfEventLocationSelect('locationLevel3', configCase, 10),
        getPlaceOfEventLocationSelect('locationLevel4', configCase, 11)
      ]
    case 5:
      return [
        getPlaceOfEventLocationSelect('state', configCase),
        getPlaceOfEventLocationSelect('district', configCase),
        getPlaceOfEventLocationSelect('locationLevel3', configCase, 10),
        getPlaceOfEventLocationSelect('locationLevel4', configCase, 11),
        getPlaceOfEventLocationSelect('locationLevel5', configCase, 12)
      ]
    default:
      return [getPlaceOfEventLocationSelect('state', configCase)]
  }
}

export function getAddressCaseFields(
  addressCase: AddressCases
): SerializedFormField[] {
  const useCase =
    addressCase === AddressCases.PRIMARY_ADDRESS ? 'primary' : 'secondary'
  return [
    {
      name: `country${sentenceCase(useCase)}`,
      type: 'SELECT_WITH_OPTIONS',
      label: {
        defaultMessage: 'Country',
        description: 'Title for the country select',
        id: 'form.field.label.country'
      },
      previewGroup: `${useCase}Address`,
      required: true,
      initialValue: 'FAR',
      validator: [],
      placeholder: {
        defaultMessage: 'Select',
        description: 'Placeholder text for a select',
        id: 'form.field.select.placeholder'
      },
      options: {
        resource: 'countries'
      },
      conditionals: [
        {
          action: 'disable',
          expression: `values?.fieldsModifiedByNidUserInfo?.includes('countryPrimary')`
        }
      ],
      mapping: {
        template: {
          fieldName: `country${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'country']
        },
        mutation: {
          operation: 'fieldToAddressFhirPropertyTransformer',
          parameters: [addressCase, 'country']
        },
        query: {
          operation: 'addressFhirPropertyToFieldTransformer',
          parameters: [addressCase, 'country']
        }
      }
    },
    ...getAdminLevelSelects(useCase),
    {
      name: `ruralOrUrban${sentenceCase(useCase)}`,
      type: 'RADIO_GROUP',
      label: {
        defaultMessage: ' ',
        description: 'Empty label for form field',
        id: 'form.field.label.emptyLabel'
      },
      options: [
        {
          label: {
            defaultMessage: 'Urban',
            id: 'form.field.label.urban',
            description: 'Label for form field checkbox option Urban'
          },
          value: 'URBAN'
        },
        {
          label: {
            defaultMessage: 'Rural',
            id: 'form.field.label.rural',
            description: 'Label for form field checkbox option Rural'
          },
          value: 'RURAL'
        }
      ],
      initialValue: 'URBAN',
      flexDirection: FLEX_DIRECTION.ROW,
      previewGroup: `${useCase}Address`,
      hideValueInPreview: true,
      required: false,
      validator: [],
      conditionals: getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]),
      mapping: {
        mutation: {
          operation: 'fieldToAddressLineTransformer',
          parameters: [addressCase, 5]
        },
        query: {
          operation: 'addressLineToFieldTransformer',
          parameters: [addressCase, 5]
        }
      }
    },
    {
      name: `cityUrbanOption${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Town',
        description: 'Title for the address line 4',
        id: 'form.field.label.cityUrbanOption'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}`,
      conditionals: getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `values.ruralOrUrban${sentenceCase(useCase)} !== "URBAN"`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]),
      mapping: {
        template: {
          fieldName: `cityUrbanOption${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'city']
        },
        mutation: {
          operation: 'fieldToAddressFhirPropertyTransformer',
          parameters: [addressCase, 'city']
        },
        query: {
          operation: 'addressFhirPropertyToFieldTransformer',
          parameters: [addressCase, 'city']
        }
      }
    },
    {
      name: `addressLine3UrbanOption${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Residential Area',
        description: 'Title for the address line 3 option 2',
        id: 'form.field.label.addressLine3UrbanOption'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}`,
      conditionals: getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `values.ruralOrUrban${sentenceCase(useCase)} !== "URBAN"`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]),
      mapping: {
        template: {
          fieldName: `addressLine3UrbanOption${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 2, 'addressLine3']
        },
        mutation: {
          operation: 'fieldToAddressLineTransformer',
          parameters: [addressCase, 2]
        },
        query: {
          operation: 'addressLineToFieldTransformer',
          parameters: [addressCase, 2]
        }
      }
    },
    {
      name: `addressLine2UrbanOption${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Street',
        description: 'Title for the address line 1',
        id: 'form.field.label.addressLine2UrbanOption'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}`,
      conditionals: getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `values.ruralOrUrban${sentenceCase(useCase)} !== "URBAN"`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]),
      mapping: {
        template: {
          fieldName: `addressLine2UrbanOption${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 1, 'addressLine2']
        },
        mutation: {
          operation: 'fieldToAddressLineTransformer',
          parameters: [addressCase, 1]
        },
        query: {
          operation: 'addressLineToFieldTransformer',
          parameters: [addressCase, 1]
        }
      }
    },
    {
      name: `numberUrbanOption${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Number',
        description: 'Title for the number field',
        id: 'form.field.label.number'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}`,
      conditionals: getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `values.ruralOrUrban${sentenceCase(useCase)} !== "URBAN"`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]),
      mapping: {
        template: {
          fieldName: `numberUrbanOption${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 0, 'number']
        },
        mutation: {
          operation: 'fieldToAddressLineTransformer',
          parameters: [addressCase, 0]
        },
        query: {
          operation: 'addressLineToFieldTransformer',
          parameters: [addressCase, 0]
        }
      }
    },
    {
      name: `postcode${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'Title for the international postcode',
        id: 'form.field.label.internationalPostcode'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}`,
      conditionals: getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `values.ruralOrUrban${sentenceCase(useCase)} !== "URBAN"`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]),
      mapping: {
        template: {
          fieldName: `postcode${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'postalCode']
        },
        mutation: {
          operation: 'fieldToAddressFhirPropertyTransformer',
          parameters: [addressCase, 'postalCode']
        },
        query: {
          operation: 'addressFhirPropertyToFieldTransformer',
          parameters: [addressCase, 'postalCode']
        }
      }
    },
    {
      name: `addressLine5${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Village',
        description: 'Title for the address line 1',
        id: 'form.field.label.addressLine5'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}`,
      conditionals: getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `values.ruralOrUrban${sentenceCase(useCase)} !== "RURAL"`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]),
      mapping: {
        template: {
          fieldName: `addressLine5${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 4, 'addressLine5']
        },
        mutation: {
          operation: 'fieldToAddressLineTransformer',
          parameters: [addressCase, 4]
        },
        query: {
          operation: 'addressLineToFieldTransformer',
          parameters: [addressCase, 4]
        }
      }
    },
    {
      name: `internationalState${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'State',
        description: 'Title for the international state select',
        id: 'form.field.label.internationalState'
      },
      previewGroup: `${useCase}Address`,
      required: true,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        },
        {
          action: 'disable',
          expression: `values?.fieldsModifiedByNidUserInfo?.includes('internationalStatePrimary')`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalState${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'state']
        },
        mutation: {
          operation: 'fieldToAddressFhirPropertyTransformer',
          parameters: [addressCase, 'state']
        },
        query: {
          operation: 'addressFhirPropertyToFieldTransformer',
          parameters: [addressCase, 'state']
        }
      }
    },
    {
      name: `internationalDistrict${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'District',
        description: 'Title for the international district select',
        id: 'form.field.label.internationalDistrict'
      },
      previewGroup: `${useCase}Address`,
      required: true,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        },
        {
          action: 'disable',
          expression: `values?.fieldsModifiedByNidUserInfo?.includes('internationalDistrictPrimary')`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalDistrict${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'district']
        },
        mutation: {
          operation: 'fieldToAddressFhirPropertyTransformer',
          parameters: [addressCase, 'district']
        },
        query: {
          operation: 'addressFhirPropertyToFieldTransformer',
          parameters: [addressCase, 'district']
        }
      }
    },
    {
      name: `internationalCity${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'City / Town',
        description: 'Title for the international city select',
        id: 'form.field.label.internationalCity'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        },
        {
          action: 'disable',
          expression: `values?.fieldsModifiedByNidUserInfo?.includes('internationalCityPrimary')`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalCity${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'city']
        },
        mutation: {
          operation: 'fieldToAddressFhirPropertyTransformer',
          parameters: [addressCase, 'city']
        },
        query: {
          operation: 'addressFhirPropertyToFieldTransformer',
          parameters: [addressCase, 'city']
        }
      }
    },
    {
      name: `internationalAddressLine1${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 1',
        description: 'Title for the international address line 1 select',
        id: 'form.field.label.internationalAddressLine1'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        },
        {
          action: 'disable',
          expression: `values?.fieldsModifiedByNidUserInfo?.includes('internationalAddressLine1Primary')`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalAddressLine1${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 6, 'addressLine1']
        },
        mutation: {
          operation: 'fieldToAddressLineTransformer',
          parameters: [addressCase, 6]
        },
        query: {
          operation: 'addressLineToFieldTransformer',
          parameters: [addressCase, 6]
        }
      }
    },
    {
      name: `internationalAddressLine2${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 2',
        description: 'Title for the international address line 2 select',
        id: 'form.field.label.internationalAddressLine2'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalAddressLine2${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 7, 'addressLine2']
        },
        mutation: {
          operation: 'fieldToAddressLineTransformer',
          parameters: [addressCase, 7]
        },
        query: {
          operation: 'addressLineToFieldTransformer',
          parameters: [addressCase, 7]
        }
      }
    },
    {
      name: `internationalAddressLine3${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 3',
        description: 'Title for the international address line 3 select',
        id: 'form.field.label.internationalAddressLine3'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalAddressLine3${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 8, 'addressLine3']
        },
        mutation: {
          operation: 'fieldToAddressLineTransformer',
          parameters: [addressCase, 8]
        },
        query: {
          operation: 'addressLineToFieldTransformer',
          parameters: [addressCase, 8]
        }
      }
    },
    {
      name: `internationalPostcode${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'Title for the international postcode',
        id: 'form.field.label.internationalPostcode'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        },
        {
          action: 'disable',
          expression: `values?.fieldsModifiedByNidUserInfo?.includes('internationalPostcodePrimary')`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalPostcode${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'postalCode']
        },
        mutation: {
          operation: 'fieldToAddressFhirPropertyTransformer',
          parameters: [addressCase, 'postalCode']
        },
        query: {
          operation: 'addressFhirPropertyToFieldTransformer',
          parameters: [addressCase, 'postalCode']
        }
      }
    }
  ]
}

export function getPlaceOfEventAddressFields(
  configCase: EventLocationAddressCases
): SerializedFormField[] {
  return [
    {
      name: 'country',
      type: 'SELECT_WITH_OPTIONS',
      label: {
        defaultMessage: 'Country',
        description: 'Title for the country select',
        id: 'form.field.label.country'
      },
      previewGroup: configCase,
      required: true,
      initialValue: 'FAR',
      validator: [],
      placeholder: {
        defaultMessage: 'Select',
        description: 'Placeholder text for a select',
        id: 'form.field.select.placeholder'
      },
      options: {
        resource: 'countries'
      },
      conditionals: [
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['country', configCase]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ transformedFieldName: 'country' }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ transformedFieldName: 'country' }]
        }
      }
    },
    ...getPlaceOfEventAdminLevelSelects(configCase),
    {
      name: 'ruralOrUrban',
      type: 'RADIO_GROUP',
      label: {
        defaultMessage: ' ',
        description: 'Empty label for form field',
        id: 'form.field.label.emptyLabel'
      },
      options: [
        {
          label: {
            defaultMessage: 'Urban',
            id: 'form.field.label.urban',
            description: 'Label for form field checkbox option Urban'
          },
          value: 'URBAN'
        },
        {
          label: {
            defaultMessage: 'Rural',
            id: 'form.field.label.rural',
            description: 'Label for form field checkbox option Rural'
          },
          value: 'RURAL'
        }
      ],
      initialValue: 'URBAN',
      flexDirection: FLEX_DIRECTION.ROW,
      required: false,
      hideValueInPreview: true,
      previewGroup: configCase,
      validator: [],
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]),
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ lineNumber: 5 }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ lineNumber: 5 }]
        }
      }
    },
    {
      name: 'cityUrbanOption',
      type: 'TEXT',
      label: {
        defaultMessage: 'Town',
        description: 'Title for the address line 4',
        id: 'form.field.label.cityUrbanOption'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'district',
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]),
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['city', configCase]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ transformedFieldName: 'city' }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ transformedFieldName: 'city' }]
        }
      }
    },
    {
      name: 'addressLine3UrbanOption',
      type: 'TEXT',
      label: {
        defaultMessage: 'Residential Area',
        description: 'Title for the address line 3 option 2',
        id: 'form.field.label.addressLine3UrbanOption'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'district',
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]),
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [2, `${configCase}AddressLine3`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ lineNumber: 2 }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ lineNumber: 2 }]
        }
      }
    },
    {
      name: 'addressLine2UrbanOption',
      type: 'TEXT',
      label: {
        defaultMessage: 'Street',
        description: 'Title for the address line 1',
        id: 'form.field.label.addressLine2UrbanOption'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'district',
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]),
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [1, `${configCase}AddressLine2`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ lineNumber: 1 }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ lineNumber: 1 }]
        }
      }
    },
    {
      name: 'numberUrbanOption',
      type: 'TEXT',
      label: {
        defaultMessage: 'Number',
        description: 'Title for the number field',
        id: 'form.field.label.number'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'district',
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]),
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [0, `${configCase}Number`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ lineNumber: 0 }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ lineNumber: 0 }]
        }
      }
    },
    {
      name: 'postalCode',
      type: 'TEXT',
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'Title for the international postcode',
        id: 'form.field.label.internationalPostcode'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'district',
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]),
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['postalCode', configCase]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ transformedFieldName: 'postalCode' }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ transformedFieldName: 'postalCode' }]
        }
      }
    },
    {
      name: 'addressLine5',
      type: 'TEXT',
      label: {
        defaultMessage: 'Village',
        description: 'Title for the address line 1',
        id: 'form.field.label.addressLine5'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'district',
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "RURAL"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]),
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [4, `${configCase}AddressLine5`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ lineNumber: 4 }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ lineNumber: 4 }]
        }
      }
    },
    {
      name: 'internationalState',
      type: 'TEXT',
      label: {
        defaultMessage: 'State',
        description: 'Title for the international state select',
        id: 'form.field.label.internationalState'
      },
      previewGroup: configCase,
      required: true,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['state', configCase]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ transformedFieldName: 'state' }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [
            { transformedFieldName: 'state' },
            {
              fieldsToIgnoreForLocalAddress: [
                'internationalDistrict',
                'internationalState'
              ],
              fieldsToIgnoreForInternationalAddress: ['district', 'state']
            }
          ]
        }
      }
    },
    {
      name: 'internationalDistrict',
      type: 'TEXT',
      label: {
        defaultMessage: 'District',
        description: 'Title for the international district select',
        id: 'form.field.label.internationalDistrict'
      },
      previewGroup: configCase,
      required: true,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['district', configCase]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ transformedFieldName: 'district' }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [
            { transformedFieldName: 'district' },
            {
              fieldsToIgnoreForLocalAddress: [
                'internationalDistrict',
                'internationalState'
              ],
              fieldsToIgnoreForInternationalAddress: ['district', 'state']
            }
          ]
        }
      }
    },
    {
      name: 'internationalCity',
      type: 'TEXT',
      label: {
        defaultMessage: 'City / Town',
        description: 'Title for the international city select',
        id: 'form.field.label.internationalCity'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ transformedFieldName: 'city' }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ transformedFieldName: 'city' }]
        }
      }
    },
    {
      name: 'internationalAddressLine1',
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 1',
        description: 'Title for the international address line 1 select',
        id: 'form.field.label.internationalAddressLine1'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [6, `${configCase}AddressLine1`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ lineNumber: 6 }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ lineNumber: 6 }]
        }
      }
    },
    {
      name: 'internationalAddressLine2',
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 2',
        description: 'Title for the international address line 2 select',
        id: 'form.field.label.internationalAddressLine2'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [7, `${configCase}AddressLine2`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ lineNumber: 7 }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ lineNumber: 7 }]
        }
      }
    },
    {
      name: 'internationalAddressLine3',
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 3',
        description: 'Title for the international address line 3 select',
        id: 'form.field.label.internationalAddressLine3'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [8, `${configCase}AddressLine3`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ lineNumber: 8 }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ lineNumber: 8 }]
        }
      }
    },
    {
      name: 'internationalPostcode',
      type: 'TEXT',
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'Title for the international postcode',
        id: 'form.field.label.internationalPostcode'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ transformedFieldName: 'postalCode' }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ transformedFieldName: 'postalCode' }]
        }
      }
    }
  ]
}
