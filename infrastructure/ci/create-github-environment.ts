const minimist = require('minimist')
const { writeFileSync } = require('fs')
const { existsSync } = require('fs')
const { mkdirSync } = require('fs')
const { getRepositoryId } = require('./github')
const { getPublicKey } = require('./github')
const { listRepoVariables } = require('./github')
const { listRepoSecrets } = require('./github')
const { createSecret } = require('./github')
const { createVariable } = require('./github')

const args = minimist(process.argv.slice(2), {
  string: ['environment', 'vpn-type', 'notification-transport'],
  boolean: ['sms-enabled', 'configure-vpn', 'dry-run', 'configure-backup'],
  alias: {}
})

require('dotenv').config({
  path: `${process.cwd()}/.env.${args.environment}`
})

type WireguardSecrets = {
  VPN_ADMIN_PASSWORD: string
}
type OpenConnectSecrets = {
  VPN_PROTOCOL: string
  VPN_HOST_ADDRESS: string
  VPN_PORT: string
  VPN_USER: string
  VPN_PWD: string
  VPN_SERVERCERT: string
}

const config = {
  environment: args.environment,
  dockerhub: {
    ORGANISATION: 'opencrvs', // This may be a dockerhub organisation or the same as the username
    REPOSITORY: 'ocrvs-farajaland',
    USERNAME: process.env.DOCKER_USERNAME,
    TOKEN: process.env.DOCKER_TOKEN
  },
  github_repository: {
    ORGANISATION: 'opencrvs',
    REPOSITORY_NAME: 'opencrvs-farajaland'
  },
  ssh: {
    SSH_HOST: process.env.SSH_HOST, // IP address for the manager
    SSH_USER: process.env.SSH_USER,
    SSH_KEY: process.env.SSH_KEY
  },
  infrastructure: {
    DISK_SPACE: '200g', // e.g. 200g
    DOMAIN: process.env.DOMAIN, // web domain applied after all public subdomains
    REPLICAS: '1'
  },
  sms: {
    INFOBIP_API_KEY: process.env.INFOBIP_API_KEY,
    INFOBIP_GATEWAY_ENDPOINT: process.env.INFOBIP_GATEWAY_ENDPOINT,
    INFOBIP_SENDER_ID: process.env.INFOBIP_SENDER_ID // the name of the SMS sender e.g. OpenCRVS
  },
  services: {
    SENTRY_DSN: process.env.SENTRY_DSN
  },
  seeding: {
    ACTIVATE_USERS: '', // Must be a string 'true' for QA or 'false' in PRODUCTION!
    AUTH_HOST: '',
    COUNTRY_CONFIG_HOST: '',
    GATEWAY_HOST: ''
  },
  smtp: {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_USERNAME: process.env.SMTP_USERNAME,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_PORT: process.env.SMTP_PORT,
    SENDER_EMAIL_ADDRESS: process.env.SENDER_EMAIL_ADDRESS,
    ALERT_EMAIL:
      'sentry-dev-aaaalrpiimoklruew7v7dgo2km@opencrvsworkspace.slack.com'
  },
  vpn: {
    // openconnect details for optional VPN
    type: args['vpn-type'], // e,g, fortinet, wireguard etc
    wireguard: {
      VPN_HOST_ADDRESS: process.env.VPN_HOST_ADDRESS, // IP address for the VPN server
      VPN_ADMIN_PASSWORD: process.env.VPN_ADMIN_PASSWORD
    },
    openconnect: {
      VPN_PROTOCOL: process.env.VPN_PROTOCOL,
      VPN_HOST_ADDRESS: process.env.VPN_HOST_ADDRESS,
      VPN_PORT: process.env.VPN_PORT,
      VPN_USER: process.env.VPN_USER,
      VPN_PWD: process.env.VPN_PWD,
      VPN_SERVERCERT: process.env.VPN_SERVERCERT
    }
  },
  whitelist: {
    CONTENT_SECURITY_POLICY_WILDCARD: '*.', // e.g. *.<your-domain>
    CLIENT_APP_URL: '',
    LOGIN_URL: process.env.DOMAIN ? `https://login.${process.env.DOMAIN}` : ''
  },
  backup: {
    BACKUP_HOST: process.env.BACKUP_HOST || '',
    BACKUP_SSH_USER: process.env.BACKUP_SSH_USER || '',
    BACKUP_DIRECTORY: ''
  }
}

// eslint-disable-next-line no-console
const log = console.log
// eslint-disable-next-line no-console
const error = console.error

function generateLongPassword() {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_'
  let result = ''
  for (let i = 16; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

type VPNConfig =
  | {
      type: 'wireguard'
      wireguard: {
        VPN_HOST_ADDRESS: string
      }
    }
  | {
      type: 'openconnect'
      openconnect: {
        VPN_PROTOCOL: string
        VPN_HOST_ADDRESS: string
        VPN_PORT: string
        VPN_USER: string
        VPN_PWD: string
        VPN_SERVERCERT: string
      }
    }

function createVPNConfiguration(
  config: VPNConfig
): WireguardSecrets | OpenConnectSecrets {
  if (config.type === 'wireguard') {
    const baseValues = config.wireguard
    return {
      ...baseValues,
      VPN_ADMIN_PASSWORD: generateLongPassword()
    }
  }
  return config.openconnect
}

async function main() {
  if (!config.environment) {
    error('Please specify an environment in config.environment')
    process.exit(1)
  }

  if (!['email', 'sms'].includes(args['notification-transport'])) {
    console.error(
      'Please specify a notification transport. It should be either "email" or "sms"'
    )
    process.exit(1)
  }

  if (args.environment === 'production' || args.environment === 'staging') {
    if (!config.vpn.type) {
      error('Please specify VPN details for staging or production environments')
      process.exit(1)
    }
    if (!config.backup.BACKUP_HOST || !config.backup.BACKUP_SSH_USER) {
      error(
        'Please specify backup server details for staging or production environments'
      )
      process.exit(1)
    }
  }

  const { key, key_id } = await getPublicKey(
    config.environment,
    config.github_repository.ORGANISATION,
    config.github_repository.REPOSITORY_NAME
  )
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
      BACKUP_DIRECTORY: config.backup.BACKUP_DIRECTORY
    }
  }

  if (args['configure-vpn']) {
    if (!config.vpn.type) {
      error('Please specify a VPN type with --vpn-type')
      process.exit(1)
    }
    vpnSecrets = createVPNConfiguration(config.vpn.type)
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
    ...backupVariables,
    NOTIFICATION_TRANSPORT: args['notification-transport']
  }

  const allSecretsKeys = Object.keys(SECRETS)

  const allVariablesKeys = Object.keys(VARIABLES)

  if (existingSecrets.length !== 0) {
    log(
      'This environment already has defined secrets. Environment is however currently missing the following secrets:',
      allSecretsKeys.filter(
        (key) => !existingSecrets.find((secret) => secret.name === key)
      )
    )
    for (const secret of existingSecrets) {
      delete SECRETS[secret.name]
    }
  }
  log(existingVariables)

  if (existingVariables.length !== 0) {
    log(
      'This environment already has defined variables. Environment is however currently missing the following variables:',
      allVariablesKeys.filter(
        (key) => !existingVariables.find((secret) => secret.name === key)
      )
    )
    for (const variable of existingVariables) {
      delete VARIABLES[variable.name]
    }
  }

  const errors: string[] = []
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
    log('This is a dry run. Not creating secrets or variables.')
    log('')
    log('Errors:', errors)
    log('')
    log('After all errors are fixed, These secrets will be created:')
    log(secretsToCreate)
    log('These variables would be created:')
    log(variablesToCreate)
    process.exit(0)
  }

  if (errors.length > 0) {
    error(errors)
    process.exit(1)
  }

  for (const [secretName, secretValue] of Object.entries(SECRETS)) {
    log(`Creating secret ${secretName} with value ${secretValue}`)
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
    log(`Creating variable ${variableName} with value ${variableValue}`)

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
