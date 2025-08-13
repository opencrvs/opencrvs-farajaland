import { GATEWAY_HOST } from '../../constants'
import { faker } from '@faker-js/faker'
import fetch from 'node-fetch'
import { formatName } from '../../helpers'
import gql from 'graphql-tag'
import { print } from 'graphql/language/printer'

type UserInput = {
  primaryOffice: string
  name: {
    use: 'en'
    familyName: string
    firstNames: string
  }[]
  email: string
  role: string
}

export const createOrUpdateUserMutation = print(gql`
  mutation createOrUpdateUser($user: UserInput!) {
    createOrUpdateUser(user: $user) {
      username
    }
  }
`)

export async function createUser(
  token: string,
  userInput?: Partial<UserInput>
) {
  const user: UserInput = {
    primaryOffice: '3df5407b-2424-4eff-99de-be06649831f2',
    name: [
      {
        use: 'en',
        familyName: userInput?.name?.[0]?.familyName || faker.person.lastName(),
        firstNames: userInput?.name?.[0]?.firstNames || faker.person.firstName()
      }
    ],
    email: userInput?.email || faker.internet.email(),
    role: userInput?.role || 'FIELD_AGENT'
  }

  const res = await fetch(`${GATEWAY_HOST}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      query: createOrUpdateUserMutation,
      variables: {
        user
      }
    })
  })

  const json = await res.json()

  if (json.errors) {
    throw new Error(JSON.stringify(json.errors))
  }

  const fullName = formatName(user.name)

  return { ...json.data.createOrUpdateUser, fullName }
}
