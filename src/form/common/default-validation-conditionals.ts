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
import { Conditional } from '../types/types'
import { IntegratingSystemType } from '../types/types'
import { Validator } from '../types/validators'

export const isValidChildBirthDate = [
  {
    operation: 'isValidChildBirthDate'
  }
] satisfies Validator[]

export const hideIfNidIntegrationDisabled = [
  {
    action: 'hide',
    expression: `const nationalIdSystem =
    offlineCountryConfig &&
    offlineCountryConfig.systems.find(s => s.integratingSystemType === '${IntegratingSystemType.Mosip}');
    !nationalIdSystem ||
    !nationalIdSystem.settings.openIdProviderBaseUrl ||
    !nationalIdSystem.settings.openIdProviderClientId ||
    !nationalIdSystem.settings.openIdProviderClaims;
  `
  }
]

export const motherNationalIDVerfication = [
  {
    action: 'hide',
    expression: '!values.detailsExist'
  },
  {
    action: 'disable',
    expression: `values.motherNidVerification`
  }
]

export const fatherNationalIDVerfication = [
  {
    action: 'hide',
    expression: '!values.detailsExist'
  },
  {
    action: 'disable',
    expression: `values.fatherNidVerification`
  }
]

export const mothersBirthDateConditionals = [
  {
    action: 'hide',
    expression: '!values.detailsExist'
  },
  {
    action: 'disable',
    expression: 'values.exactDateOfBirthUnknown'
  },
  {
    action: 'disable',
    expression: `draftData?.mother?.fieldsModifiedByNidUserInfo?.includes('motherBirthDate')`
  }
]

export const parentsBirthDateValidators = [
  {
    operation: 'dateFormatIsCorrect',
    parameters: []
  },
  {
    operation: 'dateInPast',
    parameters: []
  },
  {
    operation: 'isValidParentsBirthDate',
    parameters: [5]
  }
] satisfies Validator[]

export const detailsExist = [
  {
    action: 'hide',
    expression: '!values.detailsExist'
  }
]

// if informant is not mother or father
export const informantNotMotherOrFather =
  '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'

export const hideIfInformantMotherOrFather = [
  {
    action: 'hide',
    expression: informantNotMotherOrFather
  }
]

export const mothersDetailsExistConditionals = [
  {
    action: 'hide',
    expression: 'draftData?.informant?.informantType==="MOTHER"'
  },
  {
    action: 'hideInPreview',
    expression: 'values.detailsExist'
  }
]

export const fathersDetailsExistConditionals = [
  {
    action: 'hide',
    expression: 'draftData?.informant?.informantType==="FATHER"'
  },
  {
    action: 'hideInPreview',
    expression: 'values.detailsExist'
  }
]

export const fathersBirthDateConditionals = [
  {
    action: 'hide',
    expression: '!values.detailsExist'
  },
  {
    action: 'disable',
    expression: 'values.exactDateOfBirthUnknown'
  },
  {
    action: 'disable',
    expression: `draftData?.father?.fieldsModifiedByNidUserInfo?.includes('fatherBirthDate')`
  }
]
export const motherFirstNameConditionals = [
  {
    action: 'hide',
    expression: '!values.detailsExist'
  },
  {
    action: 'disable',
    expression: `draftData?.mother?.fieldsModifiedByNidUserInfo?.includes('firstNamesEng')`
  }
]

export const motherFamilyNameConditionals = [
  {
    action: 'hide',
    expression: '!values.detailsExist'
  },
  {
    action: 'disable',
    expression: `draftData?.mother?.fieldsModifiedByNidUserInfo?.includes('familyNameEng')`
  }
]
export const fatherFirstNameConditionals = [
  {
    action: 'hide',
    expression: '!values.detailsExist'
  },
  {
    action: 'disable',
    expression: `draftData?.father?.fieldsModifiedByNidUserInfo?.includes('firstNamesEng')`
  }
]

export const fatherFamilyNameConditionals = [
  {
    action: 'hide',
    expression: '!values.detailsExist'
  },
  {
    action: 'disable',
    expression: `draftData?.father?.fieldsModifiedByNidUserInfo?.includes('familyNameEng')`
  }
]

export const hideIfInformantBrideOrGroom: Conditional[] = [
  {
    action: 'hide',
    expression:
      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
  }
]

export const getInformantConditionalForMarriageDocUpload: Conditional[] = [
  {
    action: 'hide',
    expression:
      "(draftData && draftData.informant && draftData.informant.informantType && (draftData.informant.informantType === 'BRIDE' || draftData.informant.informantType === 'GROOM' ))"
  }
]

export const brideOrGroomBirthDateValidators = (spouseType: string) => [
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
    parameters: [spouseType, 18]
  }
]

export const exactDateOfBirthUnknownConditional = [
  {
    action: 'hide',
    expression: '!values.exactDateOfBirthUnknown'
  }
]

export const isValidBirthDate = [
  {
    operation: 'isValidBirthDate'
  }
] satisfies Validator[]

export function getNationalIDValidators(configCase: string): Validator[] {
  if (configCase === 'father') {
    return [
      {
        operation: 'validIDNumber',
        parameters: ['NATIONAL_ID']
      },
      {
        operation: 'duplicateIDNumber',
        parameters: ['mother.iD']
      }
    ]
  } else if (configCase === 'mother') {
    return [
      {
        operation: 'validIDNumber',
        parameters: ['NATIONAL_ID']
      },
      {
        operation: 'duplicateIDNumber',
        parameters: ['father.iD']
      }
    ]
  } else if (configCase === 'deceased') {
    return [
      {
        operation: 'validIDNumber',
        parameters: ['NATIONAL_ID']
      },
      {
        operation: 'duplicateIDNumber',
        parameters: ['informant.informantID']
      }
    ]
  } else if (configCase === 'groom') {
    return [
      {
        operation: 'validIDNumber',
        parameters: ['NATIONAL_ID']
      },
      {
        operation: 'duplicateIDNumber',
        parameters: ['bride.iD']
      },
      {
        operation: 'duplicateIDNumber',
        parameters: ['informant.informantID']
      }
    ]
  } else if (configCase === 'bride') {
    return [
      {
        operation: 'validIDNumber',
        parameters: ['NATIONAL_ID']
      },
      {
        operation: 'duplicateIDNumber',
        parameters: ['groom.iD']
      },
      {
        operation: 'duplicateIDNumber',
        parameters: ['informant.informantID']
      }
    ]
  } else {
    // informant id
    return [
      {
        operation: 'validIDNumber',
        parameters: ['NATIONAL_ID']
      },
      {
        operation: 'duplicateIDNumber',
        parameters: ['deceased.deceasedID']
      },
      {
        operation: 'duplicateIDNumber',
        parameters: ['mother.iD']
      },
      {
        operation: 'duplicateIDNumber',
        parameters: ['father.iD']
      },
      {
        operation: 'duplicateIDNumber',
        parameters: ['groom.iD']
      },
      {
        operation: 'duplicateIDNumber',
        parameters: ['bride.iD']
      }
    ]
  }
}

export const hideIfNidIntegrationEnabled = [
  {
    action: 'hide',
    expression: `const nationalIdSystem =
          offlineCountryConfig &&
          offlineCountryConfig.systems.find(s => s.integratingSystemType === '${IntegratingSystemType.Mosip}');
          nationalIdSystem &&
          nationalIdSystem.settings.openIdProviderBaseUrl &&
          nationalIdSystem.settings.openIdProhideIfNidIntegrationDisabledviderClientId &&
          nationalIdSystem.settings.openIdProviderClaims;
      `
  }
]

export const informantBirthDateConditionals = [
  {
    action: 'disable',
    expression: 'values.exactDateOfBirthUnknown'
  },
  {
    action: 'disable',
    expression: `draftData?.informant?.fieldsModifiedByNidUserInfo?.includes('informantBirthDate')`
  }
]

export const informantFirstNameConditionals = [
  {
    action: 'disable',
    expression: `draftData?.informant?.fieldsModifiedByNidUserInfo?.includes('firstNamesEng')`
  }
]

export const informantFamilyNameConditionals = [
  {
    action: 'disable',
    expression: `draftData?.informant?.fieldsModifiedByNidUserInfo?.includes('familyNameEng')`
  }
]

export const FATHER_DETAILS_DONT_EXIST =
  '(draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist'
export const MOTHER_DETAILS_DONT_EXIST =
  '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'

// if mothers details do not exist on other page
export const mothersDetailsDontExistOnOtherPage =
  'draftData && draftData.mother && !draftData.mother.detailsExist'

// if fathers details do not exist
export const fathersDetailsDontExist = '!values.detailsExist'

// primary address same as other primary
export const primaryAddressSameAsOtherPrimaryAddress =
  'values.primaryAddressSameAsOtherPrimary'
