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

export const printCertificateCollectorIdentityVerify: FieldConfig[] = [
  {
    id: 'collector.identity.verify.data.bride',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: or(
          field('collector.requesterId').isEqualTo(InformantType.WIFE),
          and(
            field('collector.requesterId').isEqualTo('INFORMANT'),
            field('informant.relation').isEqualTo(InformantType.WIFE)
          )
        )
      }
    ],
    label: {
      defaultMessage: 'Identity details',
      description: 'Title for the data section',
      id: 'event.divorce.action.certificate.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [{ fieldId: 'wife.name' }]
    }
  },
  {
    id: 'collector.identity.verify.data.groom',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: or(
          field('collector.requesterId').isEqualTo(InformantType.HUSBAND),
          and(
            field('collector.requesterId').isEqualTo('INFORMANT'),
            field('informant.relation').isEqualTo(InformantType.HUSBAND)
          )
        )
      }
    ],
    label: {
      defaultMessage: 'Identity details',
      description: 'Title for the data section',
      id: 'event.divorce.action.certificate.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [{ fieldId: 'husband.name' }]
    }
  },
  {
    id: 'collector.identity.verify.data.other',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('collector.requesterId').isEqualTo('INFORMANT'),
          not(field('informant.relation').isEqualTo(InformantType.HUSBAND)),
          not(field('informant.relation').isEqualTo(InformantType.WIFE))
        )
      }
    ],
    label: {
      defaultMessage: 'Identity details',
      description: 'Title for the data section',
      id: 'event.divorce.action.certificate.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'collector.OTHER.idType' },
        { fieldId: 'collector.PASSPORT.details' },
        { fieldId: 'collector.nid' },
        { fieldId: 'collector.DRIVING-LICENCE.details' },
        { fieldId: 'collector.brn' },
        { fieldId: 'collector.REFUGEE-NUMBER.details' },
        { fieldId: 'collector.ALIEN-NUMBER.details' },
        { fieldId: 'collector.OTHER.name' },
        { fieldId: 'informant.dob' },
        { fieldId: 'informant.nationality' },
        { fieldId: 'collector.OTHER.relationshipToBrideOrGroom' }
      ]
    }
  }
]
