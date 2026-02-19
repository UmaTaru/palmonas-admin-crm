export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 300,
  backoffFactor: number = 2
): Promise<T> {

  let attempt = 0;

  while (attempt <= retries) {
    try {
      console.log(`Retry attempt: ${attempt}`);
      return await fn();
    } catch (error: any) {
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
