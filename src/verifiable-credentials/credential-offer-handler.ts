import { CLIENT_APP_URL, DOMAIN } from '@countryconfig/constants'
import { logger } from '@countryconfig/logger'
import { ServerRoute, ReqRefDefaults } from '@hapi/hapi'
import { birthCredentialTemplate } from './birth-credential-template'
import QRCode from 'qrcode'

const SDJWT_ISSUE_URL = `https://${DOMAIN}:7002/openid4vc/sdjwt/issue`

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

    const response = await fetch(SDJWT_ISSUE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // @TODO: Fetch real event data from DB instead of faking it
      body: JSON.stringify(birthCredentialTemplate({ id: eventId } as any))
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

    const credentialOfferUrl = (await response.json()) as string

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

export const CREDENTIAL_OFFER_HANDLER_URL = `${CLIENT_APP_URL}api/countryconfig/${credentialOfferRoute.path}`
