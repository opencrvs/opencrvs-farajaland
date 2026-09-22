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
  defineFormPage,
  field,
  FieldType,
  not,
  or,
  PageTypes
} from '@opencrvs/toolkit/events'
import {
  farajalandNameConfig,
  MAX_NAME_LENGTH
} from '@countryconfig/events/birth/validators'
import { emptyMessage } from '@countryconfig/events/utils'

export const nameChangeDetails = defineFormPage({
  id: 'nameChangeDetails',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Name change details',
    description: 'Form section title for name change details',
    id: 'form.section.nameChangeDetails.title'
  },
  fields: [
    {
      id: 'nameChange.courtOrderNumber',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Court order reference no.',
        description: 'This is the label for the field',
        id: 'event.name-change.action.declare.form.section.nameChangeDetails.field.courtOrderNumber.label'
      }
    },
    {
      id: 'nameChange.filingDate',
      type: FieldType.DATE,
      required: true,
      label: {
        defaultMessage: 'Date of filing',
        description: 'This is the label for the field',
        id: 'event.name-change.action.declare.form.section.nameChangeDetails.field.filingDate.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid date',
            description: 'This is the error message for invalid date',
            id: 'event.name-change.action.declare.form.section.nameChangeDetails.field.filingDate.error'
          },
          validator: field('nameChange.filingDate').isBefore().now()
        }
      ]
    },
    {
      id: 'nameChange.courtName',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Name of court',
        description: 'This is the label for the field',
        id: 'event.name-change.action.declare.form.section.nameChangeDetails.field.courtName.label'
      }
    },
    {
      id: 'nameChange.judgeName',
      type: FieldType.NAME,
      required: true,
      configuration: farajalandNameConfig,
      label: {
        defaultMessage: "Court judge's name",
        description: 'This is the label for the field',
        id: 'event.name-change.action.declare.form.section.nameChangeDetails.field.judgeName.label'
      }
    },
    {
      id: 'nameChangeDetails.divider',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'nameChange.newName',
      type: FieldType.NAME,
      required: false,
      configuration: {
        name: {
          firstname: { required: false },
          surname: { required: false }
        },
        maxLength: MAX_NAME_LENGTH
      },
      label: {
        defaultMessage: 'New name',
        description: 'This is the label for the field',
        id: 'event.name-change.action.declare.form.section.nameChangeDetails.field.newName.label'
      },
      validation: [
        {
          message: {
            defaultMessage:
              'At least a new first name or new last name is required',
            description:
              'Error message when neither a new firstname nor a new surname is provided',
            id: 'event.name-change.action.declare.form.section.nameChangeDetails.field.newName.error'
          },
          validator: or(
            not(field('nameChange.newName').get('firstname').isFalsy()),
            not(field('nameChange.newName').get('surname').isFalsy())
          )
        }
      ]
    }
  ]
})
