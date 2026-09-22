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

export const advancedSearchNameChange = [
  {
    title: {
      defaultMessage: 'Registration details',
      description: 'The title of Registration details accordion',
      id: 'advancedSearch.form.registrationDetails'
    },
    fields: [
      event('legalStatuses.REGISTERED.createdAtLocation').within(),
      event('legalStatuses.REGISTERED.acceptedAt').range(),
      event('status').exact(),
      event('updatedAt').range()
    ]
  },
  {
    title: {
      defaultMessage: 'Name change details',
      description: 'The title of Name change details accordion',
      id: 'advancedSearch.form.nameChangeDetails'
    },
    fields: [
      field('nameChange.newName', {
        validations: [],
        conditionals: []
      }).fuzzy()
    ]
  },
  {
    title: {
      defaultMessage: 'Event details',
      description: 'The title of Event details accordion',
      id: 'advancedSearch.form.eventDetails'
    },
    fields: [
      field('nameChange.filingDate').exact(),
      field('nameChange.courtName').exact()
    ]
  },
  {
    title: {
      defaultMessage: 'Parent details',
      description: 'The title of Parent 1 details accordion',
      id: 'advancedSearch.form.parentDetails'
    },
    fields: [
      field('parent.name', {
        validations: [],
        conditionals: []
      }).fuzzy()
    ]
  }
] satisfies AdvancedSearchConfig[]
