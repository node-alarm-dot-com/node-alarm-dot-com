export interface WebSocketTokenResponse {
  value: string;
  endpoint: 'wss://webskt.alarm.com:8443' | string;
  errors: unknown[];
  validationErrors: unknown[];
  processingErrors: unknown[];
}

export interface WebSocketEvent {
  /**
   * Timestamp in the form of "2026-04-12T16:21:06.019Z"
   */
  EventDateUtc: string;
  /**
   * UnitId matches against the UnitID of the current system. Sensors are typically prefixed with the UnitId.
   */
  UnitId: number;
  DeviceId: number;
  EventType: number;
  EventValue: number;
  CorrelatedId: number;
  QstringForExtraData: string;
  DeviceType: number;
}

export enum WebSocketEventTypes {
  // Partition / Security System
  Disarmed = 8,
  ArmedStay = 9,
  ArmedAway = 10,
  ArmedNight = 113,
  Alarm = 1,
  AlarmCancelled = 238,
  PendingAlarm = 62,
  ArmingSupervisionFault = 48,
  DisarmingSupervisionFault = 47,

  // Sensors
  Closed = 0,
  Opened = 15,
  Bypassed = 13,
  EndOfBypass = 35,
  Tamper = 7,
  DoorLeftOpen = 101,
  DoorLeftOpenRestoral = 103,
  OpenedClosed = 100,

  // Locks
  DoorUnlocked = 90,
  DoorLocked = 91,
  DoorAccessed = 92,
  BadLockUserCode = 93,
  DoorAccessedDoubleSwipe = 236,
  DoorBuzzedFromWebsite = 182,
  DoorFailedAccess = 180,
  DoorForcedOpen = 181,
  DoorHeldOpen = 184,
  WrongPinCode = 398,

  // Lights & Switches
  LightTurnedOn = 315,
  LightTurnedOff = 316,
  SwitchLevelChanged = 317,

  // Thermostats
  ThermostatSetPointChanged = 94,
  ThermostatModeChanged = 95,
  ThermostatOffset = 105,
  ThermostatFanModeChanged = 120,

  // Image Sensors
  ImageSensorUpload = 99,

  // Panic
  AuxiliaryPanic = 17,
  AuxPanicPendingAlarm = 61,
  AuxPanicSuspectedAlarm = 65,
  ExitButtonPressed = 141,
  FirePanic = 24,
  InAppAuxiliaryPanic = 201,
  InAppFirePanic = 200,
  InAppPolicePanic = 202,
  InAppSilentPolicePanic = 203,
  PolicePanic = 22,
  PolicePanicSuspectedAlarm = 64,
  SilentPolicePanic = 73,
  SilentPolicePanicSuspectedAlarm = 172,

  // Commercial Schedules
  CommercialClosedOnTime = 127,
  CommercialClosedUnexpectedly = 177,
  CommercialEarlyClose = 125,
  CommercialEarlyOpen = 122,
  CommercialLateClose = 126,
  CommercialLateOpen = 123,
  CommercialOpenOnTime = 124,

  // Sump Pump
  SumpPumpAlertCriticalIssueMalfunction = 118,
  SumpPumpAlertCriticalIssueOff = 117,
  SumpPumpAlertIdle = 114,
  SumpPumpAlertNormalOperation = 115,
  SumpPumpAlertPossibleIssue = 116,

  // Network / Router
  NetworkDhcpReservationsUpdated = 433,
  NetworkDhcpSettingsUpdated = 432,
  NetworkMapUpdated = 391,
  NetworkPortForwardingUpdated = 434,
  RouterHostsUpdated = 450,
  RouterProfilesUpdated = 451,
  SpeedTestResultsUpdated = 454,

  // Video
  GoogleSdmEvent = 346,
  VideoAnalyticsDetection = 210,
  VideoAnalytics2Detection = 302,
  VideoCameraTriggered = 71,
  VideoEventTriggered = 76,

  // Package Detection
  PackageDeliveryAlert = 363,
  PackageRetrievalAlert = 364,

  // Access Control
  AccessControlDoorAccessGranted = 298,
  UnknownCardFormatRead = 185,

  // Misc
  UserLoggedIn = 55,
  ViewedByCentralStation = 158
}

export const LOCK_EVENT_TYPES = new Set([WebSocketEventTypes.DoorLocked, WebSocketEventTypes.DoorUnlocked]);

export const SENSOR_EVENT_TYPES = new Set([
  WebSocketEventTypes.Opened,
  WebSocketEventTypes.Closed,
  WebSocketEventTypes.OpenedClosed,
  WebSocketEventTypes.Tamper,
  WebSocketEventTypes.Bypassed,
  WebSocketEventTypes.EndOfBypass,
  WebSocketEventTypes.DoorLeftOpen,
  WebSocketEventTypes.DoorLeftOpenRestoral
]);

export const PARTITION_EVENT_TYPES = new Set([
  WebSocketEventTypes.ArmedAway,
  WebSocketEventTypes.ArmedStay,
  WebSocketEventTypes.ArmedNight,
  WebSocketEventTypes.Disarmed,
  WebSocketEventTypes.Alarm,
  WebSocketEventTypes.AlarmCancelled,
  WebSocketEventTypes.PendingAlarm
]);

export const LIGHT_EVENT_TYPES = new Set([
  WebSocketEventTypes.LightTurnedOn,
  WebSocketEventTypes.LightTurnedOff,
  WebSocketEventTypes.SwitchLevelChanged
]);

export const GARAGE_EVENT_TYPES = new Set([WebSocketEventTypes.Opened, WebSocketEventTypes.Closed]);

export const THERMOSTAT_EVENT_TYPES = new Set([
  WebSocketEventTypes.ThermostatSetPointChanged,
  WebSocketEventTypes.ThermostatModeChanged,
  WebSocketEventTypes.ThermostatFanModeChanged,
  WebSocketEventTypes.ThermostatOffset
]);

export const CAMERA_EVENT_TYPES = new Set([
  WebSocketEventTypes.VideoCameraTriggered,
  WebSocketEventTypes.VideoAnalyticsDetection,
  WebSocketEventTypes.VideoAnalytics2Detection
]);
