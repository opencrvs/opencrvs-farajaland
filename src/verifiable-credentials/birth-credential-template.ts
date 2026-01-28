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
        d: 'mRBPit9_rAbHQYvNryui2dUGD1jcCujw6tKuDfxyCMc',
        crv: 'P-256',
        kid: '3-uO1nzhTm6-8xDcbtir07GDwSuutDHbfKj5PVYF5Vo',
        x: '_HjVaFEFG2KdAUSThLfJxIqXQeQcVQ6Vp0Z7fF_Xbxw',
        y: '1IOLn3cyQCbbPnWroO1vNfnwql2bu2BtfLH1WQyIcOY'
      }
    },
    issuerDid:
      'did:jwk:eyJjcnYiOiJQLTI1NiIsImtpZCI6IjMtdU8xbnpoVG02LTh4RGNidGlyMDdHRHdTdXV0REhiZktqNVBWWUY1Vm8iLCJrdHkiOiJFQyIsIngiOiJfSGpWYUZFRkcyS2RBVVNUaExmSnhJcVhRZVFjVlE2VnAwWjdmRl9YYnh3IiwieSI6IjFJT0xuM2N5UUNiYlBuV3JvTzF2TmZud3FsMmJ1MkJ0ZkxIMVdReUljT1kifQ',
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
      '-----BEGIN CERTIFICATE-----\nMIIBxDCCAWqgAwIBAgIUO2py5HB6G0XKrcnSQmY4Ko6PmGkwCgYIKoZIzj0EAwIw\nJzElMCMGA1UEAwwcdmMtZGVtby5vcGVuY3J2cy5kZXYgUm9vdCBDQTAeFw0yNjAx\nMjgwOTAwNDVaFw0zNjAxMjYwOTAwNDVaMB8xHTAbBgNVBAMMFHZjLWRlbW8ub3Bl\nbmNydnMuZGV2MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE/HjVaFEFG2KdAUST\nhLfJxIqXQeQcVQ6Vp0Z7fF/XbxzUg4ufdzJAJts+daug7W81+fCqXZu7YG18sfVZ\nDIhw5qN8MHowCQYDVR0TBAIwADAOBgNVHQ8BAf8EBAMCB4AwHQYDVR0lBBYwFAYI\nKwYBBQUHAwIGCCsGAQUFBwMBMB0GA1UdDgQWBBR/X6Pa7VaquLJhDO96ReyRJyOJ\nVzAfBgNVHSMEGDAWgBS6UlfiDSp0FaiXr0impWL1wX1bsjAKBggqhkjOPQQDAgNI\nADBFAiAt2/6fw+iLlDOPNMNv4vDl/DHSrHoVGv3otvU2h1tNJwIhAMTLDUXm/RMK\ngJEyNh8i5xy6Izl9wb0MQJK7bG8ZCdLb\n-----END CERTIFICATE-----',
      '-----BEGIN CERTIFICATE-----\nMIIBszCCAVmgAwIBAgIUWj4tLgEQCFWc6kxWzdlPwP0WS5QwCgYIKoZIzj0EAwIw\nJzElMCMGA1UEAwwcdmMtZGVtby5vcGVuY3J2cy5kZXYgUm9vdCBDQTAeFw0yNjAx\nMjgwOTAwNDVaFw0zNjAxMjYwOTAwNDVaMCcxJTAjBgNVBAMMHHZjLWRlbW8ub3Bl\nbmNydnMuZGV2IFJvb3QgQ0EwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQGd7Rg\nFSCFBjPwE47nOaN36SIIkAI7IGxrHwDOnBzCrvYtaBocfN4Q6vu95WJk/Ba6O14k\nzyuDIc2PSzu3+YLFo2MwYTAdBgNVHQ4EFgQUulJX4g0qdBWol69IpqVi9cF9W7Iw\nHwYDVR0jBBgwFoAUulJX4g0qdBWol69IpqVi9cF9W7IwDwYDVR0TAQH/BAUwAwEB\n/zAOBgNVHQ8BAf8EBAMCAQYwCgYIKoZIzj0EAwIDSAAwRQIhAOP5NnI1XL0yqxc3\nage1Gg2VvO4oe5E3Sf/Y54MdiAPVAiAByuxMocqKVxxHSJFDcbD37pXFcVB05z8r\n3hwSaDZ/eA==\n-----END CERTIFICATE-----'
    ]
  }
}
