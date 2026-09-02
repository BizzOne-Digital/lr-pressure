import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Project } from "@/models/Project";
import { projectSchema } from "@/lib/validation";
import { ok, created, fail, handleZodError, serverError } from "@/lib/api-response";

export async function GET() {
  try {
    await connectToDatabase();
    const projects = await Project.find().sort({ order: 1, createdAt: 1 }).lean();
    return ok(projects);
  } catch (err) {
    return serverError(err, "Failed to load projects");
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const data = projectSchema.parse(body);

    const existing = await Project.findOne({ slug: data.slug });
    if (existing) return fail("A project with this slug already exists", 409);

    const project = await Project.create(data);
    return created(project);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return serverError(err, "Failed to create project");
  }
}
