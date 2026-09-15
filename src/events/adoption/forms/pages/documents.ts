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

import { createSelectOptions } from '@countryconfig/events/utils'
import {
  and,
  ConditionalType,
  defineFormPage,
  DocumentMimeType,
  field,
  FieldType,
  ImageMimeType,
  not,
  PageTypes,
  TranslationConfig
} from '@opencrvs/toolkit/events'
import { NumberOfAdoptiveParents } from './informant'

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

const DEFAULT_FILE_CONFIGURATION = {
  maxFileSize: 5 * 1024 * 1024,
  acceptedFileTypes: [
    ImageMimeType.enum['image/jpeg'],
    ImageMimeType.enum['image/png'],
    ImageMimeType.enum['image/jpg'],
    DocumentMimeType.enum['application/pdf']
  ]
}

const idTypeOptions = createSelectOptions(IdType, idTypeMessageDescriptors)

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
        id: 'event.adoption.action.declare.form.section.documents.field.courtOrder.label'
      }
    },
    {
      id: 'documents.proofOfAdoptiveParent1',
      type: FieldType.FILE_WITH_OPTIONS,
      required: true,
      uncorrectable: true,
      label: {
        defaultMessage: "Proof of adoptive parent's ID",
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.documents.field.proofOfAdoptiveParent1.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('adoptiveParent1.verified').isEqualTo('authenticated')),
            not(field('adoptiveParent1.verified').isEqualTo('pending')),
            not(field('adoptiveParent1.idType').isEqualTo('NONE'))
          )
        }
      ]
    },
    {
      id: 'documents.proofOfAdoptiveParent2',
      type: FieldType.FILE_WITH_OPTIONS,
      required: true,
      uncorrectable: true,
      label: {
        defaultMessage: "Proof of adoptive parent 2's ID",
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.documents.field.proofOfAdoptiveParent2.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('adoption.numberOfAdoptiveParents').isEqualTo(
              NumberOfAdoptiveParents.TWO
            ),
            not(field('adoptiveParent2.verified').isEqualTo('authenticated')),
            not(field('adoptiveParent2.verified').isEqualTo('pending')),
            not(field('adoptiveParent2.idType').isEqualTo('NONE'))
          )
        }
      ]
    }
  ]
})
