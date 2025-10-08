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
import { describe, it, expect } from 'vitest'
import { printCertificateCollectors } from './collectors'

describe('printCertificateCollectors', () => {
  it('should not have PRINT_IN_ADVANCE option', () => {
    const options = printCertificateCollectors.flatMap((field) =>
      'options' in field ? field.options : []
    )

    options.every((option) => {
      expect(option.value).toBeTruthy()
      expect(option.value).not.toBe('PRINT_IN_ADVANCE')
      return true
    })
  })
})
