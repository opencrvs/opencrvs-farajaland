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
import chalk from 'chalk'
import { internal } from '@hapi/boom'
import { composeAndSaveFacilities } from '@countryconfig/features/facilities/scripts/utils'
import { readCSVToJSON } from '@countryconfig/features/utils'
import { connect, disconnect } from '@countryconfig/database'

export default async function importFacilities() {
  const crvsOffices: any = await readCSVToJSON(process.argv[2])
  const healthFacilities: any = await readCSVToJSON(process.argv[3])
  await connect('mongodb://localhost/hearth-dev')
  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.blueBright(
        '/////////////////////////// MAPPING CR OFFICES TO LOCATIONS AND SAVING TO FHIR ///////////////////////////'
      )}`
    )
    await composeAndSaveFacilities(crvsOffices)
    await composeAndSaveFacilities(healthFacilities)
  } catch (err) {
    return internal(err)
  } finally {
    await disconnect()
  }

  return true
}

importFacilities()
