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
  defineFormPage,
  DocumentMimeType,
  field,
  FieldType,
  ImageMimeType,
  not,
  or,
  PageTypes,
  TranslationConfig
} from '@opencrvs/toolkit/events'
import { createSelectOptions } from '@countryconfig/events/utils'
import { InformantType } from './informant'
import { SubjectIdType } from './subject'

const IdType = {
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT'
} as const

const idTypeMessageDescriptors = {
  NATIONAL_ID: {
    defaultMessage: 'National ID',
    description: 'Option for form field: Form of ID',
    id: 'form.field.label.iDTypeNationalID'
  },
  PASSPORT: {
    defaultMessage: 'Passport',
    description: 'Option for form field: Form of ID',
    id: 'form.field.label.iDTypePassport'
  }
} satisfies Record<keyof typeof IdType, TranslationConfig>

const idTypeOptions = createSelectOptions(IdType, idTypeMessageDescriptors)

const DEFAULT_FILE_CONFIGURATION = {
  maxFileSize: 5 * 1024 * 1024,
  acceptedFileTypes: [
    ImageMimeType.enum['image/jpeg'],
    ImageMimeType.enum['image/png'],
    ImageMimeType.enum['image/jpg'],
    DocumentMimeType.enum['application/pdf']
  ]
}

export const documents = defineFormPage({
  id: 'documents',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Supporting documents',
    description: 'Form section title for documents',
    id: 'form.section.documents.title'
  },
  fields: [
    {
      id: 'documents.courtOrder',
      type: FieldType.FILE,
      required: true,
      uncorrectable: true,
      configuration: {
        ...DEFAULT_FILE_CONFIGURATION,
        style: {
          width: 'full'
        },
        fileName: {
          defaultMessage: 'Court order',
          description: 'This is the label for the file name',
          id: 'form.field.label.courtOrder.fileName'
        }
      },
      label: {
        defaultMessage: 'Court order',
        description: 'This is the label for the field',
        id: 'event.name-change.action.declare.form.section.documents.field.courtOrder.label'
      }
    },
    {
      id: 'documents.proofOfInformantId',
      type: FieldType.FILE_WITH_OPTIONS,
      required: true,
      uncorrectable: true,
      label: {
        defaultMessage: "Proof of informant's ID",
        description: 'This is the label for the field',
        id: 'event.name-change.action.declare.form.section.documents.field.proofOfInformantId.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: or(
            and(
              field('informant.relation').isEqualTo(InformantType.SUBJECT),
              not(field('subject.idType').isEqualTo(SubjectIdType.NONE))
            ),
            and(
              field('informant.relation').isEqualTo(InformantType.PARENT),
              not(field('parent.verified').isEqualTo('authenticated')),
              not(field('parent.verified').isEqualTo('pending')),
              not(field('parent.idType').isEqualTo('NONE'))
            )
          )
        }
      ]
    }
  ]
})
