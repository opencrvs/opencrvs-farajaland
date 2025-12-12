import {
  ActionConfig,
  ActionType,
  ConditionalType,
  FieldType,
  field,
  flag,
  not,
  window
} from '@opencrvs/toolkit/events'
import { CREDENTIAL_OFFER_HANDLER_URL } from './credential-offer-handler'

export const issueBirthCredentialAction = {
  type: ActionType.CUSTOM,
  customActionType: 'IssueVC',
  label: {
    defaultMessage: 'Issue VC',
    description: '',
    id: 'event.birth.action.issue-vc.label'
  },
  flags: [
    // @TODO: This is added in issuer service to record
    // {
    //   id: 'vc-issued',
    //   operation: 'add'
    // }
  ],
  conditionals: [
    {
      type: ConditionalType.ENABLE,
      conditional: not(flag('vc-issued'))
    }
  ],
  form: [
    {
      id: 'requester',
      type: FieldType.SELECT,
      // @TODO: import this from birth form?
      options: [
        {
          value: 'mother',
          label: {
            defaultMessage: 'Mother',
            description: '@TODO',
            id: 'event.birth.custom.action.issue-vc.field.requester.option.mother'
          }
        },
        {
          value: 'father',
          label: {
            defaultMessage: 'Father',
            description: '@TODO',
            id: 'event.birth.custom.action.issue-vc.field.requester.option.father'
          }
        }
      ],
      label: {
        defaultMessage: 'Requester',
        description: 'Select who is requesting the VC',
        id: 'event.birth.custom.action.issue-vc.field.requester.label'
      }
    },
    {
      id: 'request-credential-offer-button',
      type: FieldType.BUTTON,
      label: {
        defaultMessage: 'Request Credential Offer',
        description: 'Button to request the credential offer from issuer',
        id: 'event.birth.custom.action.issue-vc.field.request-credential-offer-button.label'
      },
      configuration: {
        text: {
          defaultMessage: 'Request Credential Offer',
          description: 'Button to request the credential offer from issuer',
          id: 'event.birth.custom.action.issue-vc.field.request-credential-offer-button.configuration.text'
        }
      }
    },
    {
      parent: field('request-credential-offer-button'),
      id: 'get-credential-offer',
      type: FieldType.HTTP,
      label: {
        defaultMessage: 'Get Credential Offer',
        description: 'HTTP request to get the credential offer from the issuer',
        id: 'event.birth.custom.action.issue-vc.field.get-credential-offer.label'
      },
      configuration: {
        trigger: field('request-credential-offer-button'),
        url: CREDENTIAL_OFFER_HANDLER_URL,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: { pathname: window().location.get('pathname') },
        timeout: 10000
      }
    },
    {
      parent: field('get-credential-offer'),
      id: 'qr-code',
      type: FieldType.IMAGE,
      label: {
        defaultMessage: 'QR Code',
        description: 'Upload the QR code image for the VC',
        id: 'event.birth.custom.action.issue-vc.field.qr-code.label'
      },
      configuration: {
        alt: {
          defaultMessage: 'QR Code',
          description: 'Upload the QR code image for the VC',
          id: 'event.birth.custom.action.issue-vc.field.qr-code.configuration.alt'
        }
      },
      value: field('get-credential-offer').get('data.credential_offer_uri_qr')
    }
  ]
} satisfies ActionConfig
