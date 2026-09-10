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
      defaultMessage: 'Marriage details',
      description: 'The title of Marriage details accordion',
      id: 'advancedSearch.form.marriageDetails'
    },
    fields: [
      event('legalStatuses.REGISTERED.createdAtLocation').within(),
      event('legalStatuses.REGISTERED.registrationNumber').exact(),
      field('marriageDetails.dateOfMarriage').range(),
      field('marriageDetails.placeOfMarriage').exact(),
      event('status').exact(),
      event('updatedAt').range()
    ]
  },
  {
    title: {
      defaultMessage: "Groom's details",
      description: 'Groom details search section',
      id: 'advancedSearch.form.groomDetails'
    },
    fields: [field('groom.name').fuzzy()]
  },
  {
    title: {
      defaultMessage: "Bride's details",
      description: 'Bride details search section',
      id: 'advancedSearch.form.brideDetails'
    },
    fields: [field('bride.name').fuzzy()]
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
