const sodium = require('libsodium-wrappers')
const { Octokit } = require('@octokit/core')

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

export async function createVariable(repositoryId, environment, name, value) {
  await octokit.request(
    `POST /repositories/${repositoryId}/environments/${environment}/variables`,
    {
      repository_id: repositoryId,
      environment_name: environment,
      name: name,
      value: value,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
}

export async function getRepositoryId(owner, repo) {
  const response = await octokit.request('GET /repos/{owner}/{repo}', {
    owner: owner,
    repo: repo
  })

  return response.data.id
}

export async function createSecret(
  repositoryId,
  environment,
  key,
  keyId,
  name,
  secret
) {
  //Check if libsodium is ready and then proceed.
  await sodium.ready

  // Convert Secret & Base64 key to Uint8Array.
  let binkey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL)
  let binsec = sodium.from_string(secret)

  //Encrypt the secret using LibSodium
  let encBytes = sodium.crypto_box_seal(binsec, binkey)

  // Convert encrypted Uint8Array to Base64
  const encryptedValue = sodium.to_base64(
    encBytes,
    sodium.base64_variants.ORIGINAL
  )

  await octokit.request(
    `PUT /repositories/${repositoryId}/environments/${environment}/secrets/${name}`,
    {
      repository_id: repositoryId,
      environment_name: environment,
      secret_name: name,
      encrypted_value: encryptedValue,
      key_id: keyId,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
}

export async function getPublicKey(environment, ORGANISATION, REPOSITORY_NAME) {
  const repositoryId = await getRepositoryId(ORGANISATION, REPOSITORY_NAME)

  await octokit.request(
    `PUT /repos/${ORGANISATION}/${REPOSITORY_NAME}/environments/${environment}`,
    {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )

  const res = await octokit.request(
    `GET /repositories/${repositoryId}/environments/${environment}/secrets/public-key`,
    {
      owner: ORGANISATION,
      repo: REPOSITORY_NAME,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )

  return res.data
}

export async function listRepoSecrets(owner, repositoryId, environmentName) {
  const response = await octokit.request(
    'GET /repositories/{repository_id}/environments/{environment_name}/secrets',
    {
      owner: owner,
      repository_id: repositoryId,
      environment_name: environmentName
    }
  )
  return response.data.secrets
}

export async function listRepoVariables(repositoryId, environmentName) {
  const response = await octokit.request(
    'GET /repositories/{repository_id}/environments/{environment_name}/variables',
    {
      per_page: 30,
      repository_id: repositoryId,
      environment_name: environmentName,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )

  return response.data.variables
}
