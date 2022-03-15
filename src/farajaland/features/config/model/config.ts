/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { string } from 'joi'
import { model, Schema, Document } from 'mongoose'

interface IBirth {
  REGISTRATION_TARGET: number
  LATE_REGISTRATION_TARGET: number
  FEE: {
    ON_TIME: number
    LATE: number
    DELAYED: number
  }
}
interface IDeath {
  REGISTRATION_TARGET: number
  FEE: {
    ON_TIME: number
    DELAYED: number
  }
}
interface IPhoneNumberPattern {
  pattern: RegExp
  example: string
  start: string
  num: string
  mask: {
    startForm: number
    endBefore: number
  }
}
interface INIDNumberPattern {
  pattern: RegExp
  example: string
  num: string
}
interface ICurrency {
  isoCode: string
  languagesAndCountry: string[]
}
export interface IApplicationConfigurationModel extends Document {
  APPLICATION_NAME: string,
  BACKGROUND_SYNC_BROADCAST_CHANNEL: string
  BIRTH : IBirth
  COUNTRY: string
  COUNTRY_LOGO_FILE: string
  COUNTRY_LOGO_RENDER_WIDTH: number
  COUNTRY_LOGO_RENDER_HEIGHT: number
  CURRENCY: ICurrency
  DEATH: IDeath
  DESKTOP_TIME_OUT_MILLISECONDS: number
  LANGUAGES: string
  CERTIFICATE_PRINT_LOWEST_CHARGE: number
  CERTIFICATE_PRINT_HIGHEST_CHARGE: number
  UI_POLLING_INTERVAL: number
  FIELD_AGENT_AUDIT_LOCATIONS: string
  DECLARATION_AUDIT_LOCATIONS: string
  INFORMANT_MINIMUM_AGE: number
  HIDE_EVENT_REGISTER_INFORMATION: boolean
  EXTERNAL_VALIDATION_WORKQUEUE: boolean
  SENTRY: string
  LOGROCKET: string
  PHONE_NUMBER_PATTERN: IPhoneNumberPattern
  NID_NUMBER_PATTERN: INIDNumberPattern
}

const birthSchema = new Schema<IBirth>({
  REGISTRATION_TARGET: { type: Number, default: 45 },
  LATE_REGISTRATION_TARGET: { type: Number, default: 365 },
  FEE: {
    ON_TIME: Number,
    LATE: Number,
    DELAYED: Number
  }
})

const deathSchema = new Schema<IDeath>({
  REGISTRATION_TARGET: { type: Number, default: 45 },
  FEE: {
    ON_TIME: Number,
    DELAYED: Number
  }
})

const nidPatternSchema = new Schema<INIDNumberPattern>({
  pattern: { type: String },
  example: String,
  num: String
})

const phoneNumberSchema = new Schema<IPhoneNumberPattern>({
  pattern: { type: String },
  example: String,
  start: String,
  num: String,
  mask: {
    startForm: Number,
    endBefore: Number
  }
})

const currencySchema = new Schema<IPhoneNumberPattern>({
  isoCode: { type: String },
  languagesAndCountry: [String]
})

const systemSchema = new Schema({
  APPLICATION_NAME: { type: String, require: false, default: 'OpenCRVS'},
  BACKGROUND_SYNC_BROADCAST_CHANNEL: { type: String, required: false },
  BIRTH: { type: birthSchema, required: false },
  COUNTRY: { type: String, required: false },
  COUNTRY_LOGO_FILE: { type: String, required: false },
  COUNTRY_LOGO_RENDER_WIDTH: { type: Number, required: false, default: 104 },
  COUNTRY_LOGO_RENDER_HEIGHT: { type: Number, required: false, default: 104 },
  CURRENCY: { type: currencySchema, require: false },
  DEATH: { type: deathSchema, required: false },
  DESKTOP_TIME_OUT_MILLISECONDS: {
    type: Number,
    required: false,
    default: 900000
  },
  LANGUAGES: { type: String, required: false, default: 'en' },
  CERTIFICATE_PRINT_LOWEST_CHARGE: {
    type: Number,
    required: false,
    default: 0
  },
  CERTIFICATE_PRINT_HIGHEST_CHARGE: {
    type: Number,
    required: false,
    default: 0
  },
  UI_POLLING_INTERVAL: { type: Number, required: false, default: 5000 },
  FIELD_AGENT_AUDIT_LOCATIONS: {
    type: String,
    required: false,
    default: 'DISTRICT'
  },
  DECLARATION_AUDIT_LOCATIONS: {
    type: String,
    required: false,
    default: 'DISTRICT'
  },
  INFORMANT_MINIMUM_AGE: { type: Number, required: false, default: 16 },
  HIDE_EVENT_REGISTER_INFORMATION: {
    type: Boolean,
    required: false,
    default: false
  },
  EXTERNAL_VALIDATION_WORKQUEUE: {
    type: Boolean,
    required: false,
    default: false
  },
  PHONE_NUMBER_PATTERN: { type: phoneNumberSchema, required: false },
  NID_NUMBER_PATTERN: { type: nidPatternSchema, required: false },
  SENTRY: { type: String, required: false },
  LOGROCKET: { type: String, required: false }
})

export default model<IApplicationConfigurationModel>('Config', systemSchema)
