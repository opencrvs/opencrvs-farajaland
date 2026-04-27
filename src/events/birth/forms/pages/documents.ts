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
  or,
  PageTypes,
  TranslationConfig,
  user
} from '@opencrvs/toolkit/events'
import { requireMotherDetails } from './mother'
import { requireFatherDetails } from './father'
import { InformantType } from './informant'

const IdType = {
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
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

const Other = {
  PROOF_OF_LEGAL_GUARDIANSHIP: 'PROOF_OF_LEGAL_GUARDIANSHIP',
  PROOF_OF_ASSIGNED_RESPONSIBILITY: 'PROOF_OF_ASSIGNED_RESPONSIBILITY'
} as const

const otherMessageDescriptors = {
  PROOF_OF_LEGAL_GUARDIANSHIP: {
    defaultMessage: 'Proof of legal guardianship',
    description: 'Label for document option Proof of legal guardianship',
    id: 'form.field.label.legalGuardianProof'
  },
  PROOF_OF_ASSIGNED_RESPONSIBILITY: {
    defaultMessage: 'Proof of assigned responsibility',
    description: 'Label for docuemnt option Proof of assigned responsibility',
    id: 'form.field.label.assignedResponsibilityProof'
  }
} satisfies Record<keyof typeof Other, TranslationConfig>

const otherOptions = createSelectOptions(Other, otherMessageDescriptors)

export const documents = defineFormPage({
  id: 'documents',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Upload supporting documents',
    description: 'Form section title for documents',
    id: 'form.section.documents.title'
  },
  conditional: not(user.hasRole('HOSPITAL_CLERK')),
  fields: [
    {
      id: 'documents.proofOfBirth',
      type: FieldType.FILE,
      required: false,
      uncorrectable: true,
      configuration: {
        ...DEFAULT_FILE_CONFIGURATION,
        style: {
          width: 'full'
        },
        fileName: {
          defaultMessage: 'Proof of birth',
          description: 'This is the label for the file name',
          id: 'form.field.label.proofOfBirth.fileName'
        }
      },
      label: {
        defaultMessage: 'Proof of birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.documents.field.proofOfBirth.label'
      }
    },
    {
      id: 'documents.proofOfMother',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: "Proof of mother's ID",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.documents.field.proofOfMother.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireMotherDetails,
            not(field('mother.verified').isEqualTo('authenticated')),
            not(field('mother.verified').isEqualTo('pending')),
            not(field('mother.idType').isEqualTo('NONE'))
          )
        }
      ]
    },

    {
      id: 'documents.proofOfFather',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: "Proof of father's ID",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.documents.field.proofOfFather.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireFatherDetails,
            not(field('father.verified').isEqualTo('authenticated')),
            not(field('father.verified').isEqualTo('pending')),
            not(field('father.idType').isEqualTo('NONE'))
          )
        }
      ]
    },
    {
      id: 'documents.proofOfInformant',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: "Proof of informant's ID",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.documents.field.proofOfInformant.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            or(
              field('informant.relation').isEqualTo(InformantType.MOTHER),
              field('informant.relation').isEqualTo(InformantType.FATHER),
              field('informant.verified').isEqualTo('authenticated'),
              field('informant.verified').isEqualTo('pending'),
              field('informant.idType').isEqualTo('NONE')
            )
          )
        }
      ]
    },
    {
      id: 'documents.proofOfAssignResponsibility',
      type: FieldType.FILE,
      required: false,
      uncorrectable: true,
      configuration: {
        ...DEFAULT_FILE_CONFIGURATION,
        style: {
          width: 'full'
        },
        fileName: {
          defaultMessage: 'Proof of assigned responsibility',
          description: 'This is the label for the file name',
          id: 'form.field.label.proofOfAssignResponsibility.fileName'
        }
      },
      label: {
        defaultMessage: 'Proof of assigned responsibility',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.documents.field.proofOfAssignResponsibility.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('informant.relation').isEqualTo(InformantType.LEGAL_GUARDIAN)
        }
      ]
    },
    {
      id: 'documents.acquiredChildCourtDocument',
      type: FieldType.FILE,
      required: false,
      uncorrectable: true,
      configuration: {
        ...DEFAULT_FILE_CONFIGURATION,
        style: {
          width: 'full'
        },
        fileName: {
          defaultMessage: 'Acquired child court document',
          description: 'This is the label for the file name',
          id: 'form.field.label.acquiredChildCourtDocument.fileName'
        }
      },
      label: {
        defaultMessage: 'Acquired child court document',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.documents.field.acquiredChildCourtDocument.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('informant.relation').isEqualTo(InformantType.LEGAL_GUARDIAN)
        }
      ]
    },
  ]
})
