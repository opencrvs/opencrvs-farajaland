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
  FieldType,
  never,
  user,
  event,
  ActionType,
  not,
  and
} from '@opencrvs/toolkit/events'
import { child } from './pages/child'
import { informant } from './pages/informant'
import { mother } from './pages/mother'
import { father } from './pages/father'
import { documents } from './pages/documents'
import { introduction } from './pages/introduction'

export const NEW_BIRTH_DECLARATION_REVIEW = {
  title: {
    id: 'event.birth.action.declare.form.review.title',
    defaultMessage:
      '{child.name.firstname, select, __EMPTY__ {Birth declaration} other {{child.name.surname, select, __EMPTY__ {Birth declaration for {child.name.firstname}} other {Birth declaration for {child.name.firstname} {child.name.surname}}}}}',
    description: 'Title of the form to show in review page'
  },
  fields: [
    {
      type: FieldType.ALPHA_PRINT_BUTTON,
      id: 'review.print',
      label: {
        defaultMessage: 'Print declaration',
        description: 'Print',
        id: 'event.tennis-club-membership.action.declare.form.review.print.label'
      },
      configuration: {
        template: 'v2.birth-certified-certificate',
        buttonLabel: {
          defaultMessage: 'Print declaration summary',
          description: "Print button's label",
          id: 'event.tennis-club-membership.action.declare.form.review.print.button.label'
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            user.hasRole('LOCAL_REGISTRAR'),
            not(event.hasAction(ActionType.DECLARE)),
            not(event.hasAction(ActionType.NOTIFY))
          )
        }
      ]
    },
    {
      type: FieldType.SIGNATURE,
      id: 'review.signature',
      required: true,
      label: {
        defaultMessage: 'Signature of informant',
        id: 'event.birth.action.declare.form.review.signature.label',
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

export const NEW_BIRTH_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Birth decalration form',
    id: 'event.birth.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },
  pages: [introduction, informant, child, mother, father, documents]
})
