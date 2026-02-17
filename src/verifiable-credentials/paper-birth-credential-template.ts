import { logger } from '@countryconfig/logger'
import { DEMO_ISSUER_DID, DEMO_ISSUER_KEY } from './birth-credential-template'
import { EventIndex, NameFieldValue } from '@opencrvs/toolkit/events'
import type { PaperBirthCredentialData } from './paper-birth-credential-definition'
import { v4 as uuidv4 } from 'uuid'

function resolveRegistrationNumber(event: EventIndex) {
  const legalStatuses = event.legalStatuses as Record<
    string,
    { registrationNumber?: string } | undefined
  >

  const registrationNumber = legalStatuses.REGISTERED?.registrationNumber

  if (!registrationNumber) {
    throw new Error(
      `Cannot issue paper birth credential without registration number <event-id:${event.id}>`
    )
  }

  return registrationNumber
}

export function paperBirthCredentialTemplate(event: EventIndex) {
  logger.warn(
    `Passing issuer key UNSAFELY for paper birth credential template <event-id:${event.id}>! DO NOT USE IN PRODUCTION!`
  )

  const childName = event.declaration['child.name'] as NameFieldValue
  const registrationNumber = resolveRegistrationNumber(event)
  const dateOfEvent = event.dateOfEvent as string
  const credentialId = uuidv4()
  const subjectId = event.id

  return {
    issuerKey: DEMO_ISSUER_KEY,
    issuerDid: DEMO_ISSUER_DID,
    subjectDid: subjectId,
    credentialData: {
      id: credentialId,
      type: ['VerifiableCredential', 'birth_paper_v1'],
      credentialSubject: {
        id: subjectId,
        brn: registrationNumber,
        given_name: childName.firstname,
        family_name: childName.surname,
        birthdate: dateOfEvent
      }
    } satisfies PaperBirthCredentialData
  }
}
