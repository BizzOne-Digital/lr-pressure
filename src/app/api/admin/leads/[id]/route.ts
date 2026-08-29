import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { leadUpdateSchema } from "@/lib/validation";
import { ok, notFound, handleZodError, serverError } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const lead = await Lead.findById(id).lean();
    if (!lead) return notFound("Lead not found");
    return ok(lead);
  } catch (err) {
    return serverError(err, "Failed to load lead");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const data = leadUpdateSchema.parse(body);

    const lead = await Lead.findById(id);
    if (!lead) return notFound("Lead not found");

    if (data.status) lead.status = data.status;
    if (data.note) lead.notes.push({ text: data.note, createdAt: new Date() });

    await lead.save();
    return ok(lead);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return serverError(err, "Failed to update lead");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) return notFound("Lead not found");
    return ok({ deleted: true });
  } catch (err) {
    return serverError(err, "Failed to delete lead");
  }
}
