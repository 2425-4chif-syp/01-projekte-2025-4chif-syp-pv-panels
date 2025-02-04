export interface RoomData {
  id: string;
  name: string;
  floor: 'eg' | 'ug';
  sensors: {
    co2?: number;
    temperature?: number;
    humidity?: number;
  };
}
