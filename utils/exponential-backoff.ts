/**
 * Exponential backoff implementation for retry logic
 * @module utils/exponential-backoff
 */

export interface IBackoffConfig {
  initialDelay: number;
  maxDelay: number;
  factor: number;
  jitter?: boolean;
}

export class ExponentialBackoff {
  private attempt = 0;
  
  constructor(private config: IBackoffConfig) {}

  /**
   * Get the next delay in milliseconds
   */
  public nextDelay(): number {
    const delay = Math.min(
      this.config.initialDelay * Math.pow(this.config.factor, this.attempt),
      this.config.maxDelay
    );

    this.attempt++;

    // Add jitter to prevent thundering herd
    if (this.config.jitter) {
      const jitter = delay * 0.2 * (Math.random() - 0.5);
      return Math.round(delay + jitter);
    }

    return Math.round(delay);
  }

  /**
   * Reset the backoff counter
   */
  public reset(): void {
    this.attempt = 0;
  }

  /**
   * Get current attempt number
   */
  public get currentAttempt(): number {
    return this.attempt;
  }
}