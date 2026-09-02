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
  and,
  ConditionalType,
  field,
  FieldConfig,
  FieldType,
  not
} from '@opencrvs/toolkit/events'
import { InformantType, InformantTypeKey } from '../pages/informant'
import {
  informantMessageDescriptors,
  IdType,
  idTypeOptions
} from '@countryconfig/events/utils'

import { nationalIdValidator } from '../../validators'

const commonConfigs = {
  id: 'requester.type',
  type: FieldType.SELECT,
  required: true,
  label: {
    defaultMessage: 'Requester',
    description: 'This is the label for the field',
    id: 'event.divorce.action.correction.form.section.requester.label'
  }
}

const commonOptions = [
  {
    value: 'HUSBAND',
    label: {
      id: 'event.divorce.action.correction.form.requester.type.groom',
      defaultMessage: 'Groom',
      description: 'This is the label for the correction requester field'
    }
  },
  {
    value: 'WIFE',
    label: {
      id: 'event.divorce.action.correction.form.requester.type.bride',
      defaultMessage: 'Bride',
      description: 'This is the label for the correction requester field'
    }
  },
  {
    value: 'SOMEONE_ELSE',
    label: {
      id: 'event.divorce.action.correction.form.requester.type.someoneElse',
      defaultMessage: 'Someone else',
      description: 'This is the label for the correction requester field'
    }
  }
]

const onlyMotherExist = (informantType: InformantTypeKey) => {
  return {
    type: ConditionalType.SHOW,
    conditional: and(
      field('informant.relation').isEqualTo(informantType),
      not(field('mother.name').isFalsy()),
      field('father.name').isFalsy()
    )
  }
}

const onlyFatherExist = (informantType: InformantTypeKey) => {
  return {
    type: ConditionalType.SHOW,
    conditional: and(
      field('informant.relation').isEqualTo(informantType),
      not(field('father.name').isFalsy()),
      field('mother.name').isFalsy()
    )
  }
}

const fatherMotherBothExist = (informantType: InformantTypeKey) => {
  return {
    type: ConditionalType.SHOW,
    conditional: and(
      field('informant.relation').isEqualTo(informantType),
      not(field('father.name').isFalsy()),
      not(field('mother.name').isFalsy())
    )
  }
}

const fatherMotherBothDoesNotExist = (informantType: InformantTypeKey) => {
  return {
    type: ConditionalType.SHOW,
    conditional: and(
      field('informant.relation').isEqualTo(informantType),
      field('father.name').isFalsy(),
      field('mother.name').isFalsy()
    )
  }
}

const getFieldConfigForInformant = (informantType: InformantTypeKey) => {
  return [
    {
      ...commonConfigs,
      conditionals: [onlyMotherExist(informantType)],
      options: [
        getInformantOption(informantType),
        motherOption,
        ...commonOptions
      ]
    },
    {
      ...commonConfigs,
      conditionals: [onlyFatherExist(informantType)],
      options: [
        getInformantOption(informantType),
        fatherOption,
        ...commonOptions
      ]
    },
    {
      ...commonConfigs,
      conditionals: [fatherMotherBothExist(informantType)],
      options: [
        getInformantOption(informantType),
        fatherOption,
        motherOption,
        ...commonOptions
      ]
    },
    {
      ...commonConfigs,
      conditionals: [fatherMotherBothDoesNotExist(informantType)],
      options: [getInformantOption(informantType), ...commonOptions]
    }
  ]
}

const getInformantOption = (informantType: InformantTypeKey) => {
  const defaultMessage =
    informantType === InformantType.HUSBAND
      ? `Informant ({informant.other.relation})`
      : `Informant (${informantMessageDescriptors[informantType].defaultMessage})`

  return {
    label: {
      id: `v2.event.divorce.action.correction.form.section.requester.informant.${informantType.toLowerCase()}.label`,
      defaultMessage,
      description: 'This is the label for the field'
    },
    value: 'INFORMANT'
  }
}

const fatherOption = {
  label: {
    id: 'event.divorce.action.correction.form.section.requester.father.label',
    defaultMessage: 'Father',
    description: 'This is the label for the field'
  },
  value: InformantType.HUSBAND
}

const motherOption = {
  label: {
    id: 'event.divorce.action.correction.form.section.requester.mother.label',
    defaultMessage: 'Mother',
    description: 'This is the label for the field'
  },
  value: InformantType.WIFE
}

export const correctionFormRequesters: FieldConfig[] = [
  {
    ...commonConfigs,
    conditionals: [onlyMotherExist(InformantType.WIFE)],
    options: [getInformantOption(InformantType.WIFE), ...commonOptions]
  },
  {
    ...commonConfigs,
    conditionals: [fatherMotherBothExist(InformantType.WIFE)],
    options: [
      getInformantOption(InformantType.WIFE),
      fatherOption,
      ...commonOptions
    ]
  },
  {
    ...commonConfigs,
    conditionals: [onlyFatherExist(InformantType.HUSBAND)],
    options: [getInformantOption(InformantType.HUSBAND), ...commonOptions]
  },
  {
    ...commonConfigs,
    conditionals: [fatherMotherBothExist(InformantType.HUSBAND)],
    options: [
      getInformantOption(InformantType.HUSBAND),
      motherOption,
      ...commonOptions
    ]
  },
  ...getFieldConfigForInformant(InformantType.WIFE),
  {
    id: 'requester.idType',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Form of ID',
      description: 'This is the label for the field',
      id: 'event.divorce.action.correction.form.section.requester.idType.label'
    },
    options: idTypeOptions,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ]
  },
  {
    id: 'requester.nid',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'ID Number',
      description: 'This is the label for the field',
      id: 'event.divorce.action.correction.form.section.requester.nid.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('requester.type').isEqualTo('SOMEONE_ELSE'),
          field('requester.idType').isEqualTo(IdType.NATIONAL_ID)
        )
      }
    ],
    validation: [nationalIdValidator('requester.nid')]
  },
  {
    id: 'requester.passport',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'ID Number',
      description: 'This is the label for the field',
      id: 'event.divorce.action.correction.form.section.requester.passport.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('requester.type').isEqualTo('SOMEONE_ELSE'),
          field('requester.idType').isEqualTo(IdType.PASSPORT)
        )
      }
    ],
    parent: field('informant.relation')
  },
  {
    id: 'requester.name',
    type: FieldType.NAME,
    required: true,
    hideLabel: true,
    label: {
      id: 'event.divorce.action.correction.form.section.requester.name.label',
      defaultMessage: 'Name',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ]
  },
  {
    id: 'requester.relationship',
    type: 'TEXT',
    required: true,
    label: {
      id: 'event.divorce.action.correction.form.section.requester.relationship.label',
      defaultMessage: 'Informant type',
      description: 'This is the label for the field'
    },
    placeholder: {
      defaultMessage: 'eg. Grandmother',
      description: 'This is the placeholder for the field',
      id: 'event.divorce.action.correction.form.section.requester.relationship.placeholder'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ]
  }
]
