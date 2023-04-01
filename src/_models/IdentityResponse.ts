/* eslint-disable @typescript-eslint/naming-convention */
/**
 * The identity response is returned upon authenticating against the Alarm.com API.
 * It's then parsed and the authentication token stored for future use.
 */
export interface IdentityResponse {
  data: IdentityData[];
  included: any[];
  meta: {
    transformer_version: string;
  };
}

export interface IdentityData {
  id: number;
  type: 'identity';
  attributes: {
    timezone: string;
    preferredTimezone: string;
    initialSetupSteps: [];
    helpTours: number[];
    logoSource: string;
    logoName: string;
    dealerPath: string;
    mobileAppBrand: string;
    favIconUrl: string;
    poweredByPath: string;
    copyrightInfo: string;
    trademarkInfo: string;
    hasCompletedOnboarding: boolean;
    isEnterprise: boolean;
    isAccessControl: boolean;
    isCommercial: boolean;
    isPointCentral: boolean;
    isPcRpm: boolean;
    isPointCentralSTR: boolean;
    isPointCentralAccessControl: boolean;
    isPointCentralAccessControlSTR: boolean;
    isUsingEnterpriseLocationsCache: boolean;
    isMobileApp: boolean;
    isMobileTechApp: boolean;
    isVisualIdentification: boolean;
    isEscalatedEvents: boolean;
    isWindowsDevice: boolean;
    applicationBuildNumber: number;
    canViewHighlights: boolean;
    canViewVideoClips: boolean;
    hasAccessToAudioForNonDoorbellCameras: boolean;
    hasSmartArmingSensorBased: boolean;
    isSmartDisarmEligible: boolean;
    canEditNoiseSensors: boolean;
    isManagedAccessAccount: boolean;
    supportedNativeBridgeFeatures: null;
    supportedNativeViewTransitions: null;
    supportedDisplayModeFeatures: null;
    hasTroubleConditionsService: boolean;
    errorReportingConfiguration: {
      providerName: string;
      apiKey: null;
      scriptUrl: null;
      isEnabled: boolean;
      machineName: string;
      logErrorsToConsole: boolean;
      showNotificationOnError: boolean;
      redirectToErrorRouteOnUnhandledError: boolean;
      environment: string;
      servicePlan: string;
    };
    enableHomeScreenConfiguration: boolean;
    accountType: number;
    externalTerms: string;
    externalPrivacyPolicy: string;
    shouldHidePrivacyPolicyLink: boolean;
    shouldHideTermsAndConditionsLink: boolean;
    applicationSessionProperties: {
      shouldTimeout: boolean;
      keepAliveUrl: string;
      enableKeepAlive: boolean;
      logoutTimeoutMs: number;
      inactivityWarningTimeoutMs: number;
    };
    postLoginRedirect: null;
    localizeTempUnitsToCelsius: boolean;
    canDonateClips: boolean;
    hasInternalBetaAccess: boolean;
  };
  relationships: {
    dealer: {
      data: Relationship;
    };
    primaryColor: {
      data: Relationship;
    };
    secondaryColor: {
      data: Relationship;
    };
    navColor: {
      data: Relationship;
    };
    profile: {
      data: Relationship;
    };
    accountInformation: {
      data: Relationship;
    };
    availableRouteItems: {
      data: Relationship[];
      meta: {
        count: string;
      };
    };
    wizard: {
      data: Relationship[] | null;
    };
    clipDonationAgreement: {
      data: Relationship;
    };
    selectedSystem: {
      data: Relationship;
    };
    selectedSystemGroup: {
      data: Relationship | null;
    };
  };
}

export interface Relationship {
  id: string;
  type:
  | 'devices/partition'
  | 'devices/lock'
  | 'video/camera'
  | 'devices/garage-door'
  | 'automation/scene'
  | 'devices/sensor'
  | 'devices/light'
  | 'devices/thermostat'
  | 'geolocation/geo-device'
  | 'geolocation/fence'
  | 'systems/configuration'
  | 'navigation/route-item'
  | 'dealers/dealer'
  | 'ui/color'
  | 'profile/profile'
  | 'accountInformation/account-information';
}
