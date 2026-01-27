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
        kty: 'OKP',
        d: '2dQmjsyXThwBLALSYTj2lkgFif9vM-EXZ9asghs2c9k',
        crv: 'Ed25519',
        kid: '0',
        x: 'YGhGkVotqEto5cUGMFblSra8Y-UILePgOIH_-qnX3rc'
      }
    },
    issuerDid:
      'did:jwk:eyJjcnYiOiJFZDI1NTE5Iiwia2lkIjoiMCIsImt0eSI6Ik9LUCIsIngiOiJZR2hHa1ZvdHFFdG81Y1VHTUZibFNyYThZLVVJTGVQZ09JSF8tcW5YM3JjIn0',
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
    }
  }
}
