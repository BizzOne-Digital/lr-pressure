import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { Media } from "@/models/Media";
import { leadFormSchema } from "@/lib/validation";
import { uploadBufferToGridFS, validateUpload } from "@/lib/gridfs";
import { created, fail, handleZodError, serverError } from "@/lib/api-response";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (isRateLimited(`lead:${ip}`, { maxRequests: 5, windowMs: 10 * 60 * 1000 })) {
      return fail(
        "You're submitting requests too quickly. Please wait a few minutes and try again.",
        429
      );
    }

    const formData = await request.formData();
    const raw = {
      name: formData.get("name")?.toString() ?? "",
      phone: formData.get("phone")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      address: formData.get("address")?.toString() ?? "",
      serviceNeeded: formData.get("serviceNeeded")?.toString() ?? "",
      preferredDate: formData.get("preferredDate")?.toString() ?? "",
      message: formData.get("message")?.toString() ?? "",
      company: formData.get("company")?.toString() ?? "",
    };

    const data = leadFormSchema.omit({ imageMediaId: true }).parse(raw);

    // Honeypot: a real visitor never sees or fills this field. Pretend
    // success so bots don't learn their submission was rejected.
    if (data.company && data.company.trim().length > 0) {
      return created({ ok: true });
    }

    await connectToDatabase();

    let imageMediaId: string | undefined;
    const file = formData.get("image");
    if (file instanceof File && file.size > 0) {
      const validationError = validateUpload(file.type, file.size);
      if (validationError) {
        return fail(validationError, 422);
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const gridfsId = await uploadBufferToGridFS(buffer, file.name, file.type);
      const media = await Media.create({
        gridfsId,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        alt: `Lead attachment from ${data.name}`,
      });
      imageMediaId = media._id.toString();
    }

    const lead = await Lead.create({
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      serviceNeeded: data.serviceNeeded,
      preferredDate: data.preferredDate,
      message: data.message,
      imageMediaId,
      status: "New",
    });

    return created({ id: lead._id });
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return serverError(err, "Failed to submit your request. Please try again.");
  }
}
