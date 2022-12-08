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

import faker from '@faker-js/faker'
import { getDateMonthYearFromString } from '../support/commands'

context('Search Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('birth declaration can be found with  minimum input', () => {
    const firstName = faker.name.firstName()
    const familyName = faker.name.lastName()

    cy.createBirthRegistrationAs('fieldWorker', {
      firstName,
      familyName
    })

    cy.login('registrar')
    cy.createPin()

    cy.get('#searchType').click()
    cy.get('#advanced-search').click()
    cy.get('#BirthChildDetails-accordion').click()
    cy.get('#childFirstNames').type(firstName)
    cy.get('#childLastName').type(familyName)
    cy.get('#BirthRegistrationDetails-accordion').click()

    cy.get('#placeOfRegistration').type('Ibombo District Office')
    cy.selectLocation('span', 'Ibombo District Office')

    cy.get('#search').click()
    cy.get(`:contains("${firstName} ${familyName}")`).should('be.visible')
    cy.logout()
  })

  it('death declaration can be found with minimum input', () => {
    const deceasedFirstNames = faker.name.firstName()
    const deceasedFamilyName = faker.name.lastName()

    cy.declareDeathDeclarationWithMaximumInput({
      deceasedFirstNames,
      deceasedFamilyName
    })

    cy.login('registrar')
    cy.createPin()

    cy.get('#searchType').click()
    cy.get('#advanced-search').click()
    cy.get('#tab_death').click()
    cy.get('#DeathRegistrationDetails-accordion').click()
    cy.get('#dateOfRegistration-date_range_button').click()
    cy.get('#date-range-confirm-action').click()

    cy.selectOption('#registrationStatuses', 'Any status', 'Any status')
    cy.get('#search').click()
    cy.get(`:contains("${deceasedFirstNames} ${deceasedFamilyName}")`).should(
      'be.visible'
    )
    cy.logout()
  })

  it('death declaration can be found with maximum input', () => {
    const deceasedFirstNames = faker.name.firstName()
    const deceasedFamilyName = faker.name.lastName()
    const deceasedDoB = '1998-08-19'
    const deceasedGender = 'Male'
    const informantFirstNames = faker.name.firstName()
    const informantFamilyName = faker.name.lastName()
    const informantDoB = '1998-08-20'
    const deceasedDoBSplit = getDateMonthYearFromString(deceasedDoB)
    const informantDoBSplit = getDateMonthYearFromString(informantDoB)

    cy.declareDeathDeclarationWithMaximumInput({
      deceasedFirstNames,
      deceasedFamilyName,
      deceasedDoB,
      deceasedGender,
      informantFirstNames,
      informantFamilyName,
      informantDoB
    })

    cy.login('registrar')
    cy.createPin()
    //OPEN ADVANCED SEARCH
    cy.get('#searchType').click()
    cy.get('#advanced-search').click()
    cy.get('#tab_death').click()
    //ENTER REGISTRATION DETAILS
    cy.get('#DeathRegistrationDetails-accordion').click()
    cy.get('#dateOfRegistration-date_range_button').click()
    cy.get('#date-range-confirm-action').click()
    cy.selectOption('#registrationStatuses', 'Any status', 'Any status')
    //ENTER DECEASED DETAILS
    cy.get('#DeathdeceasedDetails-accordion-header').click()
    cy.get('#deceasedDoBexact-dd').type(deceasedDoBSplit.dd)
    cy.get('#deceasedDoBexact-mm').type(deceasedDoBSplit.mm)
    cy.get('#deceasedDoBexact-yyyy').type(deceasedDoBSplit.yyyy)
    cy.get('#deceasedFirstNames').type(deceasedFirstNames)
    cy.get('#deceasedFamilyName').type(deceasedFamilyName)
    cy.selectOption('#deceasedGender', deceasedGender, deceasedGender)
    //ENTER INFORMANT DETAILS
    cy.get('#DeathInformantDetails-accordion-header').click()
    cy.get('#informantDoBexact-dd').type(informantDoBSplit.dd)
    cy.get('#informantDoBexact-mm').type(informantDoBSplit.mm)
    cy.get('#informantDoBexact-yyyy').type(informantDoBSplit.yyyy)
    cy.get('#informantFirstNames').type(informantFirstNames)
    cy.get('#informantFamilyName').type(informantFamilyName)
    //GOTO SEARCH RESULT
    cy.get('#search').click()
    cy.get(`:contains("${deceasedFirstNames} ${deceasedFamilyName}")`).should(
      'be.visible'
    )
  })
})
