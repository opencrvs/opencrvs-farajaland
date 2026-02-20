import { EventIndex, NameFieldValue } from '@opencrvs/toolkit/events'
import type { PaperBirthCredentialData } from './paper-birth-credential-definition'
import { v4 as uuidv4 } from 'uuid'

export function paperBirthCredentialTemplate(event: EventIndex) {
  const childName = event.declaration['child.name'] as NameFieldValue
  const registrationNumber = event.legalStatuses.REGISTERED!.registrationNumber // non-null assertion is safe because this template should only be used for registered events
  const dateOfEvent = event.dateOfEvent as string
  const subjectId = event.id

  return {
    subjectDid: subjectId,
    credentialData: {
      id: uuidv4(),
      type: ['VerifiableCredential', 'birth_paper_v1'],
      credentialSubject: {
        id: subjectId,
        brn: registrationNumber,
        given_name: childName.firstname,
        family_name: childName.surname,
        birthdate: dateOfEvent
      } satisfies PaperBirthCredentialData
    }
  }
}
