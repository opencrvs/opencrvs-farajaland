const minimist = require('minimist')
const sodium = require('libsodium-wrappers')
const { Octokit } = require('@octokit/core')
const { writeFileSync } = require('fs')
const { existsSync } = require('fs')
const { mkdirSync } = require('fs')

const args = minimist(process.argv.slice(2), {
  string: ['environment', 'vpn-type'],
  boolean: ['sms-enabled', 'configure-vpn', 'dry-run', 'configure-backup'],
  alias: {}
})

const config = {
  environment: args.environment,
  dockerhub: {
    ORGANISATION: 'opencrvs', // EDIT: This should be your dockerhub organisation
    REPOSITORY: 'ocrvs-farajaland', // EDIT: This should be your dockerhub, private repository
    USERNAME: process.env.DOCKER_USERNAME,
    TOKEN: process.env.DOCKER_TOKEN
  },
  github_repository: {
    ORGANISATION: 'opencrvs', // EDIT: This should be your github organisation name
    REPOSITORY_NAME: 'opencrvs-farajaland' // EDIT: This should be your github forked countryconfig repository name
  },
  ssh: {
    SSH_HOST: process.env.SSH_HOST, // Note: For "prodution" environment server clusters of (2, 3 or 5 replicas) this is always the IP address for just 1 manager server
    SSH_USER: process.env.SSH_USER,
    SSH_KEY: process.env.SSH_KEY
  },
  infrastructure: {
    DISK_SPACE: '200g', // EDIT: This should be the amount of diskspace that should be dedicated to OpenCRVS data and will become the size of an encrypted cryptfs data directory. DO NOT USE ALL DISKSPACE FOR OPENCRVS! Leave at least 50g available for OS use.
    DOMAIN: process.env.DOMAIN, // Note: This is the web domain applied after all public subdomains
    REPLICAS: '1' // EDIT: This should be 1 for qa, staging and backup environments.  For "production" environment server clusters of (2, 3 or 5 replicas), set to 2, 3 or 5 as appropriate.
  },
  backup: {
    BACKUP_HOST: process.env.BACKUP_HOST,
    BACKUP_SSH_USER: process.env.BACKUP_SSH_USER,
    BACKUP_DIRECTORY: '' // EDIT: This should be the full path to a directory on your backup server where encrypted backups will be stored.
  },
  sms: {
    INFOBIP_API_KEY: process.env.INFOBIP_API_KEY,
    INFOBIP_GATEWAY_ENDPOINT: process.env.INFOBIP_GATEWAY_ENDPOINT,
    INFOBIP_SENDER_ID: process.env.INFOBIP_SENDER_ID // If using Infobip SMS as a comms provider, this is the name of the SMS sender e.g. OpenCRVS
  },
  services: {
    SENTRY_DSN: process.env.SENTRY_DSN
  },
  seeding: {
    ACTIVATE_USERS:
      args.environment === 'qa' ||
      args.environment === 'dev' ||
      args.environment === 'demo'
        ? 'true'
        : 'false',
    AUTH_HOST: process.env.DOMAIN ? `https://auth.${process.env.DOMAIN}` : '',
    COUNTRY_CONFIG_HOST: process.env.DOMAIN
      ? `https://countryconfig.${process.env.DOMAIN}`
      : '',
    GATEWAY_HOST: process.env.DOMAIN
      ? `https://gateway.${process.env.DOMAIN}`
      : ''
  },
  smtp: {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_USERNAME: process.env.SMTP_USERNAME,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_PORT: process.env.SMTP_PORT,
    SENDER_EMAIL_ADDRESS: process.env.SENDER_EMAIL_ADDRESS,
    EMAIL_API_KEY: process.env.EMAIL_API_KEY,
    ALERT_EMAIL:
      'sentry-dev-aaaalrpiimoklruew7v7dgo2km@opencrvsworkspace.slack.com'
  },
  vpn: {
    type: args['vpn-type'], // e,g, fortinet, wireguard etc
    wireguard: {
      // Note: Only required if you wish to use the provided Wireguard VPN
      VPN_HOST_ADDRESS: process.env.VPN_HOST_ADDRESS, // IP address for the VPN server
      VPN_ADMIN_PASSWORD: process.env.VPN_ADMIN_PASSWORD
    },
    openconnect: {
      // Note: If you do not have a jump or bastion server, you may need environment variables openconnect can use to access your VPN
      VPN_PROTOCOL: process.env.VPN_PROTOCOL,
      VPN_HOST_ADDRESS: process.env.VPN_HOST_ADDRESS,
      VPN_PORT: process.env.VPN_PORT,
      VPN_USER: process.env.VPN_USER,
      VPN_PWD: process.env.VPN_PWD,
      VPN_SERVERCERT: process.env.VPN_SERVERCERT
    }
  },
  whitelist: {
    CONTENT_SECURITY_POLICY_WILDCARD: `*.${process.env.DOMAIN}`,
    CLIENT_APP_URL: process.env.DOMAIN
      ? `https://register.${process.env.DOMAIN}`
      : '',
    LOGIN_URL: process.env.DOMAIN ? `https://login.${process.env.DOMAIN}` : ''
  }
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

async function createVariable(repositoryId, environment, name, value) {
  await octokit.request(
    `POST /repositories/${repositoryId}/environments/${config.environment}/variables`,
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

async function getRepositoryId(owner, repo) {
  const response = await octokit.request('GET /repos/{owner}/{repo}', {
    owner: owner,
    repo: repo
  })

  return response.data.id
}

async function createSecret(
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

async function getPublicKey(environment) {
  const repositoryId = await getRepositoryId(
    config.github_repository.ORGANISATION,
    config.github_repository.REPOSITORY_NAME
  )

  await octokit.request(
    `PUT /repos/${config.github_repository.ORGANISATION}/${config.github_repository.REPOSITORY_NAME}/environments/${environment}`,
    {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )

  const res = await octokit.request(
    `GET /repositories/${repositoryId}/environments/${environment}/secrets/public-key`,
    {
      owner: config.github_repository.ORGANISATION,
      repo: config.github_repository.REPOSITORY_NAME,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )

  return res.data
}

async function listRepoSecrets(owner, repositoryId, environmentName) {
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

async function listRepoVariables(repositoryId, environmentName) {
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

function generateLongPassword() {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_'
  let result = ''
  for (var i = 16; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

async function main() {
  if (!config.environment) {
    console.error('Please specify an environment in config.environment')
    process.exit(1)
  }

  const { key, key_id } = await getPublicKey(config.environment)
  const repositoryId = await getRepositoryId(
    config.github_repository.ORGANISATION,
    config.github_repository.REPOSITORY_NAME
  )

  const existingVariables = await listRepoVariables(
    repositoryId,
    config.environment
  )
  const existingSecrets = await listRepoSecrets(
    config.github_repository.ORGANISATION,
    repositoryId,
    config.environment
  )

  let backupSecrets = {}
  let backupVariables = {}
  let vpnSecrets = {}
  let smsSecrets = {}

  if (args['configure-backup']) {
    backupSecrets = {
      BACKUP_HOST: config.backup.BACKUP_HOST
    }
    backupVariables = {
      BACKUP_DIRECTORY: config.backup.BACKUP_DIRECTORY,
      RESTORE_DIRECTORY: config.backup.qa.RESTORE_DIRECTORY
    }
  }

  if (args['configure-vpn']) {
    if (!config.vpn.type) {
      console.error('Please specify a VPN type with --vpn-type')
      process.exit(1)
    }
    vpnSecrets = {
      ...config.vpn[config.vpn.type]
    }
  }

  if (args['sms-enabled']) {
    smsSecrets = {
      ...config.sms
    }
  }

  const SECRETS_TO_SAVE_IN_PASSWORD_MANAGER = {
    ELASTICSEARCH_SUPERUSER_PASSWORD: generateLongPassword(),
    BACKUP_ENCRYPTION_PASSPHRASE: generateLongPassword(),
    ENCRYPTION_KEY: generateLongPassword(),
    KIBANA_USERNAME: 'opencrvs-admin',
    KIBANA_PASSWORD: generateLongPassword(),
    MINIO_ROOT_PASSWORD: generateLongPassword(),
    MINIO_ROOT_USER: generateLongPassword(),
    MONGODB_ADMIN_PASSWORD: generateLongPassword(),
    MONGODB_ADMIN_USER: generateLongPassword(),
    SUPER_USER_PASSWORD: generateLongPassword()
  }

  const SECRETS = {
    DOCKERHUB_ACCOUNT: config.dockerhub.ORGANISATION,
    DOCKERHUB_REPO: config.dockerhub.REPOSITORY,
    DOCKER_TOKEN: config.dockerhub.TOKEN,
    DOCKER_USERNAME: config.dockerhub.USERNAME,
    ...SECRETS_TO_SAVE_IN_PASSWORD_MANAGER,
    ...config.ssh,
    ...config.smtp,
    ...config.services,
    ...backupSecrets,
    ...vpnSecrets,
    ...smsSecrets
  }
  const VARIABLES = {
    ...config.infrastructure,
    ...config.seeding,
    ...config.whitelist,
    ...backupVariables
  }

  const allSecretsKeys = Object.keys(SECRETS)

  const allVariablesKeys = Object.keys(VARIABLES)

  if (existingSecrets.length !== 0) {
    console.log(
      'This environment already has defined secrets. Environment is however currently missing the following secrets:',
      allSecretsKeys.filter(
        (key) => !existingSecrets.find((secret) => secret.name === key)
      )
    )
    for (const secret of existingSecrets) {
      delete SECRETS[secret.name]
    }
  }
  console.log(existingVariables)

  if (existingVariables.length !== 0) {
    console.log(
      'This environment already has defined variables. Environment is however currently missing the following variables:',
      allVariablesKeys.filter(
        (key) => !existingVariables.find((secret) => secret.name === key)
      )
    )
    for (const variable of existingVariables) {
      delete VARIABLES[variable.name]
    }
  }

  const errors = []
  for (const [secretName, secretValue] of Object.entries(SECRETS)) {
    if (secretValue === undefined || secretValue === '') {
      errors.push(
        `Secret ${secretName} is empty.  Please set the value in the config.`
      )
    }
  }

  for (const [variableName, variableValue] of Object.entries(VARIABLES)) {
    if (variableValue === undefined || variableValue === '') {
      errors.push(
        `Variable ${variableName} is empty.  Please set the value in the config.`
      )
    }
  }

  const secretsToCreate = allSecretsKeys.filter(
    (key) => !existingSecrets.find((secret) => secret.name === key)
  )
  const variablesToCreate = allVariablesKeys.filter(
    (key) => !existingVariables.find((secret) => secret.name === key)
  )

  if (args['dry-run']) {
    console.log('This is a dry run. Not creating secrets or variables.')
    console.log('')
    console.log('Errors:', errors)
    console.log('')
    console.log('After all errors are fixed, These secrets will be created:')
    console.log(secretsToCreate)
    console.log('These variables would be created:')
    console.log(variablesToCreate)
    process.exit(0)
  }

  if (errors.length > 0) {
    console.error(errors)
    process.exit(1)
  }

  for (const [secretName, secretValue] of Object.entries(SECRETS)) {
    console.log(`Creating secret ${secretName} with value ${secretValue}`)
    await createSecret(
      repositoryId,
      config.environment,
      key,
      key_id,
      secretName,
      secretValue
    )
  }

  for (const [variableName, variableValue] of Object.entries(VARIABLES)) {
    console.log(`Creating variable ${variableName} with value ${variableValue}`)

    await createVariable(
      repositoryId,
      config.environment,
      variableName,
      variableValue
    )
  }

  if (!existsSync('.secrets')) {
    mkdirSync('.secrets')
  }

  writeFileSync(
    '.secrets/SECRETS_TO_SAVE_IN_PASSWORD_MANAGER_FOR_ENV_' +
      config.environment +
      '.json',
    JSON.stringify([SECRETS_TO_SAVE_IN_PASSWORD_MANAGER], null, 2)
  )
}

main()
