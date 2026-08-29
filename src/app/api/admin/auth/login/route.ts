import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Admin } from "@/models/Admin";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { ok, fail, handleZodError, serverError } from "@/lib/api-response";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (isRateLimited(`login:${ip}`, { maxRequests: 10, windowMs: 5 * 60 * 1000 })) {
      return fail("Too many login attempts. Please try again in a few minutes.", 429);
    }

    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    await connectToDatabase();
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    // Constant-shaped response whether the email exists or not, to avoid
    // leaking which admin emails are registered.
    if (!admin) {
      return fail("Invalid email or password", 401);
    }

    const passwordValid = await verifyPassword(password, admin.passwordHash);
    if (!passwordValid) {
      return fail("Invalid email or password", 401);
    }

    const token = await createSessionToken({
      adminId: admin._id.toString(),
      email: admin.email,
      name: admin.name,
    });
    await setSessionCookie(token);

    admin.lastLoginAt = new Date();
    await admin.save();

    return ok({ email: admin.email, name: admin.name });
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return serverError(err, "Login failed");
  }
}
