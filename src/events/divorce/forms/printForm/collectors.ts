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

import { FieldConfig, FieldType } from '@opencrvs/toolkit/events'
import { InformantType } from '../pages/informant'

const husbandOption = {
  label: {
    id: 'event.marriage.action.certificate.form.section.requester.husband.label',
    defaultMessage: 'Print and issue to Husband',
    description: 'This is the label for the field'
  },
  value: InformantType.HUSBAND
}

const wifeOption = {
  label: {
    id: 'event.marriage.action.certificate.form.section.requester.wife.label',
    defaultMessage: 'Print and issue to Wife',
    description: 'This is the label for the field'
  },
  value: InformantType.WIFE
}

const otherOption = {
  label: {
    id: 'event.marriage.action.certificate.form.section.requester.other.label',
    defaultMessage: 'Print and issue to someone else',
    description: 'This is the label for the field'
  },
  value: 'SOMEONE_ELSE'
}

const requesterLabel = {
  defaultMessage: 'Requester',
  description: 'This is the label for the field',
  id: 'event.marriage.action.certificate.form.section.requester.label'
}

const commonConfigs = {
  id: 'collector.requesterId',
  type: FieldType.SELECT,
  required: true,
  label: requesterLabel
}

export const printCertificateCollectors: FieldConfig[] = [
  {
    ...commonConfigs,

    options: [husbandOption, wifeOption, otherOption]
  }
]
