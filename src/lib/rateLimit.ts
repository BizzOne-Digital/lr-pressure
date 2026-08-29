/**
 * Best-effort in-memory rate limiter for public endpoints (e.g. the lead form).
 *
 * NOTE: in a serverless deployment each warm instance keeps its own copy of
 * this map, so this is not a strict global guarantee — it is a practical
 * speed bump against basic spam/bot floods, not a substitute for a shared
 * store like Redis under heavy abuse. Good enough for a local-business site;
 * swap in an Upstash/Redis-backed limiter later if abuse becomes a problem.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function isRateLimited(
  key: string,
  { maxRequests, windowMs }: { maxRequests: number; windowMs: number }
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  if (bucket.count > maxRequests) {
    return true;
  }
  return false;
}

// Periodically clear stale buckets so this doesn't grow unbounded on a
// long-running instance.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(key);
    }
  }, 5 * 60 * 1000);
}
