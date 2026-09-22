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
import { informant, NumberOfAdoptiveParents } from './pages/informant'
import { adoptionDetails } from './pages/adoptionDetails'
import { adoptiveParent1 } from './pages/adoptiveParent1'
import { adoptiveParent2 } from './pages/adoptiveParent2'
import { documents } from './pages/documents'

export const ADOPTION_DECLARATION_REVIEW = {
  title: {
    id: 'event.adoption.action.declare.form.review.title',
    defaultMessage:
      '{adoptee.name.firstname, select, __EMPTY__ {Adoption declaration} other {{adoptee.name.surname, select, __EMPTY__ {Adoption declaration for {adoptee.name.firstname}} other {Adoption declaration for {adoptee.name.firstname} {adoptee.name.surname}}}}}',
    description: 'Title of the form to show in review page'
  },
  fields: [
    {
      type: FieldType.SIGNATURE,
      id: 'adoptiveParent1Signature',
      required: true,
      label: {
        defaultMessage: 'Signature of adoptive parent',
        id: 'event.adoption.action.declare.form.review.adoptiveParent1.signature.label',
        description: 'Label for the signature field in the review section'
      },
      signaturePromptLabel: {
        id: 'signature.upload.modal.title',
        defaultMessage: 'Draw signature',
        description: 'Title for the modal to draw signature'
      }
    },
    {
      type: FieldType.SIGNATURE,
      id: 'adoptiveParent2Signature',
      required: true,
      label: {
        defaultMessage: 'Signature of adoptive parent 2',
        id: 'event.adoption.action.declare.form.review.adoptiveParent2.signature.label',
        description: 'Label for the signature field in the review section'
      },
      signaturePromptLabel: {
        id: 'signature.upload.modal.title',
        defaultMessage: 'Draw signature',
        description: 'Title for the modal to draw signature'
      }
      //, TODO:FIXME: even after aligning with 2.1 the conditional calculation is not working for annotation fields
      // conditionals: [
      //   {
      //     type: ConditionalType.SHOW,
      //     conditional: field('adoption.numberOfAdoptiveParents').isEqualTo(
      //       NumberOfAdoptiveParents.TWO
      //     )
      //   }
      // ]
    }
  ]
}

export const ADOPTION_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Adoption declaration form',
    id: 'event.adoption.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },

  pages: [
    informant,
    adoptionDetails,
    adoptiveParent1,
    adoptiveParent2,
    documents
  ]
})
