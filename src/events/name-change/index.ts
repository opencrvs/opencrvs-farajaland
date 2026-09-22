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
  defineConfig,
  field,
  flag,
  InherentFlags,
  not,
  or,
  status,
  user
} from '@opencrvs/toolkit/events'
import { Event } from '@countryconfig/events/utils'
import {
  NAME_CHANGE_DECLARATION_FORM,
  NAME_CHANGE_DECLARATION_REVIEW
} from './forms/declaration'
import { advancedSearchNameChange } from './advancedSearch'

export const nameChangeEvent = defineConfig({
  id: Event.NameChange,
  declaration: NAME_CHANGE_DECLARATION_FORM,
  label: {
    defaultMessage: 'Name Change',
    description: 'This is what this event is referred as in the system',
    id: 'event.nameChange.label'
  },
  dateOfEvent: field('nameChange.filingDate'),
  placeOfEvent: field('nameChange.courtName'),
  title: {
    defaultMessage:
      '{nameChange.newName.firstname} {nameChange.newName.surname}',
    description: 'This is the title of the summary',
    id: 'event.nameChange.title'
  },
  fallbackTitle: {
    id: 'event.nameChange.fallbackTitle',
    defaultMessage: 'No name provided',
    description:
      'This is a fallback title if actual title resolves to empty string'
  },
  flags: [
    {
      id: 'validated',
      label: {
        id: 'event.nameChange.flag.validated',
        defaultMessage: 'Validated',
        description: 'Flag label for validated'
      },
      requiresAction: true
    },
    {
      id: 'pending-first-certificate-issuance',
      label: {
        id: 'event.nameChange.flag.pending-first-certificate-issuance',
        defaultMessage: 'Pending first certificate issuance',
        description: 'Flag label for first certificate issuance'
      },
      requiresAction: true
    }
  ],
  summary: {
    fields: [
      {
        fieldId: 'nameChange.filingDate',
        emptyValueMessage: {
          defaultMessage: 'Filling date',
          description: 'This is shown when there is no adoptee information',
          id: 'event.nameChange.summary.nameChange.filingDate.empty'
        }
      },
      // Render the 'fallback value' when selection has not been made.
      // This hides the default values of the field when no selection has been made. (e.g. when address is prefilled with user's details, we don't want to show the address before selecting the option)
      {
        fieldId: 'nameChange.courtName',
        emptyValueMessage: {
          defaultMessage: 'Court name',
          description: 'This is shown when there is no adoptee information',
          id: 'event.nameChange.summary.nameChange.courtName.empty'
        },
        label: {
          defaultMessage: 'Court name',
          description: 'Label for court name',
          id: 'event.nameChange.summary.nameChange.courtName.label'
        }
      },
      {
        id: 'informant.contact',
        emptyValueMessage: {
          defaultMessage: 'No contact details provided',
          description: 'This is shown when there is no informant information',
          id: 'event.nameChange.summary.informant.contact.empty'
        },
        label: {
          defaultMessage: 'Contact',
          description: 'This is the label for the informant information',
          id: 'event.nameChange.summary.informant.contact.label'
        },
        value: {
          defaultMessage: '{informant.phoneNo} {informant.email}',
          description: 'This is the contact value of the informant',
          id: 'event.nameChange.summary.informant.contact.value'
        }
      }
    ]
  },
  actionOrder: [
    ActionType.ASSIGN,
    ActionType.DECLARE,
    ActionType.REGISTER,
    ActionType.EDIT,
    'VALIDATE_DECLARATION',
    ActionType.MARK_AS_DUPLICATE,
    ActionType.REJECT,
    ActionType.ARCHIVE,
    ActionType.DELETE,
    ActionType.PRINT_CERTIFICATE,
    ActionType.REQUEST_CORRECTION,
    ActionType.UNASSIGN
  ],
  actions: [
    {
      type: ActionType.READ,
      label: {
        defaultMessage: 'Read',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.nameChange.action.Read.label'
      },
      review: NAME_CHANGE_DECLARATION_REVIEW
    },
    {
      type: ActionType.DECLARE,
      label: {
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.nameChange.action.declare.label'
      },
      review: NAME_CHANGE_DECLARATION_REVIEW,
      flags: [
        {
          id: 'validated',
          operation: 'add',
          conditional: or(
            user.hasRole('REGISTRATION_AGENT'),
            user.hasRole('LOCAL_REGISTRAR')
          )
        }
      ],
      dialogCopy: {
        notify: {
          id: 'event.nameChange.action.declare.notify.copy',
          defaultMessage:
            'You are about to formally notify the relevant Registration Office that a new adoption event has occurred. Please confirm that the information provided is accurate before proceeding.',
          description: 'Confirmation text for the notify action'
        },
        declare: {
          id: 'event.nameChange.action.declare.declare.copy',
          defaultMessage:
            'You are about to formally declare this adoption event. Once declared, the record will enter the verification and approval process.',
          description: 'Confirmation text for the declare action'
        },
        register: {
          id: 'event.nameChange.action.declare.register.copy',
          defaultMessage:
            '<strong>WARNING!</strong>: By clicking "Register", you confirm that you have reviewed the record alongside supporting documentation in the Record tab. The record will proceed to be <strong>legally registered</strong> via the outbox. Further amends after registration can only be made via a legal correction process.',
          description: 'Confirmation text for the register action'
        }
      }
    },
    {
      type: ActionType.REGISTER,
      label: {
        defaultMessage: 'Register',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.nameChange.action.register.label'
      },
      supportingCopy: {
        id: 'event.nameChange.action.register.supportingCopy',
        description: 'Confirmation text for the register action',
        defaultMessage:
          "Registering this adoption event will create an official civil registration record. Please ensure all details are correct before proceeding.<br></br><br></br><strong>WARNING!</strong>: By clicking 'Register', you confirm that you have reviewed the record alongside supporting documentation in the Record tab. The record will proceed to be <strong>legally registered</strong> via the outbox. Further amends after registration can only be made via a legal correction process."
      },
      flags: [
        { id: 'validated', operation: 'remove' },
        { id: 'pending-first-certificate-issuance', operation: 'add' }
      ],
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: flag('validated')
        }
      ]
    },
    {
      type: ActionType.EDIT,
      label: {
        defaultMessage: 'Edit',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'actions.edit'
      },
      flags: [{ id: 'validated', operation: 'remove' }],
      dialogCopy: {
        notify: {
          id: 'event.nameChange.action.edit.notify.copy',
          defaultMessage:
            'Are you sure you want to notify this event with these edits?',
          description: 'Confirmation text for the notify with edits action'
        },
        declare: {
          id: 'event.nameChange.action.edit.declare.copy',
          defaultMessage:
            'Are you sure you want to edit this declaration? By confirming you are redeclaring this event and override past changes.',
          description: 'Confirmation text for the declare with edits action'
        },
        register: {
          id: 'event.nameChange.action.edit.register.copy',
          defaultMessage:
            'You are about to register this adoption event with your edits. Please ensure all details are correct before proceeding.<br></br><br></br><strong>WARNING!</strong>: By continuing, you confirm that you have reviewed the record alongside supporting documentation. The record will proceed to be <strong>legally registered</strong> via the outbox. Further amends after registration can only be made via a legal correction process.',
          description: 'Confirmation text for the register with edits action'
        }
      }
    },
    {
      type: ActionType.CUSTOM,
      customActionType: 'VALIDATE_DECLARATION',
      icon: 'Stamp',
      label: {
        defaultMessage: 'Validate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.nameChange.custom.action.validate-declaration.label'
      },
      supportingCopy: {
        defaultMessage:
          'Validating this declaration confirms it meets all requirements and is eligible for registration.',
        description:
          'This is the supporting copy for the Validate declaration -action',
        id: 'event.nameChange.custom.action.validate-declaration.supportingCopy'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(status('DECLARED'), not(flag('validated')))
        },
        {
          type: ConditionalType.ENABLE,
          conditional: not(flag(InherentFlags.POTENTIAL_DUPLICATE))
        }
      ],
      flags: [
        { id: 'validated', operation: 'add' },
        { id: InherentFlags.REJECTED, operation: 'remove' }
      ],
      form: [
        {
          id: 'comments',
          type: 'TEXTAREA',
          label: {
            defaultMessage: 'Comments',
            description:
              'This is the label for the comments field for the validate declaration action',
            id: 'event.nameChange.custom.action.validate-declaration.field.comments.label'
          }
        }
      ],
      auditHistoryLabel: {
        defaultMessage: 'Validated',
        description:
          'The label to show in audit history for the validate action',
        id: 'event.nameChange.custom.action.validate-declaration.audit-history-label'
      }
    },
    {
      type: ActionType.REJECT,
      label: {
        defaultMessage: 'Reject',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.nameChange.action.reject.label'
      },
      supportingCopy: {
        id: 'rejectModal.description',
        defaultMessage:
          'Rejecting this declaration will return it to the submitter for updates. Please ensure a valid reason for rejection has been recorded.',
        description: 'The description for reject modal'
      },
      flags: [{ id: 'validated', operation: 'remove' }]
    },
    {
      type: ActionType.ARCHIVE,
      label: {
        defaultMessage: 'Archive',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.nameChange.action.archive.label'
      },
      supportingCopy: {
        id: 'recordAudit.archive.confirmation.body',
        defaultMessage:
          'Archiving will remove this declaration from active processing while retaining it for record purposes. Archived declarations cannot be modified unless reinstated.',
        description: 'Confirmation body for archiving a declaration'
      }
    }
  ],
  advancedSearch: advancedSearchNameChange
})
