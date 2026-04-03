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
import { TWO_FA_ENABLED } from '@countryconfig/constants'
import { readCSVToJSON } from '@countryconfig/utils'
import { Request, ResponseToolkit } from '@hapi/hapi'

export async function usersHandler(_: Request, h: ResponseToolkit) {
  // TWO_FA_ENABLED is used as a proxy for "real production environment".
  // QA/staging deployments disable 2FA for testing convenience, so when it's
  // false we seed default (test) employees instead of production ones.
  const users: unknown[] = await readCSVToJSON(
    process.env.NODE_ENV === 'production' && TWO_FA_ENABLED
      ? './src/data-seeding/employees/source/prod-employees.csv'
      : './src/data-seeding/employees/source/default-employees.csv'
  )
  return h.response(users)
}
