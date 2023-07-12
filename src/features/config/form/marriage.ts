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
  formMessageDescriptors,
  informantMessageDescriptors
} from './formatjs-messages'
import {
  marriageDocumentForWhomFhirMapping,
  marriageDocumentTypeFhirMapping
} from './options'
import { ISerializedForm } from './types/types'

export const marriageRegisterForms: ISerializedForm = {
  sections: [
    {
      id: 'registration',
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
            {
              name: 'informantType',
              type: 'SELECT_WITH_OPTIONS',
              label: informantMessageDescriptors.birthInformantTitle,
              required: true,
              hideInPreview: false,
              initialValue: '',
              validator: [],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              mapping: {
                mutation: {
                  operation: 'sectionFieldToBundleFieldTransformer',
                  parameters: ['registration.informantType']
                },
                query: {
                  operation: 'bundleFieldToSectionFieldTransformer',
                  parameters: ['registration.informantType']
                },
                template: {
                  fieldName: 'informantType',
                  operation: 'selectTransformer'
                }
              },
              options: [
                {
                  value: 'GROOM',
                  label: informantMessageDescriptors.GROOM
                },
                {
                  value: 'BRIDE',
                  label: informantMessageDescriptors.BRIDE
                },
                {
                  value: 'OTHER',
                  label: informantMessageDescriptors.OTHER
                }
              ]
            },
            {
              name: 'otherInformantType',
              type: 'TEXT',
              label: formMessageDescriptors.informantsRelationWithChild,
              placeholder: formMessageDescriptors.relationshipPlaceHolder,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'englishOnlyNameFormat'
                }
              ],
              conditionals: [
                {
                  action: 'hide',
                  expression: 'values.informantType !== "OTHER"'
                }
              ],
              mapping: {
                mutation: {
                  operation: 'sectionFieldToBundleFieldTransformer',
                  parameters: ['registration.otherInformantType']
                },
                query: {
                  operation: 'bundleFieldToSectionFieldTransformer',
                  parameters: ['registration.otherInformantType']
                }
              }
            }
          ]
        },
        {
          id: 'contact-view-group',
          title: informantMessageDescriptors.selectContactPoint,
          conditionals: [],
          preventContinueIfError: true,
          showExitButtonOnly: true,
          previewGroups: [
            {
              id: 'contactPointGroup',
              label: formMessageDescriptors.reviewLabelMainContact,
              required: false,
              initialValue: '',
              fieldToRedirect: 'contactPoint'
            }
          ],
          fields: [
            {
              name: 'contactPoint',
              type: 'SELECT_WITH_OPTIONS',
              label: formMessageDescriptors.selectContactPoint,
              required: true,
              previewGroup: 'contactPointGroup',
              hideInPreview: false,
              initialValue: '',
              validator: [],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              mapping: {
                mutation: {
                  operation: 'sectionFieldToBundleFieldTransformer',
                  parameters: ['registration.contact']
                },
                query: {
                  operation: 'bundleFieldToSectionFieldTransformer',
                  parameters: ['registration.contact']
                },
                template: {
                  fieldName: 'contactPoint',
                  operation: 'selectTransformer'
                }
              },
              options: [
                {
                  value: 'GROOM',
                  label: informantMessageDescriptors.GROOM
                },
                {
                  value: 'BRIDE',
                  label: informantMessageDescriptors.BRIDE
                },
                {
                  value: 'OTHER',
                  label: informantMessageDescriptors.OTHER
                }
              ]
            },
            {
              name: 'registrationPhone',
              type: 'TEL',
              label: formMessageDescriptors.phoneNumber,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'phoneNumberFormat'
                }
              ],
              conditionals: [
                {
                  action: 'hide',
                  expression: 'values.contactPoint !== "OTHER"'
                }
              ],
              mapping: {
                mutation: {
                  operation: 'sectionFieldToBundleFieldTransformer',
                  parameters: ['registration.contactPhoneNumber']
                },
                query: {
                  operation: 'bundleFieldToSectionFieldTransformer',
                  parameters: ['registration.contactPhoneNumber']
                },
                template: {
                  fieldName: 'contactPhoneNumber',
                  operation: 'selectTransformer'
                }
              }
            }
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
            {
              name: 'nationality',
              type: 'SELECT_WITH_OPTIONS',
              label: formMessageDescriptors.nationality,
              required: true,
              initialValue: 'FAR',
              validator: [],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              options: {
                resource: 'countries'
              },
              mapping: {
                template: {
                  fieldName: 'groomNationality',
                  operation: 'nationalityTransformer'
                },
                mutation: {
                  operation: 'fieldToArrayTransformer'
                },
                query: {
                  operation: 'arrayToFieldTransformer'
                }
              }
            },
            {
              name: 'iD',
              type: 'TEXT',
              label: formMessageDescriptors.iDTypeNationalID,
              required: false,
              initialValue: '',
              validator: [
                {
                  operation: 'validIDNumber',
                  parameters: ['NATIONAL_ID']
                },
                {
                  operation: 'duplicateIDNumber',
                  parameters: ['bride.iD']
                }
              ],
              mapping: {
                template: {
                  fieldName: 'groomNID',
                  operation: 'identityToFieldTransformer',
                  parameters: ['id', 'NATIONAL_ID']
                },
                mutation: {
                  operation: 'fieldToIdentityTransformer',
                  parameters: ['id', 'NATIONAL_ID']
                },
                query: {
                  operation: 'identityToFieldTransformer',
                  parameters: ['id', 'NATIONAL_ID']
                }
              }
            },
            {
              name: 'groomBirthDate',
              type: 'DATE',
              label: formMessageDescriptors.dateOfBirth,
              conditionals: [
                {
                  action: 'disable',
                  expression: 'values.exactDateOfBirthUnknown'
                }
              ],
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'dateFormatIsCorrect',
                  parameters: []
                },
                {
                  operation: 'dateInPast',
                  parameters: []
                },
                {
                  operation: 'isValidDateOfBirthForMarriage',
                  parameters: ['groom', 18]
                }
              ],
              mapping: {
                template: {
                  operation: 'dateFormatTransformer',
                  fieldName: 'groomBirthDate',
                  parameters: ['birthDate', 'en', 'do MMMM yyyy']
                },
                mutation: {
                  operation: 'longDateTransformer',
                  parameters: ['birthDate']
                },
                query: {
                  operation: 'fieldValueTransformer',
                  parameters: ['birthDate']
                }
              }
            },
            {
              name: 'exactDateOfBirthUnknown',
              type: 'CHECKBOX',
              label: {
                defaultMessage: 'Exact date of birth unknown',
                description: 'Checkbox for exact date of birth unknown',
                id: 'form.field.label.exactDateOfBirthUnknown'
              },
              required: false,
              hideInPreview: true,
              hideHeader: true,
              initialValue: false,
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression: '!window.config.DATE_OF_BIRTH_UNKNOWN'
                }
              ],
              mapping: {
                query: {
                  operation: 'booleanTransformer'
                },
                mutation: {
                  operation: 'ignoreFieldTransformer'
                }
              }
            },
            {
              name: 'ageOfIndividualInYears',
              type: 'NUMBER',
              label: formMessageDescriptors.ageOfGroom,
              required: true,
              initialValue: '',
              conditionals: [
                {
                  action: 'hide',
                  expression: '!values.exactDateOfBirthUnknown'
                }
              ],
              validator: [
                {
                  operation: 'range',
                  parameters: [18, 120]
                },
                {
                  operation: 'maxLength',
                  parameters: [3]
                }
              ],
              postfix: 'years',
              inputFieldWidth: '78px'
            },
            {
              name: 'firstNamesEng',
              previewGroup: 'groomNameInEnglish',
              type: 'TEXT',
              label: formMessageDescriptors.firstName,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'englishOnlyNameFormat'
                }
              ],
              mapping: {
                template: {
                  fieldName: 'groomFirstName',
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'firstNames']
                },
                mutation: {
                  operation: 'fieldToNameTransformer',
                  parameters: ['en', 'firstNames']
                },
                query: {
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'firstNames']
                }
              }
            },
            {
              name: 'familyNameEng',
              previewGroup: 'groomNameInEnglish',
              type: 'TEXT',
              label: formMessageDescriptors.familyName,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'englishOnlyNameFormat'
                }
              ],
              mapping: {
                template: {
                  fieldName: 'groomFamilyName',
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'familyName']
                },
                mutation: {
                  operation: 'fieldToNameTransformer',
                  parameters: ['en', 'familyName']
                },
                query: {
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'familyName']
                }
              }
            },
            {
              name: 'marriedLastNameEng',
              previewGroup: 'marriedLastNameInEnglish',
              type: 'TEXT',
              label: formMessageDescriptors.marriedLastName,
              maxLength: 32,
              initialValue: '',
              required: false,
              validator: [
                {
                  operation: 'englishOnlyNameFormat'
                }
              ],
              mapping: {
                template: {
                  fieldName: 'marriedLastNameEng',
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'marriedLastName']
                },
                mutation: {
                  operation: 'fieldToNameTransformer',
                  parameters: ['en', 'marriedLastName']
                },
                query: {
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'marriedLastName']
                }
              }
            }
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
            {
              name: 'nationality',
              type: 'SELECT_WITH_OPTIONS',
              label: formMessageDescriptors.nationality,
              required: true,
              initialValue: 'FAR',
              validator: [],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              options: {
                resource: 'countries'
              },
              mapping: {
                template: {
                  fieldName: 'brideNationality',
                  operation: 'nationalityTransformer'
                },
                mutation: {
                  operation: 'fieldToArrayTransformer'
                },
                query: {
                  operation: 'arrayToFieldTransformer'
                }
              }
            },
            {
              name: 'iD',
              type: 'TEXT',
              label: formMessageDescriptors.iDTypeNationalID,
              required: false,
              initialValue: '',
              validator: [
                {
                  operation: 'validIDNumber',
                  parameters: ['NATIONAL_ID']
                },
                {
                  operation: 'duplicateIDNumber',
                  parameters: ['groom.iD']
                }
              ],
              mapping: {
                template: {
                  fieldName: 'brideNID',
                  operation: 'identityToFieldTransformer',
                  parameters: ['id', 'NATIONAL_ID']
                },
                mutation: {
                  operation: 'fieldToIdentityTransformer',
                  parameters: ['id', 'NATIONAL_ID']
                },
                query: {
                  operation: 'identityToFieldTransformer',
                  parameters: ['id', 'NATIONAL_ID']
                }
              }
            },
            {
              name: 'brideBirthDate',
              type: 'DATE',
              label: formMessageDescriptors.dateOfBirth,
              conditionals: [
                {
                  action: 'disable',
                  expression: 'values.exactDateOfBirthUnknown'
                }
              ],
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'dateFormatIsCorrect',
                  parameters: []
                },
                {
                  operation: 'dateInPast',
                  parameters: []
                },
                {
                  operation: 'isValidDateOfBirthForMarriage',
                  parameters: ['bride', 18]
                }
              ],
              mapping: {
                template: {
                  operation: 'dateFormatTransformer',
                  fieldName: 'brideBirthDate',
                  parameters: ['birthDate', 'en', 'do MMMM yyyy']
                },
                mutation: {
                  operation: 'longDateTransformer',
                  parameters: ['birthDate']
                },
                query: {
                  operation: 'fieldValueTransformer',
                  parameters: ['birthDate']
                }
              }
            },
            {
              name: 'exactDateOfBirthUnknown',
              type: 'CHECKBOX',
              label: {
                defaultMessage: 'Exact date of birth unknown',
                description: 'Checkbox for exact date of birth unknown',
                id: 'form.field.label.exactDateOfBirthUnknown'
              },
              required: false,
              hideInPreview: true,
              hideHeader: true,
              initialValue: false,
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression: '!window.config.DATE_OF_BIRTH_UNKNOWN'
                }
              ],
              mapping: {
                query: {
                  operation: 'booleanTransformer'
                },
                mutation: {
                  operation: 'ignoreFieldTransformer'
                }
              }
            },
            {
              name: 'ageOfIndividualInYears',
              type: 'NUMBER',
              label: formMessageDescriptors.ageOfBride,
              required: true,
              initialValue: '',
              conditionals: [
                {
                  action: 'hide',
                  expression: '!values.exactDateOfBirthUnknown'
                }
              ],
              validator: [
                {
                  operation: 'range',
                  parameters: [18, 120]
                },
                {
                  operation: 'maxLength',
                  parameters: [3]
                }
              ],

              postfix: 'years',
              inputFieldWidth: '78px'
            },
            {
              name: 'firstNamesEng',
              previewGroup: 'brideNameInEnglish',
              type: 'TEXT',
              label: formMessageDescriptors.firstName,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'englishOnlyNameFormat'
                }
              ],
              mapping: {
                template: {
                  fieldName: 'brideFirstName',
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'firstNames']
                },
                mutation: {
                  operation: 'fieldToNameTransformer',
                  parameters: ['en', 'firstNames']
                },
                query: {
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'firstNames']
                }
              }
            },
            {
              name: 'familyNameEng',
              previewGroup: 'brideNameInEnglish',
              type: 'TEXT',
              label: formMessageDescriptors.familyName,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'englishOnlyNameFormat'
                }
              ],
              mapping: {
                template: {
                  fieldName: 'brideFamilyName',
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'familyName']
                },
                mutation: {
                  operation: 'fieldToNameTransformer',
                  parameters: ['en', 'familyName']
                },
                query: {
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'familyName']
                }
              }
            },
            {
              name: 'marriedLastNameEng',
              previewGroup: 'marriedLastNameInEnglish',
              type: 'TEXT',
              label: formMessageDescriptors.marriedLastName,
              maxLength: 32,
              initialValue: '',
              required: false,
              validator: [
                {
                  operation: 'englishOnlyNameFormat'
                }
              ],
              mapping: {
                template: {
                  fieldName: 'marriedLastNameEng',
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'marriedLastName']
                },
                mutation: {
                  operation: 'fieldToNameTransformer',
                  parameters: ['en', 'marriedLastName']
                },
                query: {
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'marriedLastName']
                }
              }
            }
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
            {
              name: 'marriageDate',
              type: 'DATE',
              label: formMessageDescriptors.marriageEventDate,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'checkMarriageDate',
                  parameters: [18]
                }
              ],
              mapping: {
                template: {
                  operation: 'marriageDateFormatTransformation',
                  fieldName: 'eventDate',
                  parameters: ['en', 'do MMMM yyyy', ['bride', 'groom']]
                },
                mutation: {
                  operation: 'fieldToMarriageDateTransformation',
                  parameters: [
                    ['bride', 'groom'],
                    {
                      operation: 'longDateTransformer',
                      parameters: []
                    }
                  ]
                },
                query: {
                  operation: 'marriageDateToFieldTransformation',
                  parameters: [['bride', 'groom']]
                }
              }
            },
            {
              name: 'typeOfMarriage',
              type: 'SELECT_WITH_OPTIONS',
              label: formMessageDescriptors.typeOfMarriage,
              required: false,
              initialValue: '',
              validator: [],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              options: [
                {
                  value: 'MONOGAMY',
                  label: formMessageDescriptors.monogamy
                },
                {
                  value: 'POLYGAMY',
                  label: formMessageDescriptors.polygamy
                }
              ],
              mapping: {
                mutation: {
                  operation: 'sectionFieldToBundleFieldTransformer',
                  parameters: ['typeOfMarriage']
                },
                query: {
                  operation: 'bundleFieldToSectionFieldTransformer',
                  parameters: ['typeOfMarriage']
                },
                template: {
                  fieldName: 'typeOfMarriage',
                  operation: 'selectTransformer'
                }
              }
            },
            {
              name: 'placeOfMarriageTitle',
              type: 'SUBSECTION',
              label: formMessageDescriptors.placeOfMarriage,
              previewGroup: 'placeOfMarriage',
              ignoreBottomMargin: true,
              initialValue: '',
              validator: []
            }
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
            {
              name: 'firstNamesEng',
              previewGroup: 'witnessOneNameInEnglish',
              type: 'TEXT',
              label: formMessageDescriptors.firstName,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'englishOnlyNameFormat'
                }
              ],
              mapping: {
                mutation: {
                  operation: 'fieldValueNestingTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'fieldToNameTransformer',
                      parameters: ['en', 'firstNames']
                    },
                    'name'
                  ]
                },
                query: {
                  operation: 'nestedValueToFieldTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'nameToFieldTransformer',
                      parameters: ['en', 'firstNames']
                    }
                  ]
                },
                template: {
                  fieldName: 'witnessOneFirstName',
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'firstNames', 'informant', 'individual']
                }
              }
            },
            {
              name: 'familyNameEng',
              previewGroup: 'witnessOneNameInEnglish',
              type: 'TEXT',
              label: formMessageDescriptors.familyName,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'englishOnlyNameFormat'
                }
              ],
              mapping: {
                mutation: {
                  operation: 'fieldValueNestingTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'fieldToNameTransformer',
                      parameters: ['en', 'familyName']
                    },
                    'name'
                  ]
                },
                query: {
                  operation: 'nestedValueToFieldTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'nameToFieldTransformer',
                      parameters: ['en', 'familyName']
                    }
                  ]
                },
                template: {
                  fieldName: 'witnessOneFamilyName',
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'familyName', 'informant', 'individual']
                }
              }
            },
            {
              name: 'relationship',
              type: 'SELECT_WITH_OPTIONS',
              label: formMessageDescriptors.relationshipToSpouses,
              required: true,
              initialValue: '',
              validator: [],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              mapping: {
                template: {
                  fieldName: 'witnessTwoRelationship',
                  operation: 'selectTransformer'
                }
              },
              options: [
                {
                  value: 'headOfGroomFamily',
                  label: formMessageDescriptors.headOfGroomFamily
                },
                {
                  value: 'other',
                  label: formMessageDescriptors.other
                }
              ]
            },
            {
              name: 'otherRelationship',
              type: 'TEXT',
              label: formMessageDescriptors.other,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression: '(values.relationship!="other")'
                }
              ]
            }
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
      ],
      mapping: {
        mutation: {
          operation: 'setInformantSectionTransformer'
        },
        query: {
          operation: 'getInformantSectionTransformer'
        }
      }
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
            {
              name: 'firstNamesEng',
              previewGroup: 'witnessTwoNameInEnglish',
              type: 'TEXT',
              label: formMessageDescriptors.firstName,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'englishOnlyNameFormat'
                }
              ],
              mapping: {
                mutation: {
                  operation: 'fieldValueNestingTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'fieldToNameTransformer',
                      parameters: ['en', 'firstNames']
                    },
                    'name'
                  ]
                },
                query: {
                  operation: 'nestedValueToFieldTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'nameToFieldTransformer',
                      parameters: ['en', 'firstNames']
                    }
                  ]
                },
                template: {
                  fieldName: 'witnessTwoFirstName',
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'firstNames', 'informant', 'individual']
                }
              }
            },
            {
              name: 'familyNameEng',
              previewGroup: 'witnessTwoNameInEnglish',
              type: 'TEXT',
              label: formMessageDescriptors.familyName,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [
                {
                  operation: 'englishOnlyNameFormat'
                }
              ],
              mapping: {
                mutation: {
                  operation: 'fieldValueNestingTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'fieldToNameTransformer',
                      parameters: ['en', 'familyName']
                    },
                    'name'
                  ]
                },
                query: {
                  operation: 'nestedValueToFieldTransformer',
                  parameters: [
                    'individual',
                    {
                      operation: 'nameToFieldTransformer',
                      parameters: ['en', 'familyName']
                    }
                  ]
                },
                template: {
                  fieldName: 'witnessTwoFamilyName',
                  operation: 'nameToFieldTransformer',
                  parameters: ['en', 'familyName', 'informant', 'individual']
                }
              }
            },
            {
              name: 'relationship',
              type: 'SELECT_WITH_OPTIONS',
              label: formMessageDescriptors.relationshipToSpouses,
              required: true,
              initialValue: '',
              validator: [],
              placeholder: formMessageDescriptors.formSelectPlaceholder,
              options: [
                {
                  value: 'headOfBrideFamily',
                  label: formMessageDescriptors.headOfBrideFamily
                },
                {
                  value: 'other',
                  label: formMessageDescriptors.other
                }
              ]
            },
            {
              name: 'otherRelationship',
              type: 'TEXT',
              label: formMessageDescriptors.other,
              maxLength: 32,
              required: true,
              initialValue: '',
              validator: [],
              conditionals: [
                {
                  action: 'hide',
                  expression: '(values.relationship!="other")'
                }
              ]
            }
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
      ],
      mapping: {
        mutation: {
          operation: 'setInformantSectionTransformer'
        },
        query: {
          operation: 'getInformantSectionTransformer'
        }
      }
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
