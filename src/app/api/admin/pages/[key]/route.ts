import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Page, PAGE_KEYS, type PageKey } from "@/models/Page";
import { CONTENT_SCHEMA_BY_PAGE } from "@/lib/content-schemas";
import { seoSchema } from "@/lib/validation";
import { ok, fail, handleZodError, serverError } from "@/lib/api-response";

function isPageKey(key: string): key is PageKey {
  return (PAGE_KEYS as readonly string[]).includes(key);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    if (!isPageKey(key)) return fail("Unknown page", 404);

    await connectToDatabase();
    let page = await Page.findOne({ pageKey: key });
    if (!page) {
      const schema = CONTENT_SCHEMA_BY_PAGE[key];
      page = await Page.create({ pageKey: key, content: schema.parse({}) });
    }
    return ok(page);
  } catch (err) {
    return serverError(err, "Failed to load page content");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    if (!isPageKey(key)) return fail("Unknown page", 404);

    await connectToDatabase();
    const body = await request.json();

    const schema = CONTENT_SCHEMA_BY_PAGE[key];
    const content = schema.parse(body.content ?? {});
    const seo = seoSchema.parse(body.seo ?? {});
    const status = body.status === "draft" ? "draft" : "published";

    const page = await Page.findOneAndUpdate(
      { pageKey: key },
      { content, seo, status },
      { upsert: true, new: true }
    );

    return ok(page);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return serverError(err, "Failed to update page content");
  }
}
