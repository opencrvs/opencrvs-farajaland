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
import { and, or, field } from '@opencrvs/toolkit/events'
import { defineFormConditional, not } from '@opencrvs/toolkit/conditionals'

// Derived from the tightest SVG certificate clip area (202px, 8px Noto Sans).
// Worst-case character: W ≈ 6.9px → 2N × 6.9 + 2 (space) ≤ 202 → N ≤ 14.
// Set to 13 for an additional safety margin (~181px used of 202px available).
// Increase only if all certificate clip paths are widened accordingly.
export const MAX_NAME_LENGTH = 13

export const invalidNameValidator = (fieldName: string) => ({
  message: {
    defaultMessage:
      "Input contains invalid characters. Please use only letters (a-z, A-Z), numbers (0-9), hyphens (-) and apostrophes(')",
    description: 'This is the error message for invalid name',
    id: 'error.invalidName'
  },
  validator: and(
    field(fieldName).get('firstname').isValidEnglishName(),
    field(fieldName).get('middlename').isValidEnglishName(),
    field(fieldName).get('surname').isValidEnglishName()
  )
})

export const nationalIdValidator = (fieldId: string) => ({
  message: {
    defaultMessage:
      'The national ID can only be numeric and must be 10 digits long',
    description: 'This is the error message for an invalid national ID',
    id: 'error.invalidNationalId'
  },
  validator: defineFormConditional({
    type: 'object',
    properties: {
      [fieldId]: {
        type: 'string',
        pattern: '^[0-9]{10}$',
        description: 'Must be numeric and 10 digits long.'
      }
    }
  })
})

export const passportValidator = (fieldId: string) => ({
  message: {
    defaultMessage: 'The passport can only be numeric',
    description: 'This is the error message for an invalid passport',
    id: 'error.invalidPassport'
  },
  validator: defineFormConditional({
    type: 'object',
    properties: {
      [fieldId]: {
        type: 'string',
        pattern: '^[0-9]+$',
        description: 'Must be numeric.'
      }
    }
  })
})

export const dobBeforeChildDobValidator = (prefix: string) => ({
  message: {
    defaultMessage: "Birth date must be before child's birth date",
    description:
      "This is the error message for a birth date after child's birth date",
    id: 'event.birth.action.declare.form.section.person.dob.afterChild'
  },
  validator: or(
    field('child.dob').isFalsy(),
    and(
      field(`${prefix}.dob`).isBefore().date(field('child.dob')),
      not(field(`${prefix}.dob`).isEqualTo(field('child.dob')))
    )
  )
})

export const farajalandNameConfig = {
  name: {
    firstname: { required: true },
    surname: { required: true }
  },
  maxLength: MAX_NAME_LENGTH
}
