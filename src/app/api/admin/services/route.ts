import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Service } from "@/models/Service";
import { serviceSchema } from "@/lib/validation";
import { ok, created, fail, handleZodError, serverError } from "@/lib/api-response";

export async function GET() {
  try {
    await connectToDatabase();
    const services = await Service.find().sort({ order: 1, createdAt: 1 }).lean();
    return ok(services);
  } catch (err) {
    return serverError(err, "Failed to load services");
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const data = serviceSchema.parse(body);

    const existing = await Service.findOne({ slug: data.slug });
    if (existing) return fail("A service with this slug already exists", 409);

    const service = await Service.create(data);
    return created(service);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return serverError(err, "Failed to create service");
  }
}
