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
        d: 'mDhpwaH6JYSrD2Bq7Cs-pzmsjlLj4EOhxyI-9DM1mFI',
        crv: 'Ed25519',
        kid: 'Vzx7l5fh56F3Pf9aR3DECU5BwfrY6ZJe05aiWYWzan8',
        x: 'T3T4-u1Xz3vAV2JwPNxWfs4pik_JLiArz_WTCvrCFUM'
      }
    },
    issuerDid: 'did:key:z6MkjoRhq1jSNJdLiruSXrFFxagqrztZaXHqHGUTKJbcNywp',
    credentialConfigurationId: 'crvs_birth_v1',
    credentialData: {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://schemas.opencrvs.org/birth-certificate.json'
      ],
      id: 'urn:uuid:THIS WILL BE REPLACED WITH DYNAMIC DATA FUNCTION (see below)',
      type: ['VerifiableCredential', 'BirthCertificateCredential'],
      credentialSubject: {
        given_name: childName.firstname,
        family_name: childName.surname,
        birthdate: dateOfEvent,
        place_of_birth: 'Chamakubi Health Post, Ibombo, Central, Farajaland',
        id: '<subjectDid>'
      }
    },
    mapping: {
      id: '<uuid>',
      iss: 'did:web:vc-demo.opencrvs.dev',
      credentialSubject: {
        id: '<subjectDid>'
      },
      issuanceDate: '<timestamp>',
      expirationDate: '<timestamp-in:365d>'
    },
    selectiveDisclosure: {
      fields: {
        'credentialSubject.given_name': {
          sd: true
        },
        'credentialSubject.family_name': {
          sd: true
        },
        'credentialSubject.birthdate': {
          sd: true
        },
        'credentialSubject.place_of_birth': {
          sd: true
        }
      }
    }
  }
}
