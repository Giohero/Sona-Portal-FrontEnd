import { Order } from "./car";

export interface Log {
    id: string;
    type: string;
    sequence: number;
    action: string;
    timestamp: string;
    user:  string | null;
    order?: Order;
  }