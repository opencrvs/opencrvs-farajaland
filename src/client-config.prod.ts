import { env } from './environment'
import { defineClientConfig } from '@opencrvs/toolkit/application-config'

const scheme = 'https'
const hostname = env.DOMAIN
const sentry = env.SENTRY_DSN

export const clientConfigProd = defineClientConfig({
  COUNTRY: 'FAR',
  LANGUAGES: ['en', 'fr'],
  SENTRY: sentry,
  DASHBOARDS: [
  {
    id: 'registrations',
    title: {
          id: 'dashboard.registrationsTitle',
          defaultMessage: 'Registrations Dashboard',
          description: 'Menu item for registrations dashboard'
        },
    url: `${scheme}//metabase.${hostname}/public/dashboard/03be04d6-bde0-4fa7-9141-21cea2a7518b#bordered=false&titled=false&refresh=300`
  },
  {
    id: 'completeness',
    title: {
          id: 'dashboard.completenessTitle',
          defaultMessage: 'Completeness Dashboard',
          description: 'Menu item for completeness dashboard'
        },
    url: `${scheme}//metabase.${hostname}/public/dashboard/41940907-8542-4e18-a05d-2408e7e9838a#bordered=false&titled=false&refresh=300`
  },
  {
    id: 'registry',
    title: {
          id: 'dashboard.registryTitle',
          defaultMessage: 'Registry',
          description: 'Menu item for registry dashboard'
        },
    url: `${scheme}//metabase.${hostname}/public/dashboard/dc66b77a-79df-4f68-8fc8-5e5d5a2d7a35#bordered=false&titled=false&refresh=300`
  }
],
  FEATURES: {},
  // TODO: configure REGISTER_BACKGROUND — replace this placeholder,
  REGISTER_BACKGROUND: { backgroundColor: '#F4F4F7' }
})
