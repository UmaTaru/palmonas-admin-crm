import { CanonicalOrder } from "./order.template";
import { Request } from "express";

export interface OrderTransformer {
  transform(payload: any, req: Request): CanonicalOrder;
}
