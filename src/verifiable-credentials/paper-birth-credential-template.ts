import { logger } from '@countryconfig/logger'
import { DEMO_ISSUER_DID, DEMO_ISSUER_KEY } from './birth-credential-template'
import { EventIndex, NameFieldValue } from '@opencrvs/toolkit/events'

function resolveRegistrationNumber(event: EventIndex) {
  const legalStatuses = event.legalStatuses as Record<
    string,
    { registrationNumber?: string } | undefined
  >

  return legalStatuses.REGISTERED?.registrationNumber || undefined
}

export function paperBirthCredentialTemplate(event: EventIndex) {
  logger.warn(
    `Passing issuer key UNSAFELY for paper birth credential template <event-id:${event.id}>! DO NOT USE IN PRODUCTION!`
  )

  const childName = event.declaration['child.name'] as NameFieldValue
  const registrationNumber = resolveRegistrationNumber(event)
  const dateOfEvent = event.dateOfEvent as string
  const subjectDid = `${event.id}`

  return {
    issuerKey: DEMO_ISSUER_KEY,
    issuerDid: DEMO_ISSUER_DID,
    subjectDid,
    credentialData: {
      id: event.id,
      type: ['VerifiableCredential', 'birth_paper_v1'],
      credentialSubject: {
        id: subjectDid,
        event_id: event.id,
        ...(registrationNumber
          ? { registration_number: registrationNumber }
          : {}),
        given_name: childName.firstname,
        family_name: childName.surname,
        birthdate: dateOfEvent
      }
    }
  }
}
