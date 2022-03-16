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

context('Search Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('Tests search declaration by child name using minimum input', () => {
    

    // DECLARE DECLARATION AS FIELD AGENT
   cy.declareDeclarationWithMinimumInput('Bill', 'Gates')
  
  })

  it('Tests search declaration by child name',() => {
     // LOGIN AS LOCAL REGISTRAR
     cy.login('registrar')
     cy.createPin()
     
     // SEARCH DECLARATION & Review Declaration
     cy.get('#searchType').click()
     cy.get('#name').click()
     cy.get('#searchText').type('Gates')
     cy.get('#searchText').type('{enter}')
 
  })
})
