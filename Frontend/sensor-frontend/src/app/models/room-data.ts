export interface RoomData {
  id: string;
  name: string;
  floor: 'eg' | 'ug';
  sensors?: {
    temperature?: number;
    humidity?: number;
    co2?: number;
  };
}
