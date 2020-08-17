export interface IdentityResponse {
  data: {
    id: number,
    type: 'identity',
    attributes: {
      timezone: string,
      initialSetupSteps: [],
      helpTours: number[],
      logoSource: string,
      logoName: string,
      dealerPath: string,
      favIconUrl: string,
      poweredByPath: string,
      copyrightInfo: string,
      trademarkInfo: string,
      hasCompletedOnboarding: boolean,
      isEnterprise: boolean,
      isAccessControl: boolean,
      isCommercial: boolean,
      isPointCentral: boolean,
      isPcRpm: boolean,
      isPointCentralSTR: boolean,
      isMobileApp: boolean,
      useWebsockets: boolean,
      websocketServiceEndpoint: string,
      enabledWebsocketMessageHandlers: null,
      canBrowserEnableFlashDirectly: boolean,
      supportsEnableFlashPrompt: boolean,
      supportedNativeBridgeFeatures: null,
      hasTroubleConditionsService: boolean,
      errorReportingConfiguration: {
        providerName: string,
        apiKey: null,
        scriptUrl: null,
        isEnabled: boolean,
        machineName: string,
        logErrorsToConsole: boolean,
        showNotificationOnError: boolean,
        redirectToErrorRouteOnUnhandledError: boolean,
        environment: string,
        servicePlan: string
      },
      enableHomeScreenConfiguration: boolean,
      accountType: number,
      externalTerms: string,
      externalPrivacyPolicy: string,
      applicationSessionProperties: {
        shouldTimeout: boolean,
        keepAliveUrl: string,
        enableKeepAlive: boolean,
        logoutTimeoutMs: number,
        inactivityWarningTimeoutMs: number
      },
      postLoginRedirect: null,
      canDonateClips: boolean,
      hasInternalBetaAccess: boolean
    },
    relationships: {
      dealer: {
        data: Relationship
      },
      primaryColor: {
        data: Relationship
      },
      secondaryColor: {
        data: Relationship
      },
      navColor: {
        data: Relationship
      },
      profile: {
        data: Relationship
      },
      accountInformation: {
        data: Relationship
      },
      availableRouteItems: {
        data: Relationship[],
        meta: {
          count: string
        }
      },
      wizard: {
        data: Relationship[] | null
      },
      clipDonationAgreement: {
        data: Relationship
      },
      selectedSystem: {
        data: Relationship
      },
      selectedSystemGroup: {
        data: Relationship | null
      }
    }
  },
  included: any[],
  meta: {
    transformer_version: string
  }
}

export interface Relationship {
  id: string,
  type: 'devices/partition' | 'devices/lock' | 'video/camera' | 'devices/garage-door' | 'automation/scene' |
    'devices/sensor' | 'devices/light' | 'devices/thermostat' | 'geolocation/geo-device' | 'geolocation/fence' |
    'systems/configuration' | 'navigation/route-item' | 'dealers/dealer' | 'ui/color' | 'profile/profile' | 'accountInformation/account-information'
}
