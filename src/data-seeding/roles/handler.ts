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
import { PRODUCTION, QA_ENV } from '@countryconfig/constants'
import roles from './roles.json'
import { readFile, writeFile } from 'fs/promises'
import { Request, ResponseToolkit } from '@hapi/hapi'
import { join } from 'path'

export async function rolesHandler() {
  if (!PRODUCTION || QA_ENV) {
    const modifiableRoles: typeof roles = JSON.parse(
      (await readFile(join(__dirname, 'roles.json'))).toString()
    )

    return modifiableRoles.map((role) => {
      return {
        ...role,
        scopes: role.scopes.concat('demo')
      }
    })
  }
  return roles
}

export async function modifyRoles(req: Request) {
  await writeFile(join(__dirname, 'roles.json'), JSON.stringify(req.payload))
  return req.payload
}

export async function renderRolesUI(req: Request, h: ResponseToolkit) {
  return h.file(join(__dirname, './qa-scopes-editor.html'))
}
