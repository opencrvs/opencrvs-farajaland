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

import { TranslationConfig } from '@opencrvs/toolkit/events'
import { createSelectOptions } from './select-options'

export const BIRTH_REGISTRATION_TARGET_DAYS = 30
export const BIRTH_LATE_REGISTRATION_TARGET_DAYS = 365
export const DEATH_REGISTRATION_TARGET_DAYS = 45
export const MARRIAGE_REGISTRATION_TARGET_DAYS = 30

export const MarriageIdType = {
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  NO_ID: 'NO_ID'
} as const

const marriageIdTypeMessageDescriptors = {
  NATIONAL_ID: {
    defaultMessage: 'National ID',
    description: 'Option for National ID',
    id: 'form.field.label.marriageIdTypeNationalId'
  },
  PASSPORT: {
    defaultMessage: 'Passport',
    description: 'Option for Passport',
    id: 'form.field.label.marriageIdTypePassport'
  },
  NO_ID: {
    defaultMessage: 'No ID',
    description: 'Option for No ID type',
    id: 'form.field.label.marriageIdTypeNoId'
  }
} satisfies Record<keyof typeof MarriageIdType, TranslationConfig>

export const marriageIdTypeOptions = createSelectOptions(
  MarriageIdType,
  marriageIdTypeMessageDescriptors
)
