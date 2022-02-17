import fetch from 'node-fetch'
import { AUTH_API_HOST } from './constants'
import { VERIFICATION_CODE } from './index'
import { User } from './users'

export async function getToken(
  username: string,
  password: string
): Promise<string> {
  const authenticateResponse = await fetch(`${AUTH_API_HOST}/authenticate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-correlation': username + '-' + Date.now()
    },
    body: JSON.stringify({
      username,
      password
    })
  })
  const { nonce, token } = await authenticateResponse.json()

  if (token) {
    return token
  }

  const verifyResponse = await fetch(`${AUTH_API_HOST}/verifyCode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-correlation': username + '-' + Date.now()
    },
    body: JSON.stringify({
      nonce,
      code: VERIFICATION_CODE
    })
  })
  const data = await verifyResponse.json()

  if (!data.token) {
    console.log(data)

    throw new Error(
      `Failed to get token for user ${username}, password ${password}`
    )
  }

  return data.token
}

export async function getTokenForSystemClient(
  clientId: string,
  clientSecret: string
): Promise<string> {
  const authenticateResponse = await fetch(
    'http://localhost:4040/authenticateSystemClient',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-correlation': clientId + '-' + Date.now()
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret
      })
    }
  )
  const res = await authenticateResponse.json()

  return res.token
}

export function readToken(token: string) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
}

export async function updateToken(user: User) {
  if (!user.stillInUse) {
    return
  }
  const token = user.isSystemUser
    ? await getTokenForSystemClient(user.username, user.password)
    : await getToken(user.username, user.password)

  user.token = token

  const data = readToken(token)

  setTimeout(() => updateToken(user), data.exp * 1000 - Date.now() - 60000)
}
