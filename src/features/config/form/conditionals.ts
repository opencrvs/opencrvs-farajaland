import { IntegratingSystemType } from './types'

export const conditionals = {
  // This is an example how you can override the conditionals found from opencrvs-core
  iDType: {
    action: 'hide',
    expression: "!values.iDType || (values.iDType !== 'OTHER')"
  },
  hideIfNidIntegrationDisabled: {
    action: 'hide',
    expression: `const nationalIdSystem =
    offlineCountryConfig &&
    offlineCountryConfig.systems.find(s => s.integratingSystemType === '${IntegratingSystemType.Mosip}');
    !nationalIdSystem ||
    !nationalIdSystem.settings.openIdProviderBaseUrl ||
    !nationalIdSystem.settings.openIdProviderClientId ||
    !nationalIdSystem.settings.openIdProviderClaims;
  `
  }
}
