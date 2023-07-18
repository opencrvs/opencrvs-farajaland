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
import { TypeOf, z } from 'zod'

export type User = TypeOf<typeof UserSchema>[number]

export const UserSchema = z.array(
  z.object({
    facilityId: z.string(),
    username: z.string(),
    givenNames: z.string(),
    familyName: z.string(),
    role: z.enum([
      'FIELD_AGENT',
      'REGISTRATION_AGENT',
      'LOCAL_REGISTRAR',
      'LOCAL_SYSTEM_ADMIN',
      'NATIONAL_SYSTEM_ADMIN',
      'PERFORMANCE_MANAGEMENT',
      'NATIONAL_REGISTRAR'
    ]),
    type: z.enum([
      'Field Agent',
      'Agent de terrain',
      'Police Officer',
      'Officier de police',
      'Social Worker',
      'Travailleur social',
      'Healthcare Worker',
      'Personnel de santé',
      'Registration Agent',
      "Agent d'enregistrement",
      'Local Registrar',
      'Registraire local',
      'Local System Admin',
      'Administrateur système local',
      'National System Admin',
      'Administrateur système national',
      'Performance Manager',
      'Gestion des performances',
      'National Registrar',
      'Registraire national'
    ]),
    mobile: z.string(),
    email: z.string()
  })
)
