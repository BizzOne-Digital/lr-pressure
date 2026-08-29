import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, init?: number) {
  return NextResponse.json({ success: true, data }, { status: init ?? 200 });
}

export function created<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

export function unauthorized(message = "Unauthorized") {
  return fail(message, 401);
}

export function notFound(message = "Not found") {
  return fail(message, 404);
}

export function serverError(err: unknown, fallback = "Something went wrong") {
  // Never leak stack traces / internal details to the client; log server-side only.
  console.error(err);
  return fail(fallback, 500);
}

export function handleZodError(err: ZodError) {
  return fail("Validation failed", 422, err.flatten());
}

/**
 * Zod schemas in this project use `.default(...)` on optional fields so that
 * a *full* create/save always gets sensible values. That means running the
 * same schema through `.partial().parse(body)` for a PATCH-style update will
 * silently fill in defaults for every field the caller did NOT send, which
 * then get written to the document and clobber existing values (e.g. a
 * request that only sends `{ order: 3 }` would otherwise reset
 * `description`, `active`, etc. back to their schema defaults).
 *
 * This strips the result back down to only the keys that were actually
 * present in the raw request body, so a partial update stays partial.
 */
export function onlySubmittedKeys<T extends Record<string, unknown>>(
  parsed: T,
  rawBody: Record<string, unknown>
): Partial<T> {
  const submitted = new Set(Object.keys(rawBody));
  return Object.fromEntries(
    Object.entries(parsed).filter(([key]) => submitted.has(key))
  ) as Partial<T>;
}
