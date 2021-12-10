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

export enum FieldType {
  Input = 'input',
  Select = 'select',
  Date = 'date'
}

export class Question {
  label: object
  placeholder: string
  maxLength?: number
  required: boolean
  fieldName: string
  fieldType: FieldType
  fieldId: string
  sectionPositionForField: number
  fhirSchema: string
  enabled: boolean
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
  const registerForm = source.registerForm
  Object.keys(registerForm).forEach(event => {
    registerForm[event].sections.forEach((section: any) => {
      section.groups.forEach((group: any, groupIndex: number) => {
        group.fields.forEach(async (field: any, fieldIndex: number) => {
          const question = new Question()
          question.enabled = true
          question.placeholder = field.placeholder
          question.fieldId = `${event}.${section.id}.${field.name}`
          question.fieldName = field.name
          question.label = field.label
          question.required = field.required
          question.fieldType = FieldType.Input
          question.fhirSchema = 'Observation[0].value'
          question.sectionPositionForField = groupIndex + fieldIndex

          try {
            const res = await fetch('http://localhost:2021/createQuestion', {
              method: 'POST',
              body: JSON.stringify(question),
              headers: {
                'Content-Type': 'application/json'
              }
            })
            if (res.status != 201) {
              throw new Error(res.statusText)
            }
          } catch (error) {
            throw new Error(error.message)
          }
        })
      })
    })
  })
}
