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
  FieldType
} from '@opencrvs/toolkit/events'
import { IdType, idTypeOptions } from '@countryconfig/events/utils'

import { nationalIdValidator } from '../../validators'

const commonConfigs = {
  id: 'requester.type',
  type: FieldType.SELECT,
  required: true,
  label: {
    defaultMessage: 'Requester',
    description: 'This is the label for the field',
    id: 'event.marriage.action.correction.form.section.requester.label'
  }
}

const commonOptions = [
  {
    value: 'GROOM',
    label: {
      id: 'event.marriage.action.correction.form.requester.type.groom',
      defaultMessage: 'Groom',
      description: 'This is the label for the correction requester field'
    }
  },
  {
    value: 'BRIDE',
    label: {
      id: 'event.marriage.action.correction.form.requester.type.bride',
      defaultMessage: 'Bride',
      description: 'This is the label for the correction requester field'
    }
  },
  {
    value: 'SOMEONE_ELSE',
    label: {
      id: 'event.marriage.action.correction.form.requester.type.someoneElse',
      defaultMessage: 'Someone else',
      description: 'This is the label for the correction requester field'
    }
  }
]

export const correctionFormRequesters: FieldConfig[] = [
  {
    ...commonConfigs,
    options: commonOptions
  },
  {
    id: 'requester.idType',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Form of ID',
      description: 'This is the label for the field',
      id: 'event.marriage.action.correction.form.section.requester.idType.label'
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
      id: 'event.marriage.action.correction.form.section.requester.nid.label'
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
      id: 'event.marriage.action.correction.form.section.requester.passport.label'
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
      id: 'event.marriage.action.correction.form.section.requester.name.label',
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
      id: 'event.marriage.action.correction.form.section.requester.relationship.label',
      defaultMessage: 'Informant type',
      description: 'This is the label for the field'
    },
    placeholder: {
      defaultMessage: 'eg. Witness, Friend, Lawyer, etc.',
      description: 'This is the placeholder for the field',
      id: 'event.marriage.action.correction.form.section.requester.relationship.placeholder'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ]
  }
]
