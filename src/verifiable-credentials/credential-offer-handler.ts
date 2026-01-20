import { CLIENT_APP_URL, GATEWAY_URL } from '@countryconfig/constants'
import { logger } from '@countryconfig/logger'
import { ServerRoute, ReqRefDefaults } from '@hapi/hapi'
import { birthCredentialTemplate } from './birth-credential-template'
import QRCode from 'qrcode'
import { buildTypeScriptToJavaScript } from '@countryconfig/utils'
import { join } from 'path'
import { createClient } from '@opencrvs/toolkit/api'

const SDJWT_ISSUE_URL = `https://vc-demo.opencrvs.dev:7002/openid4vc/sdjwt/issue`

export const credentialOfferRoute = {
  method: 'POST',
  path: '/verifiable-credentials/credential-offer',
  handler: async (req) => {
    const pathname = (req.payload as Record<string, string>).pathname
    const match = pathname.match(/\/events\/([a-f0-9-]{36})/i)
    const eventId = match?.[1]

    if (!eventId) {
      throw new Error('Invalid event ID in pathname')
    }

    logger.info(
      `[verifiable credentials] requesting credential offer for <event-id:${eventId}>`
    )

    const url = new URL('events', GATEWAY_URL).toString()
    const client = createClient(url, req.headers.authorization)
    const event = await client.event.search.query({
      query: {
        type: 'and',
        clauses: [
          {
            id: eventId
          }
        ]
      }
    })
    const response = await fetch(SDJWT_ISSUE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(birthCredentialTemplate(event.results[0]))
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error(
        `[verifiable credentials] failed to get credential offer for <event-id:${eventId}>: ${errorText}`
      )
      throw new Error(
        `Failed to get credential offer: ${response.status} ${errorText}`
      )
    }

    const credentialOfferUrl = (await response.text()) as string

    const qrDataUrl = await QRCode.toDataURL(credentialOfferUrl, {
      width: 300,
      errorCorrectionLevel: 'M'
    })

    return {
      credential_offer_uri: credentialOfferUrl,
      credential_offer_uri_qr: qrDataUrl
    }
  }
} satisfies ServerRoute<ReqRefDefaults>

/** The url to the above handler. FieldType.HTTP uses to fetch the credential offer from here in the form */
export const CREDENTIAL_OFFER_HANDLER_URL = new URL(
  `api/countryconfig/${credentialOfferRoute.path}`,
  CLIENT_APP_URL
).toString()

export const qrCodeComponentRoute = {
  method: 'GET',
  path: '/field-type/image.js',
  handler: async (_req, h) => {
    return h
      .response(
        await buildTypeScriptToJavaScript(
          join(__dirname, 'field-type-image.tsx')
        )
      )
      .type('text/javascript')
  },
  options: {
    auth: false
  }
} satisfies ServerRoute<ReqRefDefaults>
