import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectToDatabase } from "@/lib/db";
import { ServicePlan } from "@/models/ServicePlan";
import { servicePlanSchema } from "@/lib/validation";
import { ok, created, handleZodError, serverError } from "@/lib/api-response";

export async function GET() {
  try {
    await connectToDatabase();
    const plans = await ServicePlan.find().sort({ order: 1, createdAt: 1 }).lean();
    return ok(plans);
  } catch (err) {
    return serverError(err, "Failed to load service plans");
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const data = servicePlanSchema.parse(body);

    const plan = await ServicePlan.create(data);
    return created(plan);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return serverError(err, "Failed to create service plan");
  }
}
