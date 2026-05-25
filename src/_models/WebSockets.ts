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
