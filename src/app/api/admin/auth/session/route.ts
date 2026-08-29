import { getCurrentAdmin } from "@/lib/auth";
import { ok, unauthorized } from "@/lib/api-response";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return unauthorized();
  return ok(admin);
}
