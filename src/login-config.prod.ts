import { env } from './environment'
import { defineLoginConfig } from '@opencrvs/toolkit/application-config'
import { applicationConfig } from './api/application/application-config'

const scheme = 'https'
const hostname = env.DOMAIN
const sentry = env.SENTRY_DSN

export const loginConfigProd = defineLoginConfig({
  COUNTRY: 'FAR',
  LANGUAGES: ['en', 'fr'],
  SENTRY: sentry,
  // TODO: configure LOGIN_BACKGROUND — replace this placeholder,
  LOGIN_BACKGROUND: { backgroundColor: '#F4F4F7' },
  USER_NOTIFICATION_DELIVERY_METHOD: applicationConfig.USER_NOTIFICATION_DELIVERY_METHOD,
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: applicationConfig.INFORMANT_NOTIFICATION_DELIVERY_METHOD,
  PHONE_NUMBER_PATTERN: applicationConfig.PHONE_NUMBER_PATTERN
})
