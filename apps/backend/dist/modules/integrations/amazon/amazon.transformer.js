"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmazonTransformer = void 0;
class AmazonTransformer {
    transform(payload, req) {
        req.log.info({
            channel: "amazon",
            orderId: `${payload.orderId}`,
            payload: payload,
        });
        return {
            external_order_id: payload.orderId,
            channel: "amazon",
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
exports.AmazonTransformer = AmazonTransformer;
