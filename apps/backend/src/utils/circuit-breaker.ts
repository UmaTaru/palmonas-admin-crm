export class CircuitBreaker {

  private failureCount = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private nextAttempt = 0;

  constructor(
    private failureThreshold: number = 3,
    private recoveryTimeMs: number = 10000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {

    if (this.state === "OPEN") {
      if (Date.now() > this.nextAttempt) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure() {
    this.failureCount++;

    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.recoveryTimeMs;
    }
  }

  private reset() {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  getState() {
    return this.state;
  }
}
