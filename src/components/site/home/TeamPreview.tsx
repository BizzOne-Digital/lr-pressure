import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { mediaUrl } from "@/lib/media-url";
import type { ITeamMember } from "@/models/TeamMember";

export function TeamPreview({ members }: { members: ITeamMember[] }) {
  if (!members.length) return null;

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="container-lux">
        <SectionHeading eyebrow="Meet The Team" title="The People Behind Every Job" />
        <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {members.slice(0, 5).map((member, i) => {
            const photo = mediaUrl(member.photoMediaId?.toString());
            return (
              <Reveal key={member._id.toString()} delay={i * 0.07}>
                <div className="text-center">
                  <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full bg-brand-cream shadow-md shadow-black/5 sm:h-32 sm:w-32">
                    {photo ? (
                      <Image
                        src={photo}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-brand-black text-xl font-bold text-white">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                    )}
                  </div>
                  <p className="mt-3 font-heading text-sm font-bold text-brand-black">
                    {member.name}
                  </p>
                  <p className="text-xs font-semibold text-brand-red">{member.role}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/team"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-red hover:underline"
          >
            Meet the Full Team <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
