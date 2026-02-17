/**
 * JWT VC payload data for a paper birth credential.
 *
 * This interface mirrors the `credentialData` structure produced by
 * `paperBirthCredentialTemplate` for issuance.
 */
export interface PaperBirthCredentialData {
  /**
   * Credential identifier.
   */
  id: string
  /**
   * VC type list.
   */
  type: ['VerifiableCredential', 'birth_paper_v1']
  /**
   * Subject claims for the child this credential describes.
   */
  credentialSubject: {
    /** Subject identifier. */
    id: string
    /** Birth registration number. */
    brn: string
    /** Child given name. */
    given_name: string
    /** Child family name. */
    family_name: string
    /** Birth date in ISO 8601 (YYYY-MM-DD) format. */
    birthdate: string
  }
}
