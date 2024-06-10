export type BirthInputDetails = {
  informant: {
    type: 'MOTHER' | 'FATHER' | 'BROTHER'
  }
  child: {
    firstNames: string
    familyName: string
    birthDate?: string
    gender: 'male' | 'female'
    birthType?: 'SINGLE' | 'MULTIPLE'
    weightAtBirth?: number
  }
  mother: {
    firstNames: string
    familyName: string
    birthDate?: string
    maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED'
  }
  father: {
    firstNames: string
    familyName: string
    birthDate?: string
  }
  attendant: {
    type: 'PHYSICIAN' | 'NURSE' | 'MIDWIFE' | 'OTHER'
  }
}

export type BirthDeclaration = {
  _fhirIDMap: string
  id: string
  child: {
    id: string
    identifier: {
      id: string
      type: string
      otherType?: string
    }[]
    name: {
      use: string
      firstNames: string
      middleName?: string
      familyName: string
    }[]
    birthDate: string
    gender: string
  }
  informant: {
    id: string
    relationship: string
    otherRelationship?: string
    _fhirIDPatient?: string
    identifier: {
      id: string
      type: string
      otherType?: string
      fieldsModifiedByIdentity?: string
    }[]
    name: {
      use: string
      firstNames: string
      middleName?: string
      familyName: string
    }[]
    occupation: string
    nationality: string
    birthDate: string
    ageOfIndividualInYears: number
    exactDateOfBirthUnknown: boolean
    address: {
      type: string
      line: string
      district: string
      state: string
      city: string
      postalCode: string
      country: string
    }
  }
  mother: {
    id: string
    name: {
      use: string
      firstNames: string
      middleName?: string
      familyName: string
    }[]
    multipleBirth: boolean
    birthDate: string
    maritalStatus: string
    occupation: string
    detailsExist: boolean
    reasonNotApplying?: string
    ageOfIndividualInYears: number
    exactDateOfBirthUnknown: boolean
    dateOfMarriage?: string
    educationalAttainment: string
    nationality: string
    identifier: {
      id: string
      type: string
      otherType?: string
      fieldsModifiedByIdentity?: string
    }[]
    address: {
      type: string
      line: string
      district: string
      state: string
      city: string
      postalCode: string
      country: string
    }
    telecom?: {
      system: string
      value: string
    }
  }
  father: {
    id: string
    name: {
      use: string
      firstNames: string
      middleName?: string
      familyName: string
    }[]
    birthDate: string
    maritalStatus: string
    occupation: string
    detailsExist: boolean
    reasonNotApplying?: string
    ageOfIndividualInYears: number
    exactDateOfBirthUnknown: boolean
    dateOfMarriage?: string
    educationalAttainment: string
    nationality: string
    identifier: {
      id: string
      type: string
      otherType?: string
      fieldsModifiedByIdentity?: string
    }[]
    address: {
      type: string
      line: string
      district: string
      state: string
      city: string
      postalCode: string
      country: string
    }
    telecom?: {
      system: string
      value: string
    }
  }
  registration: {
    id: string
    informantType: string
    otherInformantType?: string
    contact: string
    contactRelationship: string
    contactPhoneNumber: string
    contactEmail: string
    duplicates?: {
      compositionId: string
      trackingId: string
    }[]
    informantsSignature?: string
    informantsSignatureURI?: string
    attachments?: {
      data: string
      uri: string
      type: string
      contentType: string
      subject: string
    }[]
    status: {
      comments?: {
        comment: string
      }[]
      type: string
      timestamp: string
      office: {
        name: string
        alias: string
        address: {
          district: string
          state: string
        }
        partOf?: string
      }
    }[]
    type: string
    trackingId: string
    registrationNumber: string
    mosipAid?: string
  }
  attendantAtBirth?: string
  weightAtBirth?: string
  birthType?: string
  eventLocation?: {
    id: string
    type: string
    address: {
      line: string
      district: string
      state: string
      city: string
      postalCode: string
      country: string
    }
  }
  questionnaire?: {
    fieldId: string
    value: string
  }[]
  history?: {
    otherReason?: string
    requester?: string
    requesterOther?: string
    noSupportingDocumentationRequired?: boolean
    hasShowedVerifiedDocument?: boolean
    date: string
    action: string
    regStatus: string
    dhis2Notification?: boolean
    ipAddress?: string
    documents?: {
      id: string
      data: string
      uri: string
      type: string
    }[]
    payment?: {
      id: string
      type: string
      amount: string
      outcome: string
      date: string
      attachmentURL?: string
    }
    statusReason?: {
      text: string
    }
    reason?: string
    location?: {
      id: string
      name: string
    }
    office?: {
      id: string
      name: string
      alias: string
      address: {
        state: string
        district: string
      }
    }
    system?: {
      name: string
      type: string
    }
    user?: {
      id: string
      role?: {
        _id: string
        labels?: {
          lang: string
          label: string
        }[]
      }
      systemRole?: string
      name?: {
        firstNames: string
        familyName: string
        use: string
      }
      avatar?: {
        data: string
        type: string
      }
    }
    signature?: {
      data: string
      type: string
    }
    comments?: {
      user?: {
        id: string
        username: string
        avatar?: {
          data: string
          type: string
        }
      }
      comment: string
      createdAt: string
    }[]
    input?: {
      valueCode: string
      valueId: string
      value: string
    }[]
    output?: {
      valueCode: string
      valueId: string
      value: string
    }[]
    certificates?: {
      hasShowedVerifiedDocument?: boolean
      collector?: {
        relationship: string
        otherRelationship?: string
        name?: {
          use: string
          firstNames: string
          familyName: string
        }
        telecom?: {
          system: string
          value: string
          use: string
        }
      }
    }[]
    duplicateOf?: string
    potentialDuplicates?: string[]
  }[]
}
