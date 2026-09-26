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

const adopteePrefix = {
  id: 'adoption.search.criteria.label.prefix.child',
  defaultMessage: "Adoptee's",
  description: 'Adoptee prefix'
}

export const advancedSearchAdoption = [
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
      defaultMessage: 'Adoptee details',
      description: 'The title of Adoptee details accordion',
      id: 'advancedSearch.form.adopteeDetails'
    },
    fields: [
      field('adoptee.dob', {
        searchCriteriaLabelPrefix: adopteePrefix
      }).range(),
      field('adoptee.name', {
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
      field('adoptee.placeOfBirth').exact(),
      field('adoption.courtName').exact()
    ]
  },
  {
    title: {
      defaultMessage: 'Parent 1 details',
      description: 'The title of Parent 1 details accordion',
      id: 'advancedSearch.form.parent1Details'
    },
    fields: [
      field('adoptiveParent1.name', {
        validations: [],
        conditionals: []
      }).fuzzy()
    ]
  },
  {
    title: {
      defaultMessage: 'Parent 2 details',
      description: 'The title of Parent 2 details accordion',
      id: 'advancedSearch.form.parent2Details'
    },
    fields: [
      field('adoptiveParent2.name', {
        validations: [],
        conditionals: []
      }).fuzzy()
    ]
  }
] satisfies AdvancedSearchConfig[]
