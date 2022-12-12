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

 

context('Change Background Color', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('changes the login background color as a system admin', () => {
    // LOG IN AS national SYSTEM ADMIN
    cy.login('nsysAdmin')
    cy.createPin()

    // Change Login background to Color
    cy.get('#navigation_config_main').click()
    cy.get('#navigation_application').click()
    cy.get('#LOGIN_BACKGROUND').click()
    cy.get('#applicationHexColor').type('344')
    cy.get('#apply_change').click()
    cy.get('#print-cert-notification', {timeout: 10000}).should('be.visible')
  })

  it('changes the login background image as a system admin', () => {
    // LOG IN AS national SYSTEM ADMIN
    cy.login('nsysAdmin')
    cy.createPin()

    // Change Login background to image
    cy.get('#navigation_config_main').click()
    cy.get('#navigation_application').click()
    cy.get('#LOGIN_BACKGROUND').click()
    cy.get('#tab_Image').click()
    cy.get('input[type=file]').attachFile('farajaland.png')
    cy.get('#apply_change').click()
    cy.get('#print-cert-notification',{timeout: 10000}).should('be.visible')
  })
})
