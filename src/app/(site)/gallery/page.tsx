import type { Metadata } from "next";
import { getGalleryItems, getPageContent } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { GalleryGrid } from "@/components/site/GalleryGrid";

export async function generateMetadata(): Promise<Metadata> {
  const { seo, content } = await getPageContent("gallery");
  return {
    title: seo.title || `Gallery | ${content.heading || "LR Pressure Washing"}`,
    description: seo.metaDescription || content.intro,
  };
}

export default async function GalleryPage() {
  const [{ content }, galleryItems] = await Promise.all([
    getPageContent("gallery"),
    getGalleryItems(),
  ]);

  // GalleryGrid is a Client Component (interactive category filtering), so it
  // needs plain, JSON-serializable props rather than raw lean() documents.
  const items = galleryItems.map((g) => ({
    _id: g._id.toString(),
    title: g.title,
    caption: g.caption,
    category: g.category,
    imageMediaId: g.imageMediaId?.toString(),
  }));

  return (
    <>
      <PageHero
        title={content.heading || "Our Work"}
        description={content.intro || "A look at recent projects across our service area."}
      />

      <section className="bg-white py-20 lg:py-28">
        <div className="container-lux">
          <GalleryGrid items={items} />
        </div>
      </section>
    </>
  );
}
