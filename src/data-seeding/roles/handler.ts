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
import { readCSVToJSON } from '@countryconfig/utils'
import { Request, ResponseToolkit } from '@hapi/hapi'
import { RoleSchema, Role } from './validator'

export async function rolesHandler(_: Request, h: ResponseToolkit) {
  const rawRoles: unknown[] = await readCSVToJSON(
    './src/data-seeding/roles/source/roles.csv'
  )
  const roles = RoleSchema.parse(rawRoles)
    .map(({ systemRole, ...rest }) => {
      return {
        systemRole,
        labels: Object.entries(rest).map(
          ([key, value]: [Exclude<keyof Role, 'systemRole'>, string]) => ({
            lang: key.split('_')[1],
            label: value
          })
        )
      }
    })
    .reduce<
      Record<string, Array<{ labels: Array<{ lang: string; label: string }> }>>
    >((acc, role) => {
      if (!acc[role.systemRole]) {
        acc[role.systemRole] = []
      }
      acc[role.systemRole].push({ labels: role.labels })
      return acc
    }, {})
  return h.response(roles)
}
