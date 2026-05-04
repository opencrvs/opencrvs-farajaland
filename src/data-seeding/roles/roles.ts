import { defineScopes, defineRoles } from '@opencrvs/toolkit/scopes'
export const roles = defineRoles([
  {
    id: 'FIELD_AGENT',
    label: {
      defaultMessage: 'Field Agent',
      description: 'Name for user role Field Agent',
      id: 'userRole.fieldAgent'
    },
    scopes: defineScopes([
      { type: 'user.read-only-my-audit' },
      {
        type: 'record.search',
        options: { event: ['birth'], placeOfEvent: 'all' }
      },
      {
        type: 'record.search',
        options: { event: ['death'], placeOfEvent: 'administrativeArea' }
      },
      {
        type: 'record.search',
        options: { event: ['tennis-club-membership'], placeOfEvent: 'all' }
      },
      {
        type: 'workqueue',
        options: {
          ids: [
            'assigned-to-you',
            'recent',
            'requires-updates-self',
            'sent-for-review'
          ]
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.notify',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }
    ])
  },
  {
    id: 'REGISTRATION_AGENT',
    label: {
      defaultMessage: 'Registration Officer',
      description: 'Name for user role Registration Officer',
      id: 'userRole.registrationOfficer'
    },
    scopes: defineScopes([
      { type: 'performance.read' },
      { type: 'performance.read-dashboards' },
      {
        type: 'organisation.read-locations',
        options: { accessLevel: 'location' }
      },
      { type: 'user.read-only-my-audit' },
      {
        type: 'organisation.read-locations',
        options: { accessLevel: 'administrativeArea' }
      },
      { type: 'user.read-only-my-audit' },
      {
        type: 'record.search',
        options: { event: ['birth'], placeOfEvent: 'all' }
      },
      {
        type: 'record.search',
        options: { event: ['death'], placeOfEvent: 'all' }
      },
      {
        type: 'record.search',
        options: { event: ['tennis-club-membership'], placeOfEvent: 'all' }
      },
      {
        type: 'workqueue',
        options: {
          ids: [
            'assigned-to-you',
            'recent',
            'requires-completion',
            'requires-updates-office',
            'in-review',
            'sent-for-approval',
            'in-external-validation',
            'ready-to-print',
            'ready-to-issue'
          ]
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.read',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.custom-action',
        options: {
          event: ['birth', 'death', 'tennis-club-membership'],
          customActionTypes: ['VALIDATE_DECLARATION']
        }
      },
      {
        type: 'record.reject',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.archive',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.review-duplicates',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.print-certified-copies',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.request-correction',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }
    ])
  },
  {
    id: 'LOCAL_REGISTRAR',
    label: {
      defaultMessage: 'Local Registrar',
      description: 'Name for user role Local Registrar',
      id: 'userRole.localRegistrar'
    },
    scopes: defineScopes([
      { type: 'profile.electronic-signature' },
      { type: 'performance.read' },
      { type: 'performance.read-dashboards' },
      { type: 'profile.electronic-signature' },
      { type: 'user.read-only-my-audit' },
      {
        type: 'organisation.read-locations',
        options: { accessLevel: 'location' }
      },
      { type: 'performance.vital-statistics-export' },
      {
        type: 'organisation.read-locations',
        options: { accessLevel: 'administrativeArea' }
      },
      { type: 'user.read', options: { accessLevel: 'location' } },
      {
        type: 'record.search',
        options: { event: ['birth'], placeOfEvent: 'all' }
      },
      {
        type: 'record.search',
        options: { event: ['death'], placeOfEvent: 'all' }
      },
      {
        type: 'record.search',
        options: { event: ['tennis-club-membership'], placeOfEvent: 'all' }
      },
      {
        type: 'workqueue',
        options: {
          ids: [
            'assigned-to-you',
            'recent',
            'requires-completion',
            'requires-updates-office',
            'in-review-all',
            'in-external-validation',
            'ready-to-print',
            'ready-to-issue'
          ]
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.read',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.reject',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.archive',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.review-duplicates',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.register',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.print-certified-copies',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.correct',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.unassign-others',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }
    ])
  },
  {
    id: 'LOCAL_SYSTEM_ADMIN',
    label: {
      defaultMessage: 'Administrator',
      description: 'Name for user role Administrator',
      id: 'userRole.administrator'
    },
    scopes: defineScopes([
      {
        type: 'organisation.read-locations',
        options: { accessLevel: 'administrativeArea' }
      },
      { type: 'user.create', options: { accessLevel: 'administrativeArea' } },
      { type: 'user.create', options: {} },
      { type: 'user.edit', options: { accessLevel: 'administrativeArea' } },
      { type: 'user.edit', options: {} },
      { type: 'user.read', options: { accessLevel: 'administrativeArea' } }
    ])
  },
  {
    id: 'NATIONAL_SYSTEM_ADMIN',
    label: {
      defaultMessage: 'National Administrator',
      description: 'Name for user role National Administrator',
      id: 'userRole.nationalAdministrator'
    },
    scopes: defineScopes([
      { type: 'config.update-all' },
      { type: 'organisation.read-locations', options: {} },
      { type: 'user.create', options: {} },
      { type: 'user.create', options: {} },
      { type: 'user.edit', options: {} },
      { type: 'user.edit', options: {} },
      { type: 'user.read', options: {} },
      { type: 'performance.read' },
      { type: 'performance.read-dashboards' },
      { type: 'performance.vital-statistics-export' },
      { type: 'record.reindex' },
      { type: 'config.update-all' }
    ])
  },
  {
    id: 'PERFORMANCE_MANAGER',
    label: {
      defaultMessage: 'Operations Manager',
      description: 'Name for user role Operations Manager',
      id: 'userRole.operationsManager'
    },
    scopes: defineScopes([
      { type: 'performance.read' },
      { type: 'performance.read-dashboards' },
      { type: 'performance.vital-statistics-export' },
      { type: 'organisation.read-locations', options: {} }
    ])
  },
  {
    id: 'NATIONAL_REGISTRAR',
    label: {
      defaultMessage: 'Registrar General',
      description: 'Name for user role Registrar General',
      id: 'userRole.registrarGeneral'
    },
    scopes: defineScopes([
      { type: 'profile.electronic-signature' },
      { type: 'performance.read' },
      { type: 'performance.read-dashboards' },
      { type: 'performance.vital-statistics-export' },
      { type: 'user.read-only-my-audit' },
      { type: 'profile.electronic-signature' },
      {
        type: 'organisation.read-locations',
        options: { accessLevel: 'location' }
      },
      { type: 'user.read', options: { accessLevel: 'location' } },
      {
        type: 'organisation.read-locations',
        options: { accessLevel: 'administrativeArea' }
      },
      { type: 'user.read', options: { accessLevel: 'location' } },
      {
        type: 'record.search',
        options: { event: ['birth'], placeOfEvent: 'all' }
      },
      {
        type: 'record.search',
        options: { event: ['death'], placeOfEvent: 'all' }
      },
      {
        type: 'record.search',
        options: { event: ['tennis-club-membership'], placeOfEvent: 'all' }
      },
      {
        type: 'workqueue',
        options: {
          ids: [
            'assigned-to-you',
            'recent',
            'requires-completion',
            'requires-updates-office',
            'in-review-all',
            'in-external-validation',
            'ready-to-print',
            'ready-to-issue'
          ]
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.read',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.reject',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.archive',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.review-duplicates',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.register',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.print-certified-copies',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.correct',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.unassign-others',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }
    ])
  },
  {
    id: 'HOSPITAL_CLERK',
    label: {
      defaultMessage: 'Hospital Clerk',
      description: 'Name for user role Hospital Clerk',
      id: 'userRole.hospitalClerk'
    },
    scopes: defineScopes([
      { type: 'user.read-only-my-audit' },
      {
        type: 'record.search',
        options: { event: ['birth'], placeOfEvent: 'all' }
      },
      {
        type: 'record.search',
        options: { event: ['death'], placeOfEvent: 'all' }
      },
      {
        type: 'record.search',
        options: { event: ['tennis-club-membership'], placeOfEvent: 'all' }
      },
      {
        type: 'workqueue',
        options: {
          ids: [
            'assigned-to-you',
            'recent',
            'requires-updates-self',
            'sent-for-review'
          ]
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.read',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.notify',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }
    ])
  },
  {
    id: 'COMMUNITY_LEADER',
    label: {
      defaultMessage: 'Community Leader',
      description: 'Name for user role Community Leader',
      id: 'userRole.communityLeader'
    },
    scopes: defineScopes([
      { type: 'user.read-only-my-audit' },
      {
        type: 'record.search',
        options: { event: ['birth'], placeOfEvent: 'all' }
      },
      {
        type: 'record.search',
        options: { event: ['death'], placeOfEvent: 'all' }
      },
      {
        type: 'record.search',
        options: { event: ['tennis-club-membership'], placeOfEvent: 'all' }
      },
      {
        type: 'workqueue',
        options: {
          ids: [
            'assigned-to-you',
            'recent',
            'sent-for-review',
            'ready-to-print'
          ]
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.read',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.notify',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.print-certified-copies',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }
    ])
  },
  // Legacy roles from v1.8 for backwards compatibility
  {
    id: 'POLICE_OFFICER',
    label: {
      defaultMessage: 'Police Officer',
      description: 'Name for user role Police Officer',
      id: 'userRole.policeOfficer'
    },
    scopes: defineScopes([
      {
        type: 'record.search',
        options: { event: ['birth'], placeOfEvent: 'all' }
      },
      {
        type: 'record.search',
        options: { event: ['death'], placeOfEvent: 'all' }
      },
      {
        type: 'record.search',
        options: { event: ['tennis-club-membership'], placeOfEvent: 'all' }
      },
      {
        type: 'workqueue',
        options: {
          ids: [
            'assigned-to-you',
            'recent',
            'requires-updates-self',
            'sent-for-review'
          ]
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.notify',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }
    ])
  },
  {
    id: 'SOCIAL_WORKER',
    label: {
      defaultMessage: 'Social Worker',
      description: 'Name for user role Social Worker',
      id: 'userRole.socialWorker'
    },
    scopes: defineScopes([
      {
        type: 'record.search',
        options: { event: ['birth'], placeOfEvent: 'all' }
      },
      {
        type: 'record.search',
        options: { event: ['death'], placeOfEvent: 'all' }
      },
      {
        type: 'record.search',
        options: { event: ['tennis-club-membership'], placeOfEvent: 'all' }
      },
      {
        type: 'workqueue',
        options: {
          ids: [
            'assigned-to-you',
            'recent',
            'requires-updates-self',
            'sent-for-review'
          ]
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.notify',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }
    ])
  },
  {
    id: 'HEALTHCARE_WORKER',
    label: {
      defaultMessage: 'Healthcare Worker',
      description: 'Name for user role Healthcare Worker',
      id: 'userRole.healthcareWorker'
    },
    scopes: defineScopes([
      {
        type: 'record.search',
        options: { event: ['birth'], placeOfEvent: 'all' }
      },
      {
        type: 'record.search',
        options: { event: ['death'], placeOfEvent: 'all' }
      },
      {
        type: 'record.search',
        options: { event: ['tennis-club-membership'], placeOfEvent: 'all' }
      },
      {
        type: 'workqueue',
        options: {
          ids: [
            'assigned-to-you',
            'recent',
            'requires-updates-self',
            'sent-for-review'
          ]
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.notify',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }
    ])
  },
  {
    id: 'LOCAL_LEADER',
    label: {
      defaultMessage: 'Local Leader',
      description: 'Name for user role Local Leader',
      id: 'userRole.LocalLeader'
    },
    scopes: defineScopes([
      {
        type: 'record.search',
        options: { event: ['birth'], placeOfEvent: 'all' }
      },
      {
        type: 'record.search',
        options: { event: ['death'], placeOfEvent: 'all' }
      },
      {
        type: 'record.search',
        options: { event: ['tennis-club-membership'], placeOfEvent: 'all' }
      },
      {
        type: 'workqueue',
        options: {
          ids: [
            'assigned-to-you',
            'recent',
            'requires-updates-self',
            'sent-for-review'
          ]
        }
      },
      {
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      },
      {
        type: 'record.notify',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }
    ])
  }
])
