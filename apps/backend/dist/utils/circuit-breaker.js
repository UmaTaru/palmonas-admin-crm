"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = void 0;
class CircuitBreaker {
    constructor(failureThreshold = 3, recoveryTimeMs = 10000) {
        this.failureThreshold = failureThreshold;
        this.recoveryTimeMs = recoveryTimeMs;
        this.failureCount = 0;
        this.state = "CLOSED";
        this.nextAttempt = 0;
    }
    async execute(fn) {
        if (this.state === "OPEN") {
            if (Date.now() > this.nextAttempt) {
                this.state = "HALF_OPEN";
            }
            else {
                throw new Error("Circuit breaker is OPEN");
            }
        }
        try {
            const result = await fn();
            this.reset();
            return result;
        }
        catch (error) {
            this.recordFailure();
            throw error;
        }
    }
    recordFailure() {
        this.failureCount++;
        if (this.failureCount >= this.failureThreshold) {
            this.state = "OPEN";
            this.nextAttempt = Date.now() + this.recoveryTimeMs;
        }
    }
    reset() {
        this.failureCount = 0;
        this.state = "CLOSED";
    }
    getState() {
        return this.state;
    }
}
exports.CircuitBreaker = CircuitBreaker;
