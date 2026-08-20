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
import { field, and, or, not } from '@opencrvs/toolkit/events/deduplication'

const similarNamedGroom = field('groom.name').fuzzyMatches()
const similarNamedBride = field('bride.name').fuzzyMatches()

const differentBrideIdTypes = not(field('bride.idType').strictMatches())
const brideIdNotProvided = field('bride.idType').strictMatches({
  value: 'NONE'
})
const brideIdMatchesIfGiven = or(
  differentBrideIdTypes,
  brideIdNotProvided,
  field('bride.nid').strictMatches(),
  field('bride.passport').strictMatches(),
  field('bride.verified').strictMatches({
    value: 'authenticated'
  })
)

export const dedupConfig = or(
  and(similarNamedGroom, similarNamedBride, brideIdMatchesIfGiven)
)
