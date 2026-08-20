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
  ActionType,
  and,
  ConditionalType,
  defineDeclarationForm,
  event,
  FieldType,
  not,
  or,
  user
} from '@opencrvs/toolkit/events'
import { marriageDetails } from './pages/marriageDetails'
import { informant } from './pages/informant'
import { bride } from './pages/bride'
import { groom } from './pages/groom'
import { documents } from './pages/documents'
import { witness } from './pages/witness'

export const MARRIAGE_DECLARATION_REVIEW = {
  title: {
    id: 'event.marriage.action.declare.form.review.title',
    defaultMessage:
      '{groom.name.firstname, select, __EMPTY__ {Marriage declaration} other {{bride.name.surname, select, __EMPTY__ {Marriage declaration for {bride.name.firstname}} other {Marriage declaration for {bride.name.firstname} {bride.name.surname}}}}}',
    description: 'Title of the form to show in review page'
  },
  fields: [
    {
      id: 'review.print',
      type: FieldType.ALPHA_PRINT_BUTTON,
      label: {
        defaultMessage: 'Print certificate in advance of registration',
        id: 'event.marriage.action.declare.form.review.print.label',
        description: 'Label for the print button in the review section'
      },
      configuration: {
        template: 'v2.marriage-certified-certificate',
        buttonLabel: {
          defaultMessage: 'Print certificate in advance of registration',
          description: "Print button's label",
          id: 'event.marriage.action.declare.form.review.print.label'
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            or(
              user.hasRole('LOCAL_REGISTRAR'),
              user.hasRole('PROVINCIAL_REGISTRAR'),
              user.hasRole('NATIONAL_REGISTRAR')
            ),
            not(event.hasAction(ActionType.DECLARE)),
            not(event.hasAction(ActionType.NOTIFY))
          )
        }
      ]
    },
    {
      type: FieldType.SIGNATURE,
      id: 'groom.signature',
      required: true,
      label: {
        defaultMessage: 'Signature of groom',
        id: 'event.marriage.action.declare.form.review.groom.signature.label',
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
      id: 'bride.signature',
      required: true,
      label: {
        defaultMessage: 'Signature of bride',
        id: 'event.marriage.action.declare.form.review.bride.signature.label',
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
      id: 'witness1.signature',
      required: true,
      label: {
        defaultMessage: 'Signature of witness 1',
        id: 'event.marriage.action.declare.form.review.witness1.signature.label',
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
      id: 'witness2.signature',
      required: true,
      label: {
        defaultMessage: 'Signature of witness 2',
        id: 'event.marriage.action.declare.form.review.witness2.signature.label',
        description: 'Label for the signature field in the review section'
      },
      signaturePromptLabel: {
        id: 'signature.upload.modal.title',
        defaultMessage: 'Draw signature',
        description: 'Title for the modal to draw signature'
      }
    }
  ]
}

export const MARRIAGE_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Marriage declaration form',
    id: 'event.marriage.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },

  pages: [informant, marriageDetails, bride, groom, witness, documents]
})
