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
  TranslationConfig,
  user
} from '@opencrvs/toolkit/events'

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
  conditional: not(user.hasRole('HOSPITAL_CLERK')),
  fields: [
    {
      id: 'documents.intentionToMarry',
      type: FieldType.FILE,
      required: false,
      uncorrectable: true,
      configuration: {
        ...DEFAULT_FILE_CONFIGURATION,
        style: {
          width: 'full'
        },
        fileName: {
          defaultMessage: 'Intention to marry',
          description: 'This is the label for the file name',
          id: 'form.field.label.intentionToMarry.fileName'
        }
      },
      label: {
        defaultMessage: 'Intention to marry',
        description: 'This is the label for the field',
        id: 'event.marriage.action.declare.form.section.documents.field.intentionToMarry.label'
      }
    },
    {
      id: 'documents.proofOfBride',
      type: FieldType.FILE_WITH_OPTIONS,
      required: true,
      uncorrectable: true,
      label: {
        defaultMessage: "Proof of bride's ID",
        description: 'This is the label for the field',
        id: 'event.marriage.action.declare.form.section.documents.field.proofOfBride.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('bride.verified').isEqualTo('authenticated')),
            not(field('bride.idType').isEqualTo('NONE'))
          )
        }
      ]
    },
    {
      id: 'documents.proofOfGroom',
      type: FieldType.FILE_WITH_OPTIONS,
      required: true,
      uncorrectable: true,
      label: {
        defaultMessage: "Proof of groom's ID",
        description: 'This is the label for the field',
        id: 'event.marriage.action.declare.form.section.documents.field.proofOfGroom.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('groom.verified').isEqualTo('authenticated')),
            not(field('groom.idType').isEqualTo('NONE'))
          )
        }
      ]
    }
  ]
})
