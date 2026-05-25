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
  UnitId: number;
  DeviceId: number;
  EventType: number;
  EventValue: number;
  CorrelatedId: number;
  QstringForExtraData: string;
  DeviceType: number;
}
