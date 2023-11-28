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

import { Request, ResponseToolkit } from '@hapi/hapi'
import { readFileSync } from 'fs'
import { capitalize } from 'lodash'

export async function certificateHandler(request: Request, h: ResponseToolkit) {
  if (request.params.event) {
    const res = JSON.stringify(
      readFileSync(
        `./src/data-seeding/certificates/source/${capitalize(
          request.params.event
        )}Certificate.svg`
      ).toString()
    )
    return h.response(res).code(200)
  }

  const Certificates = [
    {
      event: 'birth',
      fileName: 'farajaland-birth-certificate-v1.svg',
      svgCode: readFileSync(
        './src/data-seeding/certificates/source/BirthCertificate.svg'
      ).toString()
    },
    {
      event: 'death',
      fileName: 'farajaland-death-certificate-v1.svg',
      svgCode: readFileSync(
        './src/data-seeding/certificates/source/DeathCertificate.svg'
      ).toString()
    },
    {
      event: 'marriage',
      fileName: 'farajaland-marriage-certificate-v1.svg',
      svgCode: readFileSync(
        './src/data-seeding/certificates/source/MarriageCertificate.svg'
      ).toString()
    }
  ]
  const res = JSON.stringify(Certificates)
  return h.response(res)
}
