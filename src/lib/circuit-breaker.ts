type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface CircuitBreakerOptions {
  failureThreshold?: number; // Number of failures before opening
  timeout?: number; // Time in ms before attempting to close
  name?: string;
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private lastFailureTime = 0;
  private successCount = 0;
  private readonly failureThreshold: number;
  private readonly timeout: number;
  private readonly name: string;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000; // 60 seconds default
    this.name = options.name || "unknown";
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // If circuit is open, check if timeout has passed
    if (this.state === "OPEN") {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;

      if (timeSinceLastFailure > this.timeout) {
        console.log(`🔄 Circuit breaker [${this.name}] entering HALF_OPEN state`);
        this.state = "HALF_OPEN";
        this.successCount = 0;
      } else {
        throw new Error(`Circuit breaker OPEN for ${this.name}. Service unavailable.`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === "HALF_OPEN") {
      this.successCount++;

      // Need multiple successes to fully close the circuit
      if (this.successCount >= 2) {
        this.state = "CLOSED";
        this.successCount = 0;
        console.log(`✅ Circuit breaker [${this.name}] recovered - CLOSED`);
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === "HALF_OPEN") {
      // If we fail in HALF_OPEN state, immediately go back to OPEN
      this.state = "OPEN";
      console.error(`❌ Circuit breaker [${this.name}] failed during recovery - back to OPEN`);
      return;
    }

    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      console.error(
        `❌ Circuit breaker [${this.name}] OPEN - stopping requests (failures: ${this.failureCount})`,
      );
    } else {
      console.warn(
        `⚠️  Circuit breaker [${this.name}] failure ${this.failureCount}/${this.failureThreshold}`,
      );
    }
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get circuit statistics
   */
  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null,
      name: this.name,
    };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
    console.log(`🔄 Circuit breaker [${this.name}] manually reset`);
  }
}

// Create circuit breakers for each service
declare global {
  var supabaseCircuit: CircuitBreaker;
  var redisCircuit: CircuitBreaker;
}

export const supabaseCircuit = (globalThis.supabaseCircuit ??= new CircuitBreaker({
  name: "Supabase",
  failureThreshold: 5,
  timeout: 60000,
}));

export const redisCircuit = (globalThis.redisCircuit ??= new CircuitBreaker({
  name: "Redis",
  failureThreshold: 5,
  timeout: 60000,
}));
