import { logger } from '@countryconfig/logger'
import { EventIndex, NameFieldValue } from '@opencrvs/toolkit/events'

export const birthCredentialTemplate = (event: EventIndex) => {
  console.log(JSON.stringify(event, null, 2))

  logger.warn(
    `Passing issuer key UNSAFELY for birth credential template <event-id:${event.id}>! DO NOT USE IN PRODUCTION!`
  )

  const childName = event.declaration['child.name'] as NameFieldValue
  const dateOfEvent = event.dateOfEvent as string

  return {
    issuerKey: {
      type: 'jwk',
      jwk: {
        kty: 'EC',
        d: 'bT6oe9YINqDSeIopwO4d2AC3ltP2z8dbSYdsAoXDcbk',
        crv: 'P-256',
        x: 'AaHi6zid20drjPgMtiwnluW5Dt2wZK25QqFgpgcKYOo',
        y: 'Ar7ijcnX1Z2jujYP_zTFeZizO5rLLsNPHQ_UAzVy5eg'
      }
    },
    issuerDid: 'https://vc-demo.opencrvs.dev',
    credentialConfigurationId: 'crvs_birth_v1',
    credentialData: {
      given_name: childName.firstname,
      family_name: childName.surname,
      birthdate: dateOfEvent,
      place_of_birth: 'Chamakubi Health Post, Ibombo, Central, Farajaland'
    },
    mapping: {
      id: '<uuid>',
      iat: '<timestamp-seconds>',
      nbf: '<timestamp-seconds>',
      exp: '<timestamp-in-seconds:365d>'
    },
    authenticationMethod: 'PRE_AUTHORIZED',
    selectiveDisclosure: {
      fields: {
        birthdate: {
          sd: true
        },
        place_of_birth: {
          sd: true
        },
        given_name: { sd: true },
        family_name: { sd: true }
      },
      decoyMode: 'NONE',
      decoys: 0
    },
    x5Chain: [
      '-----BEGIN CERTIFICATE-----\nMIICBjCCAaugAwIBAgIUPX54kEpnN+YVRSrYE3ZFvFW0S5QwCgYIKoZIzj0EAwIw\nJzElMCMGA1UEAwwcdmMtZGVtby5vcGVuY3J2cy5kZXYgUm9vdCBDQTAeFw0yNjAx\nMjgxMTMxMzlaFw0zNjAxMjYxMTMxMzlaMB8xHTAbBgNVBAMMFHZjLWRlbW8ub3Bl\nbmNydnMuZGV2MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEAaHi6zid20drjPgM\ntiwnluW5Dt2wZK25QqFgpgcKYOoCvuKNydfVnaO6Ng//NMV5mLM7mssuw08dD9QD\nNXLl6KOBvDCBuTAJBgNVHRMEAjAAMA4GA1UdDwEB/wQEAwIHgDAdBgNVHSUEFjAU\nBggrBgEFBQcDAgYIKwYBBQUHAwEwPQYDVR0RBDYwNIIUdmMtZGVtby5vcGVuY3J2\ncy5kZXaGHGh0dHBzOi8vdmMtZGVtby5vcGVuY3J2cy5kZXYwHQYDVR0OBBYEFFZN\naaq91nJmU4/eaQrcX+AjYsvcMB8GA1UdIwQYMBaAFEqJpt4a+YnngTezRZv109X6\ndsPBMAoGCCqGSM49BAMCA0kAMEYCIQC0hnUxiwEezon6FXVZYmzt5lhnJgUtBrsK\nL8RSh9YJEgIhAMWNTQHAXJxOG1bFnUr6zZ+EhHsZ+j4zNMnHGaoVEYIl\n-----END CERTIFICATE-----',
      '-----BEGIN CERTIFICATE-----\nMIIB8zCCAZqgAwIBAgIUco2FwjyEAAcpmodHl4M42XkSJjAwCgYIKoZIzj0EAwIw\nJzElMCMGA1UEAwwcdmMtZGVtby5vcGVuY3J2cy5kZXYgUm9vdCBDQTAeFw0yNjAx\nMjgxMTMxMzlaFw0zNjAxMjYxMTMxMzlaMCcxJTAjBgNVBAMMHHZjLWRlbW8ub3Bl\nbmNydnMuZGV2IFJvb3QgQ0EwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASSpYU3\ngojMaNE/oorsidUg22JtXO3O9E4tIcEhhc8rlyLoVdXICIYFjVxAbJIYs1su5o2e\nMYPIKS0gMwoqkGFao4GjMIGgMB0GA1UdDgQWBBRKiabeGvmJ54E3s0Wb9dPV+nbD\nwTAfBgNVHSMEGDAWgBRKiabeGvmJ54E3s0Wb9dPV+nbDwTAPBgNVHRMBAf8EBTAD\nAQH/MA4GA1UdDwEB/wQEAwIBBjA9BgNVHREENjA0ghR2Yy1kZW1vLm9wZW5jcnZz\nLmRldoYcaHR0cHM6Ly92Yy1kZW1vLm9wZW5jcnZzLmRldjAKBggqhkjOPQQDAgNH\nADBEAiB00qzfBqNn+Vsjv4D++ZH5OK2cbebMD8mB7wLvF/yipgIgb4r6ThWjmwtf\n/PKHf/sW4z5VbcrZPdJBP1jH6cA8GoQ=\n-----END CERTIFICATE-----'
    ]
  }
}
