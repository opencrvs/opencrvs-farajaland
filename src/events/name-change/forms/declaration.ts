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
  defineDeclarationForm,
  field,
  FieldType
} from '@opencrvs/toolkit/events'
import { informant, InformantType } from './pages/informant'
import { subject } from './pages/subject'
import { nameChangeDetails } from './pages/nameChangeDetails'
import { parent } from './pages/parent'
import { documents } from './pages/documents'

export const NAME_CHANGE_DECLARATION_REVIEW = {
  title: {
    id: 'event.name-change.action.declare.form.review.title',
    defaultMessage:
      '{subject.nameAtBirth.firstname, select, __EMPTY__ {Name change declaration} other {{subject.nameAtBirth.surname, select, __EMPTY__ {Name change declaration for {subject.nameAtBirth.firstname}} other {Name change declaration for {subject.nameAtBirth.firstname} {subject.nameAtBirth.surname}}}}}',
    description: 'Title of the form to show in review page'
  },
  fields: [
    {
      type: FieldType.SIGNATURE,
      id: 'subjectSignature',
      required: true,
      label: {
        defaultMessage: 'Signature of event subject',
        id: 'event.name-change.action.declare.form.review.subject.signature.label',
        description: 'Label for the signature field in the review section'
      },
      signaturePromptLabel: {
        id: 'signature.upload.modal.title',
        defaultMessage: 'Draw signature',
        description: 'Title for the modal to draw signature'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('informant.relation').isEqualTo(
            InformantType.SUBJECT
          )
        }
      ]
    },
    {
      type: FieldType.SIGNATURE,
      id: 'parentSignature',
      required: true,
      label: {
        defaultMessage: 'Signature of parent',
        id: 'event.name-change.action.declare.form.review.parent.signature.label',
        description: 'Label for the signature field in the review section'
      },
      signaturePromptLabel: {
        id: 'signature.upload.modal.title',
        defaultMessage: 'Draw signature',
        description: 'Title for the modal to draw signature'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('informant.relation').isEqualTo(
            InformantType.PARENT
          )
        }
      ]
    }
  ]
}

export const NAME_CHANGE_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Name change declaration form',
    id: 'event.name-change.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },

  pages: [informant, subject, nameChangeDetails, parent, documents]
})
