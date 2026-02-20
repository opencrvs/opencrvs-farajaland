/**
 * JWT VC payload data for a paper birth credential.
 *
 * This interface mirrors the `credentialData` structure produced by
 * `paperBirthCredentialTemplate` for issuance.
 */
export interface PaperBirthCredentialData {
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
