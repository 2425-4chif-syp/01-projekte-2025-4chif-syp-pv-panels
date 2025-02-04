export interface SensorData {
  topic: string;
  message: {
    value: number;
  };
}

export interface SensorType {
  co2?: number;
  temperature?: number;
  humidity?: number;
}
