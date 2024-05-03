describe('1. Login with valid information', () => {
  beforeEach(() => {
    // Initialise the test environment
    cy.visit(Cypress.env('LOGIN_URL'))
  })

  it('1.1. Navigate to the login URL', () => {
    // Expected result: User should redirect to the login page
    cy.get('#login-step-one-box').should('be.visible')
  })

  it('1.2. Enter your user name and Password', () => {
    cy.get('#username').type('k.mweene')
    cy.get('#password').type('test')
    cy.get('#login-mobile-submit').click()

    // Expected result: User should navigate to the Next page to verify through Mobile number or Email address.
    cy.get('#login-step-two-box').should('be.visible')
  })

  describe.skip('1.3. Validate 2FA', () => {
    it('Validate the SMS for 2fa', () => {})
    it('Validate the email for 2fa', () => {})
  })

  it('1.4. Verify through by inputting the 2FA code', () => {
    cy.getReduxStore().then((store) => {
      store.dispatch({
        type: 'login/AUTHENTICATE',
        payload: {
          username: 'k.mweene',
          password: 'test'
        }
      })
    })
    cy.get('#code').type('000000')
    cy.get('#login-mobile-submit').click()
    // Expected result: Must log in to the OPEN CRVS Page
    cy.get('#appSpinner').should('exist')
  })

  it('1.4. Verify through by inputting the 2FA code', () => {})
})
