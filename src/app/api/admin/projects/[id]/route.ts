import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Project } from "@/models/Project";
import { projectSchema } from "@/lib/validation";
import { ok, notFound, fail, handleZodError, serverError, onlySubmittedKeys } from "@/lib/api-response";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const parsed = projectSchema.partial().parse(body);
    const data = onlySubmittedKeys(parsed, body);

    if (data.slug) {
      const existing = await Project.findOne({ slug: data.slug, _id: { $ne: id } });
      if (existing) return fail("A project with this slug already exists", 409);
    }

    const project = await Project.findByIdAndUpdate(id, data, { new: true });
    if (!project) return notFound("Project not found");
    return ok(project);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return serverError(err, "Failed to update project");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const project = await Project.findByIdAndDelete(id);
    if (!project) return notFound("Project not found");
    return ok({ deleted: true });
  } catch (err) {
    return serverError(err, "Failed to delete project");
  }
}
