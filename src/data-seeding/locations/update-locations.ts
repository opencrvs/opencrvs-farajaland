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
import fetch from 'node-fetch'
import {
  composeLocationsFromCsv,
  Location as CountryConfigLocation
} from './handler'
import { GATEWAY_URL } from '@countryconfig/constants'

const putLocations = async (
  locations: Array<CountryConfigLocation>,
  { token }: { token: string }
) => {
  const res = await fetch(`${GATEWAY_URL}/locations?`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/fhir+json'
    },
    body: JSON.stringify(
      locations.map(({ id, locationType, ...loc }) => ({
        statisticalID: id,
        code: locationType,
        ...loc
      }))
    )
  })

  if (!res.ok) {
    throw new Error(`Error posting the locations to core: ${await res.text()}`)
  }

  const response: fhir.Bundle = await res.json()
  response.entry?.forEach((res, index) => {
    if (res.response?.status !== '200') {
      console.error(
        `Failed to update location resource for: "${locations[index].name}"`
      )
    }
  })
  return response
}

if (!process.env.TOKEN) {
  throw new Error(
    `'TOKEN' not found in environment. Please run the script with national system admin token.`
  )
}

;(async () => {
  const countryConfigLocations = await composeLocationsFromCsv()
  console.info(
    `Read ${countryConfigLocations.length} locations from CSV's. Updating...`
  )
  const response = await putLocations(countryConfigLocations, {
    token: process.env.TOKEN!
  })
  console.info(`...done updating ${response.entry?.length} locations`)
})()
