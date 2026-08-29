import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Service } from "@/models/Service";
import { serviceSchema } from "@/lib/validation";
import { ok, notFound, fail, handleZodError, serverError, onlySubmittedKeys } from "@/lib/api-response";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const parsed = serviceSchema.partial().parse(body);
    const data = onlySubmittedKeys(parsed, body);

    if (data.slug) {
      const existing = await Service.findOne({ slug: data.slug, _id: { $ne: id } });
      if (existing) return fail("A service with this slug already exists", 409);
    }

    const service = await Service.findByIdAndUpdate(id, data, { new: true });
    if (!service) return notFound("Service not found");
    return ok(service);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return serverError(err, "Failed to update service");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const service = await Service.findByIdAndDelete(id);
    if (!service) return notFound("Service not found");
    return ok({ deleted: true });
  } catch (err) {
    return serverError(err, "Failed to delete service");
  }
}
