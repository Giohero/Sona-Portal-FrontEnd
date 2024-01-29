import { Order } from "./order"

export class indexOrder {
    id?: number
    Action?: string
    Timestamp?: string
    DocNum?: any
    DocEntry?: any
    Order?: any
    status?: string
    error?: string
    message?: string[]
    orderSAP?: Order
}