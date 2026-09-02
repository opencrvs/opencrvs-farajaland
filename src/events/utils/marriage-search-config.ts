import { defineConditional, FieldType } from '@opencrvs/toolkit/events'

export const mrnSearchConfig = {
  type: FieldType.SEARCH,
  label: {
    defaultMessage: 'Search for marriage record',
    description: 'Label for marriage registration number search field',
    id: 'form.field.label.marriageRegistrationNumberSearch'
  },
  helperText: {
    defaultMessage:
      'You can search marriage registration numbers created on the Somalia CRS after June 2025.',
    description: 'Helper text for marriage registration number search field',
    id: 'form.field.helper.marriageRegistrationNumberSearch'
  },
  configuration: {
    query: {
      type: 'and',
      clauses: [
        {
          eventType: 'marriage'
        },
        {
          'legalStatuses.REGISTERED.registrationNumber': {
            term: '{term}',
            type: 'exact'
          }
        }
      ]
    },
    limit: 10,
    offset: 0,
    validation: {
      validator: defineConditional({
        type: 'string'
      }),
      message: {
        defaultMessage: 'Invalid value',
        description: 'Error message for invalid marriage registration number',
        id: 'form.field.error.marriageRegistrationNumberSearchInvalid'
      }
    },
    indicators: {
      ok: {
        defaultMessage: 'Marriage record found',
        description: 'OK indicator text',
        id: 'form.field.indicator.marriageRecordFound'
      },
      clearModal: {
        title: {
          defaultMessage: 'Clear marriage record?',
          description: 'Title for the clear confirmation modal',
          id: 'form.field.clearModal.title'
        },
        description: {
          defaultMessage:
            'This will remove the auto-populated details from the marriage record.',
          description: 'Description for the clear confirmation modal',
          id: 'form.field.clearModal.description'
        }
      }
    }
  }
}
