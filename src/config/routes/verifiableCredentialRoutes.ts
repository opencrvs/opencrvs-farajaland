import { CLIENT_APP_URL, GATEWAY_URL } from '@countryconfig/constants'
import { env } from '@countryconfig/environment'
import { logger } from '@countryconfig/logger'
import { buildTypeScriptToJavaScript } from '@countryconfig/utils'
import { ServerRoute, ReqRefDefaults } from '@hapi/hapi'
import { createClient } from '@opencrvs/toolkit/api'
import QRCode from 'qrcode'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { birthCredentialTemplate } from '../../verifiable-credentials/birth-credential-template'
import { paperBirthCredentialTemplate } from '../../verifiable-credentials/paper-birth-credential-template'

const SDJWT_ISSUE_URL = `${env.isProd ? 'http://waltid_issuer-api:7002' : 'https://vc-demo.opencrvs.dev:7002'}/openid4vc/sdjwt/issue`
const RAW_JWT_SIGN_URL = `${env.isProd ? 'http://waltid_issuer-api:7002' : 'https://vc-demo.opencrvs.dev:7002'}/raw/jwt/sign`

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

export const paperCredentialRoute = {
  method: 'POST',
  path: '/verifiable-credentials/paper-credential',
  handler: async (req) => {
    const pathname = (req.payload as Record<string, string>).pathname
    const match = pathname.match(
      /\/events\/(?:print-certificate\/)?([a-f0-9-]{36})/i
    )
    const eventId = match?.[1]

    if (!eventId) {
      throw new Error('Invalid event ID in pathname')
    }

    if (!req.headers.authorization) {
      throw new Error('Missing authorization header')
    }

    logger.info(
      `[verifiable credentials] requesting paper credential for <event-id:${eventId}>`
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

    if (!event.results.length) {
      throw new Error(`No event found for id: ${eventId}`)
    }

    const response = await fetch(RAW_JWT_SIGN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paperBirthCredentialTemplate(event.results[0]))
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error(
        `[verifiable credentials] failed to issue paper credential for <event-id:${eventId}>: ${errorText}`
      )
      throw new Error(
        `Failed to issue paper credential: ${response.status} ${errorText}`
      )
    }

    const credentialJwt = (await response.text()).trim().replace(/^"|"$/g, '')

    if (credentialJwt.split('.').length !== 3) {
      throw new Error('Issuer did not return a JWT credential')
    }

    const paperVcQrDataUrl = await QRCode.toDataURL(credentialJwt, {
      width: 600,
      errorCorrectionLevel: 'L'
    })

    return {
      credential: credentialJwt,
      credential_qr: paperVcQrDataUrl
    }
  }
} satisfies ServerRoute<ReqRefDefaults>

export const qrCodeComponentRoute = {
  method: 'GET',
  path: '/field-type/image.js',
  handler: async (_req, h) => {
    return h
      .response(
        await buildTypeScriptToJavaScript(
          join(__dirname, '../../verifiable-credentials/field-type-image.tsx')
        )
      )
      .type('text/javascript')
  },
  options: {
    auth: false
  }
} satisfies ServerRoute<ReqRefDefaults>

export const verifierRoute = {
  method: 'GET',
  path: '/verifier.html',
  handler: async (_req, h) => {
    return h
      .response(
        await readFile(
          join(__dirname, '../../verifiable-credentials/verifier.html'),
          'utf-8'
        )
      )
      .type('text/html')
  },
  options: {
    auth: false
  }
} satisfies ServerRoute<ReqRefDefaults>

export const paperVerifierRoute = {
  method: 'GET',
  path: '/paper-verifier.html',
  handler: async (_req, h) => {
    return h
      .response(
        await readFile(
          join(__dirname, '../../verifiable-credentials/paper-verifier.html'),
          'utf-8'
        )
      )
      .type('text/html')
  },
  options: {
    auth: false
  }
} satisfies ServerRoute<ReqRefDefaults>

/** FieldType.HTTP uses this URL to fetch the credential offer from the form */
export const CREDENTIAL_OFFER_HANDLER_URL = new URL(
  `api/countryconfig/${credentialOfferRoute.path}`,
  CLIENT_APP_URL
).toString()

export const PAPER_CREDENTIAL_HANDLER_URL = new URL(
  `api/countryconfig/${paperCredentialRoute.path}`,
  CLIENT_APP_URL
).toString()

export default function getVerifiableCredentialRoutes(): ServerRoute<ReqRefDefaults>[] {
  return [
    credentialOfferRoute,
    paperCredentialRoute,
    qrCodeComponentRoute,
    verifierRoute,
    paperVerifierRoute
  ]
}
