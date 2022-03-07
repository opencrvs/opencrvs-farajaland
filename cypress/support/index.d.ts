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
declare namespace Cypress {
  interface Chainable {
    login: (userType: string) => void
    logout: () => void
    selectOption: (selector: string, text: string, option: string) => void
    goToNextFormSection: () => void
    createPin: () => void
    submitDeclaration: () => void
    rejectDeclaration: () => void
    registerDeclaration: () => void
    verifyLandingPageVisible: () => void
    initializeFakeTimers: () => void
    downloadFirstDeclaration: () => void
    enterMaximumInput: (firstName: string, lastName: string) => void
    enterDeathMaximumInput: () => void
    registerDeclarationWithMinimumInput: (
      firstName: string,
      lastName: string
    ) => void
    registerDeclarationWithMaximumInput: (
      firstName: string,
      lastName: string
    ) => void
    declareDeclarationWithMinimumInput: (
      firstName: string,
      lastName: string
    ) => void
    declareDeclarationWithMaximumInput: (
      firstName: string,
      lastName: string
    ) => void
    declareDeathDeclarationWithMinimumInput: () => void
    registerDeathDeclarationWithMinimumInput: () => void
    declareDeathDeclarationWithMaximumInput: () => void
    registerDeathDeclarationWithMaximumInput: () => void
    someoneElseJourney: () => void
  }
}
