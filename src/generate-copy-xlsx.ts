/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as fs from 'fs'
import { join } from 'path'
import { ILanguage } from './api/content/service'
import * as XLSX from 'xlsx'

type TranslationType = {
  data: ILanguage[]
}

type DescriptionType = {
  data: { [key: string]: string }
}

function generateSheet(
  clientPath: string,
  descriptionPath: string,
  name: string
): void {
  let allMessageData: TranslationType
  let allMessageDescriptions: DescriptionType

  function readFile(path: string) {
    return JSON.parse(fs.readFileSync(join(__dirname, path)).toString())
  }

  try {
    allMessageData = readFile(clientPath) as TranslationType
    allMessageDescriptions = readFile(descriptionPath) as DescriptionType
  } catch (err) {
    console.log(err)
    process.exit(1)
  }

  type SheetRow = Record<string, string> & { id: string }

  const messagesById = allMessageData.data.reduce(
    (
      translationsByKey: { [languageItemId: string]: SheetRow },
      copyForLanguage: ILanguage
    ) => {
      const messages = copyForLanguage.messages || {}
      Object.keys(messages).forEach((key) => {
        translationsByKey[key] = translationsByKey[key]
          ? { ...translationsByKey[key], [copyForLanguage.lang]: messages[key] }
          : {
              id: key,
              description: allMessageDescriptions.data[key],
              [copyForLanguage.lang]: messages[key]
            }
      })
      return translationsByKey
    },
    {}
  )

  const rows = Object.values(messagesById)

  const worksheet = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(workbook, worksheet, name)
}

const workbook = XLSX.utils.book_new()

generateSheet(
  `./api/content/client/client.json`,
  `./api/content/client/descriptions.json`,
  'Client application'
)
generateSheet(
  `./api/content/login/login.json`,
  `./api/content/login/descriptions.json`,
  'Login application'
)
generateSheet(
  `./api/content/notification/notification.json`,
  `./api/content/notification/descriptions.json`,
  'SMS notifications'
)

XLSX.writeFile(workbook, 'Translations.xlsx')
