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
/// <reference types="Cypress" />

context('Integration Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })
  it('National Admin can create integration', () => {
    // LOG IN AS national SYSTEM ADMIN
    cy.login('nsysAdmin')
    cy.createPin()
    cy.get('#navigation_config_main').click()
    cy.get('#navigation_integration').click()
    cy.get('#createClientButton').click()
    cy.get('#client_name').type('Green')
    cy.selectOption(
      '#permissions-selectors',
      'Health notification',
      'Health notification'
    )
    cy.get('#submitClientForm').click()
    cy.get('#uniqueKeyId').should('be.visible')
  })

  it('National Admin can deactivate an integration', () => {
    // LOG IN AS national SYSTEM ADMIN
    cy.login('nsysAdmin')
    cy.createPin()
    cy.get('#navigation_config_main').click()
    cy.get('#navigation_integration').click()
    cy.get('#toggleMenuToggleButton').click()
    cy.get('#toggleMenuItem1').click()
    cy.get('#confirm').click()
    cy.get('#toggleClientDeActiveStatusToast').should('be.visible')
  })

  it('National Admin can reveal keys of an integration', () => {
    // LOG IN AS national SYSTEM ADMIN
    cy.login('nsysAdmin')
    cy.createPin()
    cy.get('#navigation_config_main').click()
    cy.get('#navigation_integration').click()
    cy.get('#toggleMenuToggleButton').click()
    cy.get('#toggleMenuItem0').click()
    cy.get('#revealKeyId').should('be.visible')
  })
})
