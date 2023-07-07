/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import {
  exactDateOfBirthUnknown,
  getAgeOfIndividualInYears,
  getBirthDate,
  registrationEmail,
  registrationPhone
} from './common-optional-fields'
import {
  getFamilyNameField,
  getFirstNameField,
  getNationalID,
  getNationality,
  otherInformantType
} from './common-required-fields'
import {
  formMessageDescriptors,
  informantMessageDescriptors
} from './formatjs-messages'
import {
  getMarriedLastName,
  getTypeOfMarriage,
  placeOfMarriageSubsection
} from './marriage/optional-fields-marriage'
import {
  brideOrGroomBirthDateValidators,
  getMarriageDate,
  getRelationshipToSpousesForWitness,
  marriageInformantType,
  witnessName,
  witnessRelationshipForOthers
} from './marriage/required-fields-marriage'
import {
  marriageDocumentForWhomFhirMapping,
  marriageDocumentTypeFhirMapping
} from './options'
import { ISerializedForm } from './types'
import { exactDateOfBirthUnknownConditional } from './validations-and-conditionals'

export const marriageRegisterForms: ISerializedForm = {
  sections: [
    {
      id: 'registration',
      viewType: 'hidden',
      name: {
        defaultMessage: 'Registration',
        description: 'Form section name for Registration',
        id: 'form.section.declaration.name'
      },
      groups: [],
      mapping: {
        template: [
          {
            fieldName: 'registrationNumber',
            operation: 'registrationNumberTransformer'
          },
          {
            fieldName: 'qrCode',
            operation: 'QRCodeTransformerTransformer'
          },
          {
            fieldName: 'certificateDate',
            operation: 'certificateDateTransformer',
            parameters: ['en', 'dd MMMM yyyy']
          },
          {
            fieldName: 'registrar',
            operation: 'userTransformer',
            parameters: ['REGISTERED']
          },
          {
            fieldName: 'registrationAgent',
            operation: 'userTransformer',
            parameters: ['VALIDATED']
          },
          // backward compatibility
          {
            fieldName: 'registrarName',
            operation: 'registrarNameUserTransformer'
          },
          {
            fieldName: 'role',
            operation: 'roleUserTransformer'
          },
          {
            fieldName: 'registrarSignature',
            operation: 'registrarSignatureUserTransformer'
          },
          {
            fieldName: 'registrationDate',
            operation: 'registrationDateTransformer',
            parameters: ['en', 'dd MMMM yyyy']
          },
          {
            fieldName: 'registrationLocation',
            operation: 'registrationLocationUserTransformer'
          }
        ],
        mutation: {
          operation: 'setMarriageRegistrationSectionTransformer'
        },
        query: {
          operation: 'getMarriageRegistrationSectionTransformer'
        }
      }
    },
    {
      id: 'informant',
      viewType: 'form',
      name: formMessageDescriptors.registrationName,
      title: formMessageDescriptors.registrationTitle,
      groups: [
        {
          id: 'who-is-applying-view-group',
          title: informantMessageDescriptors.marriageInformantTitle,
          conditionals: [],
          preventContinueIfError: true,
          showExitButtonOnly: true,
          fields: [
            marriageInformantType,
            otherInformantType,
            registrationPhone,
            registrationEmail
          ]
        }
      ],
      mapping: {
        template: [
          {
            fieldName: 'registrationNumber',
            operation: 'registrationNumberTransformer'
          },
          {
            fieldName: 'certificateDate',
            operation: 'certificateDateTransformer',
            parameters: ['en', 'dd MMMM yyyy']
          },
          {
            fieldName: 'registrarName',
            operation: 'registrarNameUserTransformer'
          },
          {
            fieldName: 'role',
            operation: 'roleUserTransformer'
          },
          {
            fieldName: 'registrarSignature',
            operation: 'registrarSignatureUserTransformer'
          },
          {
            fieldName: 'registrationDate',
            operation: 'registrationDateTransformer',
            parameters: ['en', 'dd MMMM yyyy']
          },
          {
            fieldName: 'registrationLocation',
            operation: 'registrationLocationUserTransformer'
          },
          {
            fieldName: 'groomSignature',
            operation: 'groomSignatureTransformer'
          },
          {
            fieldName: 'brideSignature',
            operation: 'brideSignatureTransformer'
          },
          {
            fieldName: 'witnessOneSignature',
            operation: 'witnessOneSignatureTransformer'
          },
          {
            fieldName: 'witnessTwoSignature',
            operation: 'witnessTwoSignatureTransformer'
          }
        ],
        mutation: {
          operation: 'setMarriageRegistrationSectionTransformer'
        },
        query: {
          operation: 'getMarriageRegistrationSectionTransformer'
        }
      }
    },
    {
      id: 'groom',
      viewType: 'form',
      name: formMessageDescriptors.groomName,
      title: formMessageDescriptors.groomTitle,
      groups: [
        {
          id: 'groom-view-group',
          fields: [
            getFirstNameField('groomNameInEnglish', [], 'groomFirstName'),
            getFamilyNameField('groomNameInEnglish', [], 'groomFamilyName'),
            getBirthDate(
              'groomBirthDate',
              [],
              brideOrGroomBirthDateValidators('groom'),
              'groomBirthDate'
            ),
            exactDateOfBirthUnknown,
            getAgeOfIndividualInYears(
              formMessageDescriptors.ageOfGroom,
              exactDateOfBirthUnknownConditional
            ),
            getNationality('groomNationality', []),
            getNationalID(
              'iD',
              [],
              [
                {
                  operation: 'validIDNumber',
                  parameters: ['NATIONAL_ID']
                },
                {
                  operation: 'duplicateIDNumber',
                  parameters: ['bride.iD']
                }
              ],
              'groomNID'
            ),
            getMarriedLastName
            // PRIMARY ADDRESS SUBSECTION
            // PRIMARY ADDRESS
            // SECONDARY ADDRESS SAME AS PRIMARY
            // SECONDARY ADDRESS SUBSECTION
            // SECONDARY ADDRESS
          ],
          previewGroups: [
            {
              id: 'groomNameInEnglish',
              label: {
                defaultMessage: 'Full name',
                description: "Group label for groom's name in english",
                id: 'form.preview.group.label.groom.english.name'
              },
              fieldToRedirect: 'familyNameEng',
              delimiter: ' '
            }
          ]
        }
      ]
    },
    {
      id: 'bride',
      viewType: 'form',
      name: formMessageDescriptors.brideName,
      title: formMessageDescriptors.brideTitle,
      groups: [
        {
          id: 'bride-view-group',
          fields: [
            getFirstNameField('brideNameInEnglish', [], 'brideFirstName'),
            getFamilyNameField('brideNameInEnglish', [], 'brideFamilyName'),
            getBirthDate(
              'brideBirthDate',
              [],
              brideOrGroomBirthDateValidators('bride'),
              'brideBirthDate'
            ),
            exactDateOfBirthUnknown,
            getAgeOfIndividualInYears(formMessageDescriptors.ageOfBride, [
              {
                action: 'hide',
                expression: '!values.exactDateOfBirthUnknown'
              }
            ]),
            getNationality('brideNationality', []),
            getNationalID(
              'iD',
              [],
              [
                {
                  operation: 'validIDNumber',
                  parameters: ['NATIONAL_ID']
                },
                {
                  operation: 'duplicateIDNumber',
                  parameters: ['groom.iD']
                }
              ],
              'brideNID'
            ),
            getMarriedLastName
            // PRIMARY ADDRESS SUBSECTION
            // PRIMARY ADDRESS
            // SECONDARY ADDRESS SUBSECTION
            // SECONDARY ADDRESS
          ],
          previewGroups: [
            {
              id: 'brideNameInEnglish',
              label: {
                defaultMessage: 'Full name',
                description: "Group label for bride's name in english",
                id: 'form.preview.group.label.bride.english.name'
              },
              fieldToRedirect: 'familyNameEng',
              delimiter: ' '
            }
          ]
        }
      ]
    },
    {
      id: 'marriageEvent',
      viewType: 'form',
      name: formMessageDescriptors.marriageEventName,
      title: formMessageDescriptors.marriageEventTitle,
      groups: [
        {
          id: 'marriage-event-details',
          fields: [
            getMarriageDate,
            getTypeOfMarriage,
            placeOfMarriageSubsection
          ]
        }
      ]
    },
    {
      id: 'witnessOne',
      viewType: 'form',
      name: formMessageDescriptors.witnessName,
      title: formMessageDescriptors.witnessOneTitle,
      groups: [
        {
          id: 'witness-view-group',
          fields: [
            witnessName(
              'firstNamesEng',
              'witnessOneNameInEnglish',
              'witnessOneFirstName',
              'firstNames',
              'firstName'
            ),
            witnessName(
              'familyNameEng',
              'witnessOneNameInEnglish',
              'witnessOneFamilyName',
              'familyName',
              'familyName'
            ),
            getRelationshipToSpousesForWitness,
            witnessRelationshipForOthers
          ],
          previewGroups: [
            {
              id: 'witnessOneNameInEnglish',
              label: {
                defaultMessage: 'Full name',
                description: 'Label for Witness one name in english',
                id: 'form.preview.group.label.witness.one.english.name'
              },
              fieldToRedirect: 'witnessOneFamilyNameEng',
              delimiter: ' '
            }
          ]
        }
      ]
    },
    {
      id: 'witnessTwo',
      viewType: 'form',
      name: formMessageDescriptors.witnessName,
      title: formMessageDescriptors.witnessTwoTitle,
      groups: [
        {
          id: 'witness-view-group',
          fields: [
            witnessName(
              'firstNamesEng',
              'witnessTwoNameInEnglish',
              'witnessTwoFirstName',
              'firstNames',
              'firstName'
            ),
            witnessName(
              'familyNameEng',
              'witnessTwoNameInEnglish',
              'witnessTwoFamilyName',
              'familyName',
              'familyName'
            ),
            getRelationshipToSpousesForWitness,
            witnessRelationshipForOthers
          ],
          previewGroups: [
            {
              id: 'witnessTwoNameInEnglish',
              label: {
                defaultMessage: 'Full name',
                description: 'Label for Witness two name in english',
                id: 'form.preview.group.label.witness.two.english.name'
              },
              fieldToRedirect: 'witnessTwoFamilyNameEng',
              delimiter: ' '
            }
          ]
        }
      ]
    },
    {
      id: 'documents',
      viewType: 'form',
      name: formMessageDescriptors.documentsName,
      title: {
        defaultMessage: 'Attaching supporting documents',
        description: 'Form section title for Documents',
        id: 'form.section.documents.title'
      },
      groups: [
        {
          id: 'documents-view-group',
          fields: [
            {
              name: 'paragraph',
              type: 'PARAGRAPH',
              label: formMessageDescriptors.documentsParagraph,
              initialValue: '',
              validator: []
            },
            {
              name: 'uploadDocForMarriageProof',
              type: 'DOCUMENT_UPLOADER_WITH_OPTION',
              label: formMessageDescriptors.proofOfMarriageNotice,
              required: false,
              initialValue: '',
              extraValue:
                marriageDocumentForWhomFhirMapping.MARRIAGE_NOTICE_PROOF,
              hideAsterisk: true,
              validator: [],
              options: [
                {
                  value: marriageDocumentTypeFhirMapping.MARRIAGE_NOTICE,
                  label: formMessageDescriptors.docTypeMarriageNotice
                }
              ],
              mapping: {
                mutation: {
                  operation: 'eventFieldToAttachmentTransformer'
                },
                query: {
                  operation: 'eventAttachmentToFieldTransformer'
                }
              }
            },
            {
              name: 'uploadDocForGroom',
              type: 'DOCUMENT_UPLOADER_WITH_OPTION',
              label: formMessageDescriptors.proofOfGroomsID,
              initialValue: '',
              extraValue: marriageDocumentForWhomFhirMapping.GROOM,
              hideAsterisk: true,
              required: false,
              validator: [],
              options: [
                {
                  value: marriageDocumentTypeFhirMapping.NATIONAL_ID,
                  label: formMessageDescriptors.docTypeNID
                },
                {
                  value: marriageDocumentTypeFhirMapping.PASSPORT,
                  label: formMessageDescriptors.docTypePassport
                },
                {
                  value: marriageDocumentTypeFhirMapping.BIRTH_CERTIFICATE,
                  label: formMessageDescriptors.docTypeBirthCert
                },
                {
                  value: marriageDocumentTypeFhirMapping.OTHER,
                  label: formMessageDescriptors.docTypeOther
                }
              ],
              mapping: {
                mutation: {
                  operation: 'eventFieldToAttachmentTransformer'
                },
                query: {
                  operation: 'eventAttachmentToFieldTransformer'
                }
              }
            },
            {
              name: 'uploadDocForBride',
              type: 'DOCUMENT_UPLOADER_WITH_OPTION',
              label: formMessageDescriptors.proofOfBridesID,
              initialValue: '',
              required: false,
              extraValue: marriageDocumentForWhomFhirMapping.BRIDE,
              hideAsterisk: true,
              validator: [],
              options: [
                {
                  value: marriageDocumentTypeFhirMapping.NATIONAL_ID,
                  label: formMessageDescriptors.docTypeNID
                },
                {
                  value: marriageDocumentTypeFhirMapping.PASSPORT,
                  label: formMessageDescriptors.docTypePassport
                },
                {
                  value: marriageDocumentTypeFhirMapping.BIRTH_CERTIFICATE,
                  label: formMessageDescriptors.docTypeBirthCert
                },
                {
                  value: marriageDocumentTypeFhirMapping.OTHER,
                  label: formMessageDescriptors.docTypeOther
                }
              ],
              mapping: {
                mutation: {
                  operation: 'eventFieldToAttachmentTransformer'
                },
                query: {
                  operation: 'eventAttachmentToFieldTransformer'
                }
              }
            }
          ]
        }
      ]
    }
  ]
}
