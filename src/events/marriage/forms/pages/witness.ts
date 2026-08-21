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
  ConditionalType,
  defineFormPage,
  FieldType,
  field,
  not,
  user,
  never
} from '@opencrvs/toolkit/events'
import { or } from '@opencrvs/toolkit/conditionals'
import { InformantType } from './informant'
import { emptyMessage } from '@countryconfig/events/utils'
import {
  farajalandNameConfig,
  invalidNameValidator
} from '@countryconfig/events/birth/validators'

export const requireFatherDetails = or(
  field('father.detailsNotAvailable').isFalsy(),
  field('informant.relation').isEqualTo(InformantType.GROOM)
)

export const witness = defineFormPage({
  id: 'witness',
  title: {
    defaultMessage: 'Witnesses details',
    description: 'Form section title for witnesses details',
    id: 'form.section.witness.title'
  },
  fields: [
    {
      id: 'witness1.detailsHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Witness 1 details',
        description: 'This is the label for the field',
        id: 'event.marriage.action.declare.form.section.witness1.field.addressHelper.label'
      },
      configuration: {
        styles: { fontVariant: 'h3' }
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        },
        {
          type: ConditionalType.SHOW,
          conditional: not(user.hasRole('HOSPITAL_CLERK'))
        }
      ]
    },
    {
      id: 'witness1.name',
      type: FieldType.NAME,
      required: true,
      configuration: farajalandNameConfig,
      hideLabel: true,
      label: {
        defaultMessage: "Witness 1's name",
        description: 'This is the label for the field',
        id: 'event.marriage.form.witness1.name.label'
      },
      validation: [invalidNameValidator('witness1.name')]
    },
    {
      id: 'witness1.relation',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Relationship to bride or groom',
        description: 'This is the label for the field',
        id: 'event.marriage.form.witness1.relation.label'
      }
    },
    {
      id: 'witness.divider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(user.hasRole('HOSPITAL_CLERK'))
        }
      ]
    },
    {
      id: 'witness2.detailsHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Witness 2 details',
        description: 'This is the label for the field',
        id: 'event.marriage.action.declare.form.section.witness2.field.addressHelper.label'
      },
      configuration: {
        styles: { fontVariant: 'h3' }
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        },
        {
          type: ConditionalType.SHOW,
          conditional: not(user.hasRole('HOSPITAL_CLERK'))
        }
      ]
    },
    {
      id: 'witness2.name',
      type: FieldType.NAME,
      required: true,
      configuration: farajalandNameConfig,
      hideLabel: true,
      label: {
        defaultMessage: "Witness 2's name",
        description: 'This is the label for the field',
        id: 'event.marriage.form.witness2.name.label'
      },
      validation: [invalidNameValidator('witness2.name')]
    },
    {
      id: 'witness2.relation',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Relationship to bride or groom',
        description: 'This is the label for the field',
        id: 'event.marriage.form.witness2.relation.label'
      }
    }
  ]
})
