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
import * as mongoose from 'mongoose'
import { CONFIG_MONGO_URL } from '@countryconfig/constants'
import Certificate from '@countryconfig/farajaland/features/config/model/certificate'
import Config from '@countryconfig/farajaland/features/config/model/config'
import chalk from 'chalk'

export default async function importCertificates() {
  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.blueBright(
        '/////////////////////////// IMPORT DEFAULT CERTIFICATES ///////////////////////////'
      )}`
    )
    mongoose.connect(CONFIG_MONGO_URL)
    const birthCertificate = new Certificate({
      svgCode:
        "<svg width='420' height='595' viewBox='0 0 420 595' fill='none' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>\n  <rect width='420' height='595' fill='white' />\n  <rect x='16.5' y='16.5' width='387' height='562' stroke='#DEE2E4' />\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='8' font-weight='300' letter-spacing='0px'>\n    <tspan x='210' y='445.552'></tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='0px'>\n    <tspan x='52%' y='308.828' text-anchor='middle'>{eventDate}</tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='10' font-weight='300' letter-spacing='0px'>\n    <tspan x='52%' y='287.69' text-anchor='middle'>Was born on</tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='10' font-weight='300' letter-spacing='0px'>\n    <tspan x='52%' y='345.69' text-anchor='middle'>Place of birth</tspan>\n  </text>\n  <text fill='#35495D' xml:space='default'  style='white-space: pre' font-family='Noto Sans Bengali' font-size='12' font-weight='500' letter-spacing='0px'>\n    <tspan x='211' y='384.004'></tspan>\n  </text>\n  <text fill='#35495D' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='0px'>\n    <tspan x='52%' y='367.828' text-anchor='middle'>{placeOfBirth}</tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='0px'>\n    <tspan x='52%' y='245.828' text-anchor='middle'>{applicantName}</tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='10' font-weight='300' letter-spacing='0px'>\n    <tspan x='52%' y='224.69' text-anchor='middle'>This is to certify that</tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='1px'>\n    <tspan x='52%' y='145.828' text-anchor='middle'>{registrationNumber}</tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='12' letter-spacing='0px'>\n    <tspan x='52%' y='127.828' text-anchor='middle'>Birth Registration No</tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='8' letter-spacing='0px'>\n    <tspan x='52%' y='170.104' text-anchor='middle'>Date of issuance of certificate: {certificateDate}</tspan>\n  </text>\n  <line x1='44.9985' y1='403.75' x2='377.999' y2='401.75' stroke='#CCCFD0' stroke-width='0.5' />\n  <line x1='44.9985' y1='189.75' x2='377.999' y2='187.75' stroke='#CCCFD0' stroke-width='0.5' />\n  <rect x='184.5' y='51' width='46.7463' height='54' fill='url(#pattern0)' />\n  <path d='M135.446 524.629H284.554' stroke='#F4F4F4' stroke-width='1.22857' stroke-linecap='square' stroke-linejoin='round' />\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='8' font-weight='300' letter-spacing='0px'>\n    <tspan x='52%' y='539.552' text-anchor='middle'>{registrarName}</tspan>\n    <tspan x='52%' y='551.552' text-anchor='middle'>({role})</tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans Bengali' font-size='8' font-weight='300' letter-spacing='0px'>\n    <tspan x='209.587' y='562.336'></tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='8' letter-spacing='0px'>\n    <tspan x='52%' y='429.552' text-anchor='middle'>This event was registered at</tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='8' letter-spacing='0px'>\n    <tspan x='52%' y='445.552' text-anchor='middle'>{registrationLocation}</tspan>\n  </text>\n  <rect x='139' y='465' width='142.647' height='50' fill='url(#pattern1)' />\n  <defs>\n    <pattern id='pattern0' patternContentUnits='objectBoundingBox' width='1' height='1'>\n      <use xlink:href='#image0_43_3545' transform='translate(0 -0.000358256) scale(0.0005)' />\n    </pattern>\n    <pattern id='pattern1' patternContentUnits='objectBoundingBox' width='1' height='1'>\n      <use xlink:href='#image1_43_3545' transform='scale(0.000818331 0.00224215)' />\n    </pattern>\n    <image id='image0_43_3545' width='2000' height='2312' xlink:href='{countryLogo}' />\n    <image id='image1_43_3545' width='1222' height='446' xlink:href='{registrarSignature}' />\n  </defs>\n</svg>",
      svgFilename: 'birth-certificate-template.svg',
      user: '62164a3c7019d58f0d16a724',
      event: 'birth',
      status: 'ACTIVE',
      svgDateUpdated: 1646293351332.0,
      svgDateCreated: 1640696680593.0
    })

    const deathCertificate = new Certificate({
      svgCode:
        "<svg width='420' height='595' viewBox='0 0 420 595' fill='none' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>\n  <rect width='420' height='595' fill='white' />\n  <rect x='16.5' y='16.5' width='387' height='562' stroke='#DEE2E4' />\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='8' font-weight='300' letter-spacing='0px'>\n    <tspan x='210' y='445.552'></tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='0px'>\n    <tspan x='52%' y='308.828' text-anchor='middle'>{eventDate}</tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='10' font-weight='300' letter-spacing='0px'>\n    <tspan x='52%' y='287.69' text-anchor='middle'>Died on</tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='10' font-weight='300' letter-spacing='0px'>\n    <tspan x='52%' y='345.69' text-anchor='middle'>Place of death</tspan>\n  </text>\n  <text fill='#35495D' xml:space='default'  style='white-space: pre' font-family='Noto Sans Bengali' font-size='12' font-weight='500' letter-spacing='0px'>\n    <tspan x='211' y='384.004'></tspan>\n  </text>\n  <text fill='#35495D' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='0px'>\n    <tspan x='52%' y='367.828' text-anchor='middle'>{placeOfDeath}</tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='0px'>\n    <tspan x='52%' y='245.828' text-anchor='middle'>{applicantName}</tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='10' font-weight='300' letter-spacing='0px'>\n    <tspan x='52%' y='224.69' text-anchor='middle'>This is to certify that</tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='1px'>\n    <tspan x='52%' y='145.828' text-anchor='middle'>{registrationNumber}</tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='12' letter-spacing='0px'>\n    <tspan x='52%' y='127.828' text-anchor='middle'>Death Registration No</tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='8' letter-spacing='0px'>\n    <tspan x='52%' y='170.104' text-anchor='middle'>Date of issuance of certificate: {certificateDate}</tspan>\n  </text>\n  <line x1='44.9985' y1='403.75' x2='377.999' y2='401.75' stroke='#CCCFD0' stroke-width='0.5' />\n  <line x1='44.9985' y1='189.75' x2='377.999' y2='187.75' stroke='#CCCFD0' stroke-width='0.5' />\n  <rect x='184.5' y='51' width='46.7463' height='54' fill='url(#pattern0)' />\n  <path d='M135.446 524.629H284.554' stroke='#F4F4F4' stroke-width='1.22857' stroke-linecap='square' stroke-linejoin='round' />\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='8' font-weight='300' letter-spacing='0px'>\n    <tspan x='52%' y='539.552' text-anchor='middle'>{registrarName}</tspan>\n    <tspan x='52%' y='551.552' text-anchor='middle'>({role})</tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans Bengali' font-size='8' font-weight='300' letter-spacing='0px'>\n    <tspan x='209.587' y='562.336'></tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='8' letter-spacing='0px'>\n    <tspan x='52%' y='429.552' text-anchor='middle'>This event was registered at</tspan>\n  </text>\n  <text fill='#292F33' xml:space='default'  style='white-space: pre' font-family='Noto Sans' font-size='8' letter-spacing='0px'>\n    <tspan x='52%' y='445.552' text-anchor='middle'>{registrationLocation}</tspan>\n  </text>\n  <rect x='139' y='465' width='142.647' height='50' fill='url(#pattern1)' />\n  <defs>\n    <pattern id='pattern0' patternContentUnits='objectBoundingBox' width='1' height='1'>\n      <use xlink:href='#image0_43_3545' transform='translate(0 -0.000358256) scale(0.0005)' />\n    </pattern>\n    <pattern id='pattern1' patternContentUnits='objectBoundingBox' width='1' height='1'>\n      <use xlink:href='#image1_43_3545' transform='scale(0.000818331 0.00224215)' />\n    </pattern>\n    <image id='image0_43_3545' width='2000' height='2312' xlink:href='{countryLogo}' />\n    <image id='image1_43_3545' width='1222' height='446' xlink:href='{registrarSignature}' />\n  </defs>\n</svg>",
      svgFilename: 'death-certificate-template.svg',
      user: '62164a3c7019d58f0d16a724',
      event: 'death',
      status: 'ACTIVE',
      svgDateUpdated: 1646293357391.0,
      svgDateCreated: 1640696804785.0
    })

    const defaultConfig = new Config({
      BACKGROUND_SYNC_BROADCAST_CHANNEL: 'backgroundSynBroadCastChannel',
      COUNTRY: 'FAR',
      COUNTRY_LOGO_FILE: 'logo.png',
      COUNTRY_LOGO_RENDER_WIDTH: 104,
      COUNTRY_LOGO_RENDER_HEIGHT: 104,
      DESKTOP_TIME_OUT_MILLISECONDS: 900000,
      LANGUAGES: 'en',
      CERTIFICATE_PRINT_CHARGE_FREE_PERIOD: 36500,
      CERTIFICATE_PRINT_CHARGE_UP_LIMIT: 36500,
      CERTIFICATE_PRINT_LOWEST_CHARGE: 0,
      CERTIFICATE_PRINT_HIGHEST_CHARGE: 0,
      UI_POLLING_INTERVAL: 5000,
      FIELD_AGENT_AUDIT_LOCATIONS: 'DISTRICT',
      APPLICATION_AUDIT_LOCATIONS: 'DISTRICT',
      INFORMANT_MINIMUM_AGE: 16,
      HIDE_EVENT_REGISTER_INFORMATION: false,
      EXTERNAL_VALIDATION_WORKQUEUE: false,
      PHONE_NUMBER_PATTERN: {
        pattern: '^0(7|9)[0-9]{1}[0-9]{7}$',
        example: '0970545855',
        start: '0[7|9]',
        num: '10',
        mask: {
          startForm: 4,
          endBefore: 2
        }
      },
      SENTRY:
        'https://f892d643aab642108f44e2d1795706bc@o309867.ingest.sentry.io/1774604',
      LOGROCKET: 'opencrvs-foundation/opencrvs-farajaland',
      NID_NUMBER_PATTERN: {
        pattern: '^[0-9]{9}$',
        example: '483721940',
        num: '9'
      }
    })

    const certificates = [birthCertificate, deathCertificate]

    const configs = [defaultConfig]
    function onInsert(err: any, values: any) {
      if (!err) {
        mongoose.disconnect()
      } else {
        throw Error(
          `Cannot save ${JSON.stringify(
            values
          )} to application config db ... ${err}`
        )
      }
    }
    Certificate.collection.insertMany(certificates, onInsert)
    Config.collection.insertMany(configs, onInsert)
  } catch (err) {
    throw new Error(err)
  }

  return true
}

importCertificates()
