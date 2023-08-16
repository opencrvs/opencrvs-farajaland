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
export const TEST_SOURCE = `${process.cwd()}/src/tests/`
export const HOSTNAME = process.env.HOSTNAME || '*'
export const FHIR_URL = process.env.FHIR_URL || 'http://localhost:3447/fhir'
export const OPENHIM_URL =
  process.env.OPENHIM_URL || 'http://localhost:5001/fhir'
export const ORG_URL = 'http://opencrvs.org'
export const COUNTRY_CONFIG_HOST = process.env.COUNTRY_CONFIG_HOST || '0.0.0.0'
export const COUNTRY_CONFIG_PORT = process.env.COUNTRY_CONFIG_PORT || 3040
export const AUTH_URL = process.env.AUTH_URL || 'http://localhost:4040'
export const APPLICATION_CONFIG_URL =
  process.env.APPLICATION_CONFIG_URL || 'http://localhost:2021/'
export const SENTRY_DSN = process.env.SENTRY_DSN
// Check if the token has been invalided in the auth service before it has expired
// This needs to be a string to make it easy to pass as an ENV var.
export const CHECK_INVALID_TOKEN = process.env.CHECK_INVALID_TOKEN || 'false'
export const CONFIRM_REGISTRATION_URL =
  process.env.CONFIRM_REGISTRATION_URL ||
  'http://localhost:5001/confirm/registration'
export const DEFAULT_TIMEOUT = 600000
