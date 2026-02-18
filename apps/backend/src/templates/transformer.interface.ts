import { CanonicalOrder } from "./order.template";

export interface OrderTransformer {
  transform(payload: any): CanonicalOrder;
}
