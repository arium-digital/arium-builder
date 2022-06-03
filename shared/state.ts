import { ProducerIds } from "./communication";

export interface UserLocationState {
  sessionId: string;
  spaceId: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
  lastUpdated: number;
}

export interface UserProducersState {
  sessionId: string;
  spaceId: string;
  producerIds: ProducerIds;
}

export interface UserLocationsInSpace {
  users: {
    [userId: string]: {
      position: [number, number, number];
      rotation: [number, number, number, number];
    };
  };
}
