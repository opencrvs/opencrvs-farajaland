import {
  ConditionalType,
  and,
  not,
  field,
  AddressType,
  FieldType,
  FieldConfig,
  defineFormConditional,
  errorMessages
} from '@opencrvs/toolkit/events'

function isInternationalAddress() {
  return and(
    not(field('country').isUndefined()),
    field('addressType').isEqualTo(AddressType.INTERNATIONAL)
  )
}

function isDomesticAddress() {
  return and(
    not(field('country').isUndefined()),
    field('addressType').isEqualTo(AddressType.DOMESTIC)
  )
}

export function getNestedFieldValidators(
  fieldId: string,
  fields: FieldConfig[]
) {
  return fields
    .filter((x) => x.required)
    .map((field) => ({
      message:
        typeof field.required === 'object'
          ? field.required.message
          : errorMessages.requiredField,

      validator: defineFormConditional({
        type: 'object',
        properties: {
          [fieldId]: {
            type: 'object',
            properties: {
              addressType: {
                type: 'string',
                enum: ['INTERNATIONAL', 'DOMESTIC']
              },
              streetLevelDetails: {
                type: 'object',
                properties: {
                  [field.id]: { minLength: 1 }
                }
              }
            },
            if: {
              properties: {
                addressType: { const: 'INTERNATIONAL' }
              }
            },
            then: {
              required: ['streetLevelDetails'],
              properties: {
                streetLevelDetails: {
                  required: [field.id]
                }
              }
            }
          }
        },
        required: [fieldId]
      })
    }))
}

export const defaultStreetAddressConfiguration = [
  {
    id: 'street',
    required: false,
    parent: field('country'),
    label: {
      id: 'field.address.street.label',
      defaultMessage: 'Street',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isDomesticAddress(),
          not(field('district').isUndefined())
        )
      }
    ],
    type: FieldType.TEXT
  }
]
