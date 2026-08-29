import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectToDatabase } from "@/lib/db";
import { TeamMember } from "@/models/TeamMember";
import { teamMemberSchema } from "@/lib/validation";
import { created, ok, handleZodError, serverError } from "@/lib/api-response";

export async function GET() {
  try {
    await connectToDatabase();
    const members = await TeamMember.find().sort({ order: 1, createdAt: 1 }).lean();
    return ok(members);
  } catch (err) {
    return serverError(err, "Failed to load team members");
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const data = teamMemberSchema.parse(body);
    const member = await TeamMember.create(data);
    return created(member);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return serverError(err, "Failed to create team member");
  }
}
