import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectToDatabase } from "@/lib/db";
import { TeamMember } from "@/models/TeamMember";
import { teamMemberSchema } from "@/lib/validation";
import { ok, notFound, handleZodError, serverError, onlySubmittedKeys } from "@/lib/api-response";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const parsed = teamMemberSchema.partial().parse(body);
    const data = onlySubmittedKeys(parsed, body);
    const member = await TeamMember.findByIdAndUpdate(id, data, { new: true });
    if (!member) return notFound("Team member not found");
    return ok(member);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return serverError(err, "Failed to update team member");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const member = await TeamMember.findByIdAndDelete(id);
    if (!member) return notFound("Team member not found");
    return ok({ deleted: true });
  } catch (err) {
    return serverError(err, "Failed to delete team member");
  }
}
