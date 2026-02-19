import { retry } from "../../../utils/retry.util";
import { CircuitBreaker } from "../../../utils/circuit-breaker";

const breaker = new CircuitBreaker(3, 10000);

export class AmazonAdapter {

  async updateOrderStatus(orderId: string, status: string) {

    return breaker.execute(() =>
      retry(async () => {

        // Simulated external API call
        console.log(`Calling Amazon API for ${orderId}`);

        if (Math.random() < 0.3) {
          throw new Error("Amazon API failed");
        }

        return { success: true };

      }, 3, 500)
    );
  }
}
