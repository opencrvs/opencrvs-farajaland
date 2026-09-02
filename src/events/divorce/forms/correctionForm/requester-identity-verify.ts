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
  not,
  or
} from '@opencrvs/toolkit/events'
import { InformantType } from '../pages/informant'

export const correctionRequesterIdentityVerify: FieldConfig[] = [
  {
    id: 'requester.identity.verify.data',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('CHILD')
      }
    ],
    label: {
      defaultMessage: '',
      description: 'Title for the data section',
      id: 'event.marriage.action.correction.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [{ fieldId: 'husband.name' }, { fieldId: 'husband.dob' }]
    }
  },
  {
    id: 'requester.identity.verify.data',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: or(
          field('requester.type').isEqualTo('WIFE'),
          and(
            field('requester.type').isEqualTo('INFORMANT'),
            field('informant.relation').isEqualTo(InformantType.WIFE)
          )
        )
      }
    ],
    label: {
      defaultMessage: '',
      description: 'Title for the data section',
      id: 'event.marriage.action.correction.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'wife.idType' },
        { fieldId: 'wife.nid' },
        { fieldId: 'wife.passport' },
        { fieldId: 'wife.name' },
        { fieldId: 'wife.dob' },
        { fieldId: 'wife.nationality' }
      ]
    }
  },
  {
    id: 'requester.identity.verify.data',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: or(
          field('requester.type').isEqualTo('HUSBAND'),
          and(
            field('requester.type').isEqualTo('INFORMANT'),
            field('informant.relation').isEqualTo(InformantType.HUSBAND)
          )
        )
      }
    ],
    label: {
      defaultMessage: '',
      description: 'Title for the data section',
      id: 'event.marriage.action.correction.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'husband.idType' },
        { fieldId: 'husband.nid' },
        { fieldId: 'husband.passport' },
        { fieldId: 'husband.name' },
        { fieldId: 'husband.dob' },
        { fieldId: 'husband.nationality' }
      ]
    }
  },
  {
    id: 'requester.identity.verify.data',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('requester.type').isEqualTo('INFORMANT'),
          not(field('informant.relation').isEqualTo(InformantType.HUSBAND)),
          not(field('informant.relation').isEqualTo(InformantType.WIFE))
        )
      }
    ],
    label: {
      defaultMessage: '',
      description: 'Title for the data section',
      id: 'event.marriage.action.correction.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'informant.idType' },
        { fieldId: 'informant.nid' },
        { fieldId: 'informant.passport' },
        { fieldId: 'informant.name' },
        { fieldId: 'informant.dob' },
        { fieldId: 'informant.other.relation' },
        { fieldId: 'informant.nationality' }
      ]
    }
  }
]
