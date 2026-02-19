import { retry } from "../../../utils/retry.util";
import { CircuitBreaker } from "../../../utils/circuit-breaker";

const breaker = new CircuitBreaker(3, 10000);

export class BlinkitAdapter {

  async updateOrderStatus(orderId: string, status: string) {

    return breaker.execute(() =>
      retry(async () => {

        console.log(`Calling Blinkit API for ${orderId}`);

        // simulate random failure
        if (Math.random() < 0.3) {
          throw new Error("Blinkit API failed");
        }

        return { success: true };

      }, 3, 500)
    );
  }
}
