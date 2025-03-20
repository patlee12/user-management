/**
 * Type that satisfies @Throttle's internal typing requirements.
 * Directly compatible with `@Throttle()` expectations.
 */
export type ThrottleConfig = {
  limit: number;
  ttl: number;
} & Record<string, any>;
