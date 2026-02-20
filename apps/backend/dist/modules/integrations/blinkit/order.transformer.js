"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlinkitTransformer = void 0;
class BlinkitTransformer {
    transform(payload, req) {
        req.log.info({
            channel: "blinkit",
            orderId: `${payload.orderId}`,
            payload: payload,
        });
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
            items: payload.items.map((item) => ({
                product_id: item.id,
                product_name: item.name,
                price: Number(item.price),
                quantity: Number(item.qty),
            })),
        };
    }
}
exports.BlinkitTransformer = BlinkitTransformer;
