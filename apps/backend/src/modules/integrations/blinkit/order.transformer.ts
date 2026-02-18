import { OrderTransformer } from "../../../templates/transformer.interface";
import { CanonicalOrder } from "../../../templates/order.template";

export class BlinkitTransformer implements OrderTransformer {
  transform(payload: any): CanonicalOrder {
    return {
      external_order_id: payload.orderId,
      channel: "blinkit",

      customer_email: payload.customer.email,
      customer_name: payload.customer.name,
      customer_address: payload.customer.address,
      customer_city: payload.customer.city,
      customer_state: payload.customer.state,

      status: payload.status,
      total_amount: Number(payload.totalAmount),
      promo_code: payload.promoCode || null,
      payment_mode: payload.paymentMode,
      balance_payment: Number(payload.balancePayment),

      items: payload.items.map((item: any) => ({
        product_id: item.id,
        product_name: item.name,
        price: Number(item.price),
        quantity: Number(item.qty),
      })),
    };
  }
}
