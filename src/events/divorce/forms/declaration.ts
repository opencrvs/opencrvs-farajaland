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
import { documents } from './pages/documents'
import { divorceDetails } from './pages/divorceDetails'

export const DIVORCE_DECLARATION_REVIEW = {
  title: {
    id: 'event.divorce.action.declare.form.review.title',
    defaultMessage:
      '{husband.name.firstname, select, __EMPTY__ {Divorce declaration} other {{husband.name.firstname, select, __EMPTY__ {Divorce declaration for {husband.name.surname}} other {Divorce declaration for {husband.name.firstname} {husband.name.surname} and {wife.name.firstname} {wife.name.surname}}}}}',
    description: 'Title of the form to show in review page'
  },
  fields: [
    {
      id: 'review.print',
      type: FieldType.ALPHA_PRINT_BUTTON,
      label: {
        defaultMessage: 'Print certificate in advance of registration',
        id: 'event.divorce.action.declare.form.review.print.label',
        description: 'Label for the print button in the review section'
      },
      configuration: {
        template: 'v2.divorce-certified-certificate',
        buttonLabel: {
          defaultMessage: 'Print certificate in advance of registration',
          description: "Print button's label",
          id: 'event.divorce.action.declare.form.review.print.label'
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
      id: 'husbandSignature',
      required: false,
      label: {
        defaultMessage: 'Signature of husband',
        id: 'event.divorce.action.declare.form.review.husband.signature.label',
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
      id: 'wifeSignature',
      required: false,
      label: {
        defaultMessage: 'Signature of wife',
        id: 'event.divorce.action.declare.form.review.wife.signature.label',
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

export const DIVORCE_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Divorce declaration form',
    id: 'event.divorce.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },

  pages: [informant, marriageDetails, divorceDetails, documents]
})
