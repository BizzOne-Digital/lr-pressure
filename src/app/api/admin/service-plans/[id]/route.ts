import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectToDatabase } from "@/lib/db";
import { ServicePlan } from "@/models/ServicePlan";
import { servicePlanSchema } from "@/lib/validation";
import { ok, notFound, handleZodError, serverError, onlySubmittedKeys } from "@/lib/api-response";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const parsed = servicePlanSchema.partial().parse(body);
    const data = onlySubmittedKeys(parsed, body);

    const plan = await ServicePlan.findByIdAndUpdate(id, data, { new: true });
    if (!plan) return notFound("Service plan not found");
    return ok(plan);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return serverError(err, "Failed to update service plan");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const plan = await ServicePlan.findByIdAndDelete(id);
    if (!plan) return notFound("Service plan not found");
    return ok({ deleted: true });
  } catch (err) {
    return serverError(err, "Failed to delete service plan");
  }
}
