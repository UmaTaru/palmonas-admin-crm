"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlinkitAdapter = void 0;
const retry_util_1 = require("../../../utils/retry.util");
const circuit_breaker_1 = require("../../../utils/circuit-breaker");
const breaker = new circuit_breaker_1.CircuitBreaker(3, 10000);
class BlinkitAdapter {
    async updateOrderStatus(orderId, status) {
        return breaker.execute(() => (0, retry_util_1.retry)(async () => {
            console.log(`Calling Blinkit API for ${orderId}`);
            if (Math.random() < 0.3) {
                throw new Error("Blinkit API failed");
            }
            return { success: true };
        }, 3, 500));
    }
}
exports.BlinkitAdapter = BlinkitAdapter;
