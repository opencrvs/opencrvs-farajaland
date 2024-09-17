export const DOMAIN = process.env.DOMAIN || 'farajaland-dev.opencrvs.org'
export const LOGIN_URL = 'http://localhost:3020'
export const AUTH_URL = 'http://localhost:4040'
export const CLIENT_URL = 'http://localhost:3000'
export const GATEWAY_HOST = 'http://localhost:7070'
// export const LOGIN_URL = 'https://login.' + DOMAIN
// export const AUTH_URL = 'https://auth.' + DOMAIN
// export const CLIENT_URL = 'https://register.' + DOMAIN
// export const GATEWAY_HOST = 'https://gateway.' + DOMAIN

const TEST_USER_PASSWORD = 'test'

export const CREDENTIALS = {
  FIELD_AGENT: {
    USERNAME: 'k.bwalya',
    PASSWORD: TEST_USER_PASSWORD
  },
  REGISTRATION_AGENT: {
    USERNAME: 'f.katongo',
    PASSWORD: TEST_USER_PASSWORD
  },
  LOCAL_REGISTRAR: {
    USERNAME: 'k.mweene',
    PASSWORD: TEST_USER_PASSWORD
  },
  NATIONAL_REGISTRAR: {
    USERNAME: 'j.musonda',
    PASSWORD: TEST_USER_PASSWORD
  }
}
