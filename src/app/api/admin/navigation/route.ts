import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Navigation } from "@/models/Navigation";
import { navigationSchema } from "@/lib/validation";
import { ok, handleZodError, serverError } from "@/lib/api-response";

async function getOrCreateNavigation() {
  let nav = await Navigation.findOne();
  if (!nav) {
    nav = await Navigation.create({
      items: [
        { label: "Home", href: "/", order: 0, visible: true },
        { label: "About", href: "/about", order: 1, visible: true },
        { label: "Services", href: "/services", order: 2, visible: true },
        { label: "Our Team", href: "/team", order: 3, visible: true },
        { label: "Contact", href: "/contact", order: 4, visible: true },
      ],
    });
  }
  return nav;
}

export async function GET() {
  try {
    await connectToDatabase();
    const nav = await getOrCreateNavigation();
    return ok(nav);
  } catch (err) {
    return serverError(err, "Failed to load navigation");
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const data = navigationSchema.parse(body);

    const nav = await getOrCreateNavigation();
    nav.items = data.items;
    await nav.save();

    return ok(nav);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return serverError(err, "Failed to update navigation");
  }
}
