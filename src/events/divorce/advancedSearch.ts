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

import { AdvancedSearchConfig, event, field } from '@opencrvs/toolkit/events'

export const advancedSearchBirth = [
  {
    title: {
      defaultMessage: 'Divorce details',
      description: 'The title of Divorce details accordion',
      id: 'advancedSearch.form.divorceDetails'
    },
    fields: [
      event('legalStatuses.REGISTERED.createdAtLocation').within(),
      event('legalStatuses.REGISTERED.registrationNumber').exact(),
      field('divorce.dateOfDivorce').range(),
      field('court.name').exact(),
      event('status').exact(),
      event('updatedAt').range()
    ]
  },
  {
    title: {
      defaultMessage: "Husband's details",
      description: 'Husband details search section',
      id: 'advancedSearch.form.husbandDetails'
    },
    fields: [
      field('husband.firstname').fuzzy(),
      field('husband.surname').fuzzy()
    ]
  },
  {
    title: {
      defaultMessage: "Wife's details",
      description: 'Wife details search section',
      id: 'advancedSearch.form.wifeDetails'
    },
    fields: [field('wife.firstname').fuzzy(), field('wife.surname').fuzzy()]
  },
  {
    title: {
      defaultMessage: 'Informant details',
      description: 'Informant details search section',
      id: 'advancedSearch.form.informantDetails'
    },
    fields: [
      field('informant.phoneNo').fuzzy(),
      field('informant.email').fuzzy()
    ]
  }
] satisfies AdvancedSearchConfig[]
