export interface DeltaUpdate {
  id: string;
  type: 'ship' | 'crane' | 'container';
  position: [number, number, number]; // [x, y, z]
  telemetry: {
    status: string;
    weight?: number;
    destination?: string;
    speed?: number;
  };
  timestamp: string;
}