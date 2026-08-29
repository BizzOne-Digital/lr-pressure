import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Lead, LEAD_STATUSES } from "@/models/Lead";
import { ok, serverError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status");
    const sort = searchParams.get("sort") === "oldest" ? 1 : -1;
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const pageSize = Math.min(Number(searchParams.get("pageSize") ?? 20), 100);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (status && (LEAD_STATUSES as readonly string[]).includes(status)) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Lead.find(query)
        .sort({ createdAt: sort })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Lead.countDocuments(query),
    ]);

    return ok({ items, total, page, pageSize });
  } catch (err) {
    return serverError(err, "Failed to load leads");
  }
}
