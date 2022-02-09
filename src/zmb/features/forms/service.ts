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
import { readFile } from 'fs'
import fetch from 'node-fetch'
import { join } from 'path'
import { userSection } from './user/userSection'

interface IForm {
  sections: Array<any> // no point defining full types here as we don't use them
}

interface INameField {
  firstNamesField: string
  familyNameField: string
}
interface INameFields {
  [language: string]: INameField
}

interface ICollectorField {
  identifierTypeField: string
  identifierOtherTypeField: string
  identifierField: string
  nameFields: INameFields
  birthDateField: string
  nationalityField: string
}

interface ICertificateCollectorDefinition {
  [collector: string]: ICollectorField
}
export interface IForms {
  registerForm: {
    birth: IForm
    death: IForm
  }
  certificateCollectorDefinition: {
    birth: ICertificateCollectorDefinition
    death: ICertificateCollectorDefinition
  }
}

export interface IOptions {
  label: string
  value: string
}

export interface IFhirResourceData {
  valueQuantity: IFhirResourceDataValueQuantity
}

export interface IFhirResourceDataValueQuantity {
  unit?: string
  system?: string
  code?: string
  value?: string
}
export interface IMessageDescriptor {
    defaultMessage: string
    description: string
    id: string
}

export interface IFhirResource {
  type: string
  code?: string
  description?: string
  categoryCode?: string
  categoryDescription?: string
  data: IFhirResourceData
  valueField: string // valueField defines the path in the data object where the field value is written
}

export enum FieldType {
  TEXT = 'TEXT',
  TEL = 'TEL',
  NUMBER = 'NUMBER',
  BIG_NUMBER = 'BIG_NUMBER',
  RADIO_GROUP = 'RADIO_GROUP',
  RADIO_GROUP_WITH_NESTED_FIELDS = 'RADIO_GROUP_WITH_NESTED_FIELDS',
  INFORMATIVE_RADIO_GROUP = 'INFORMATIVE_RADIO_GROUP',
  CHECKBOX_GROUP = 'CHECKBOX_GROUP',
  DATE = 'DATE',
  TEXTAREA = 'TEXTAREA',
  SUBSECTION = 'SUBSECTION',
  FIELD_GROUP_TITLE = 'FIELD_GROUP_TITLE',
  LIST = 'LIST',
  PARAGRAPH = 'PARAGRAPH',
  DOCUMENTS = 'DOCUMENTS',
  SELECT_WITH_OPTIONS = 'SELECT_WITH_OPTIONS',
  SELECT_WITH_DYNAMIC_OPTIONS = 'SELECT_WITH_DYNAMIC_OPTIONS',
  FIELD_WITH_DYNAMIC_DEFINITIONS = 'FIELD_WITH_DYNAMIC_DEFINITIONS',
  IMAGE_UPLOADER_WITH_OPTIONS = 'IMAGE_UPLOADER_WITH_OPTIONS',
  DOCUMENT_UPLOADER_WITH_OPTION = 'DOCUMENT_UPLOADER_WITH_OPTION',
  SIMPLE_DOCUMENT_UPLOADER = 'SIMPLE_DOCUMENT_UPLOADER',
  WARNING = 'WARNING',
  LINK = 'LINK',
  PDF_DOCUMENT_VIEWER = 'PDF_DOCUMENT_VIEWER',
  DYNAMIC_LIST = 'DYNAMIC_LIST',
  FETCH_BUTTON = 'FETCH_BUTTON',
  LOCATION_SEARCH_INPUT = 'LOCATION_SEARCH_INPUT'
}

export interface IQuestion {
  fieldId: string
  fhirSectionCode: string
  fhirResource: IFhirResource
  label: IMessageDescriptor
  placeholder?: string
  maxLength?: number
  options?: IOptions[]
  fieldName: string
  fieldType: FieldType
  sectionPositionForField: number
  enabled: boolean
  required: boolean
  custom: boolean
}

export async function getForms(): Promise<IForms> {
  return new Promise((resolve, reject) => {
    readFile(join(__dirname, './register.json'), (err, data) => {
      const forms = { ...JSON.parse(data.toString()), userForm: userSection }
      err ? reject(err) : resolve(forms)
    })
  })
}

export function populateQuestionsFromSource(source: any) {
  /*const registerForm = source.registerForm
  Object.keys(registerForm).forEach(event => {
    registerForm[event].sections.forEach((section: any) => {
      section.groups.forEach((group: any, groupIndex: number) => {
        group.fields.forEach(async (field: any, fieldIndex: number) => {
          const question: IQuestion = {
            enabled: true,
            placeholder: field.placeholder,
            fieldId: `${event}.${section.id}.${field.name}`,
            fieldName: field.name,
            label: field.label,
            required: field.required,
            fieldType: field.type,
            fhirSchema: 'Observation[0].value',
            sectionPositionForField: groupIndex + fieldIndex
          }

          try {
            const res = await fetch('http://localhost:2021/createQuestion', {
              method: 'POST',
              body: JSON.stringify(question),
              headers: {
                'Content-Type': 'application/json'
              }
            })
            if (res.status !== 201) {
              throw new Error(res.statusText)
            }
          } catch (error) {
            throw new Error(error.message)
          }
        })
      })
    })
  })*/
}
