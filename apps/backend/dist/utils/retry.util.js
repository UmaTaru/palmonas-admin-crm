"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retry = retry;
async function retry(fn, retries = 3, delayMs = 300, backoffFactor = 2) {
    let attempt = 0;
    while (attempt <= retries) {
        try {
            console.log(`Retry attempt: ${attempt}`);
            return await fn();
        }
        catch (error) {
            console.error(`Retry attempt ${attempt} failed:`, error.message);
            if (attempt === retries) {
                throw error;
            }
            const waitTime = delayMs * Math.pow(backoffFactor, attempt);
            console.log(`Waiting ${waitTime}ms before retrying...`);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
            attempt++;
        }
    }
    throw new Error("Retry failed unexpectedly");
}
