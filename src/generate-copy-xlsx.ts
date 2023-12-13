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

type translationType = {
  data: ILanguage[]
}

type descriptionType = {
  data: { [key: string]: string }
}

function generateSheet(
  clientPath: string,
  descriptionPath: string,
  name: string
) {
  let allMessageData: translationType
  let allMessageDescriptions: descriptionType

  function readFile(path: string) {
    return JSON.parse(fs.readFileSync(join(__dirname, path)).toString())
  }

  try {
    allMessageData = readFile(clientPath) as translationType
    allMessageDescriptions = readFile(descriptionPath) as descriptionType
  } catch (err) {
    console.log(err)
    return false
  }

  const availableTranslations = allMessageData.data.map(
    (d: Partial<ILanguage>) => ({
      lang: d.displayName,
      messages: d.messages
    })
  )

  availableTranslations.forEach((item) => {
    const sheetname = `${name}-${item.lang}`
    const rows = []
    for (const [key, value] of Object.entries(item.messages!)) {
      rows.push({
        id: key,
        text: value,
        description: allMessageDescriptions.data[key] || ''
      })
    }
    const worksheet = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetname)
  })
  return true
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
XLSX.writeFile(workbook, './9. config: Translations')
