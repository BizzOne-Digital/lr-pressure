import { connectToDatabase } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { Service } from "@/models/Service";
import { GalleryItem } from "@/models/GalleryItem";
import { Testimonial } from "@/models/Testimonial";
import { ok, serverError } from "@/lib/api-response";

export async function GET() {
  try {
    await connectToDatabase();

    const [
      totalLeads,
      newLeads,
      contactedLeads,
      scheduledJobs,
      completedJobs,
      totalServices,
      galleryImages,
      testimonials,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: "New" }),
      Lead.countDocuments({ status: "Contacted" }),
      Lead.countDocuments({ status: "Scheduled" }),
      Lead.countDocuments({ status: "Completed" }),
      Service.countDocuments(),
      GalleryItem.countDocuments(),
      Testimonial.countDocuments(),
    ]);

    const recentLeads = await Lead.find().sort({ createdAt: -1 }).limit(5).lean();

    return ok({
      totalLeads,
      newLeads,
      contactedLeads,
      scheduledJobs,
      completedJobs,
      totalServices,
      galleryImages,
      testimonials,
      recentLeads,
    });
  } catch (err) {
    return serverError(err, "Failed to load dashboard stats");
  }
}
