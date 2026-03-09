import { EventIndex, NameFieldValue } from '@opencrvs/toolkit/events'
import type { PaperBirthCredentialData } from './paper-birth-credential-definition'
import { v5 as uuidv5 } from 'uuid'

const PAPER_BIRTH_SUBJECT_DID_PREFIX = 'urn:farajaland:paper-birth-subject:'
const PAPER_BIRTH_SUBJECT_DID_NAMESPACE = 'b8be09fa-a9b9-4b9f-8d15-40f4696e9f8e'

export function paperBirthCredentialTemplate(event: EventIndex) {
  const childName = event.declaration['child.name'] as NameFieldValue
  const registrationNumber = event.legalStatuses.REGISTERED!.registrationNumber // non-null assertion is safe because this template should only be used for registered events
  const dateOfEvent = event.dateOfEvent as string
  const subjectId = uuidv5(
    registrationNumber,
    PAPER_BIRTH_SUBJECT_DID_NAMESPACE
  )

  return {
    // `subjectDid` becomes JWT `sub`. Keep it pseudonymous and stable, and do not leak internal DB IDs.
    subjectDid: `${PAPER_BIRTH_SUBJECT_DID_PREFIX}${subjectId}`,
    credentialData: {
      type: ['VerifiableCredential', 'farajaland_birth_paper_v1'],
      credentialSubject: {
        // `rn` is the legal birth registration number (record identifier), not the credential identifier.
        rn: registrationNumber,
        gn: childName.firstname,
        fn: childName.surname,
        dob: dateOfEvent
      } satisfies PaperBirthCredentialData
    }
  }
}
