import {
  CLICKATELL_API_ID,
  CLICKATELL_PASSWORD,
  CLICKATELL_USER,
  INFOBIP_API_KEY,
  INFOBIP_GATEWAY_ENDPOINT,
  INFOBIP_SENDER_ID,
  SMS_PROVIDER
} from './constant'
import { Iconv } from 'iconv'
import { logger } from '@countryconfig/logger'
import { stringify } from 'querystring'
import fetch from 'node-fetch'

export async function sendSMSClickatell(
  msisdn: string,
  message: string,
  convertUnicode?: boolean
) {
  let params = {
    user: CLICKATELL_USER,
    password: CLICKATELL_PASSWORD,
    api_id: CLICKATELL_API_ID,
    to: msisdn,
    text: message,
    unicode: 0
  }
  /* character limit for unicoded sms is 70 otherwise 160 */
  if (convertUnicode) {
    params = {
      ...params,
      text: new Iconv('UTF-8', 'UCS-2BE').convert(message).toString('hex'),
      unicode: 1
    }
  }
  logger.info(`Sending an sms: ${JSON.stringify(params)}`)

  const url = `https://api.clickatell.com/http/sendmsg?${stringify(params)}`

  let res
  try {
    res = await fetch(url)
  } catch (err) {
    logger.error(err)
    throw err
  }

  const body = await res.text()
  if (body.includes('ERR')) {
    logger.error(body)
    throw new Error(body)
  }
  logger.info('Received success response from Clickatell: Success')
}

export async function sendSMSInfobip(to: string, text: string) {
  const body = JSON.stringify({
    messages: [
      {
        destinations: [
          {
            to
          }
        ],
        from: INFOBIP_SENDER_ID,
        text
      }
    ]
  })
  const headers = {
    Authorization: `App ${INFOBIP_API_KEY}`,
    'Content-Type': 'application/json'
  }

  let response
  try {
    response = await fetch(INFOBIP_GATEWAY_ENDPOINT, {
      method: 'POST',
      body,
      headers
    })
  } catch (error) {
    logger.error(error)
    throw error
  }

  const responseBody = await response.text()
  logger.info(`Response from Infobip: ${JSON.stringify(responseBody)}`)
  if (!response.ok) {
    logger.error(`Failed to send sms to ${to}`)
    throw new Error(`Failed to send sms to ${to}`)
  }
}

export async function sendSMS(
  msisdn: string,
  message: string,
  convertUnicode?: boolean
) {
  switch (SMS_PROVIDER) {
    case 'clickatell':
      return sendSMSClickatell(msisdn, message, convertUnicode)
    case 'infobip':
      return sendSMSInfobip(msisdn, message)
    default:
      throw new Error(`Unknown sms provider ${SMS_PROVIDER}`)
  }
}
