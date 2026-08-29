import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Testimonial } from "@/models/Testimonial";
import { testimonialSchema } from "@/lib/validation";
import { created, ok, handleZodError, serverError } from "@/lib/api-response";

export async function GET() {
  try {
    await connectToDatabase();
    const items = await Testimonial.find().sort({ order: 1, createdAt: 1 }).lean();
    return ok(items);
  } catch (err) {
    return serverError(err, "Failed to load testimonials");
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const data = testimonialSchema.parse(body);
    const item = await Testimonial.create(data);
    return created(item);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return serverError(err, "Failed to create testimonial");
  }
}
