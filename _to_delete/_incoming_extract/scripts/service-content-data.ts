/**
 * Original per-service content for the individual service-page redesign:
 * a short "why choose us" checklist, a dedicated "Our {Service} Process"
 * set of numbered steps, and a dedicated service-specific FAQ set.
 *
 * All copy here is original to LR Pressure Washing — no fabricated
 * certifications, awards, years-in-business claims, customer counts, or
 * guarantees. Shared by both scripts/seed.ts (fresh installs) and
 * scripts/add-more-content.ts (idempotent backfill onto an already-seeded
 * database), so the copy only needs to be written once.
 */

export interface ServiceContentEntry {
  benefits: string[];
  processSteps: { title: string; description: string; icon: string }[];
  faqs: { question: string; answer: string }[];
}

export const SERVICE_CONTENT: Record<string, ServiceContentEntry> = {
  "house-washing": {
    benefits: [
      "Soft-wash method that's gentle on siding and paint",
      "Removes algae, mildew, and general grime buildup",
      "Careful protection of plants, furniture, and fixtures",
      "Noticeably brighter curb appeal when we're done",
    ],
    processSteps: [
      {
        title: "Property Walkthrough",
        description:
          "We check your siding material and note anything nearby — plants, furniture, fixtures — that needs protecting before we start.",
        icon: "ClipboardList",
      },
      {
        title: "Soft-Wash Application",
        description:
          "We apply a cleaning solution suited to your siding at low pressure, letting it break down dirt, algae, and mildew rather than blasting it with force.",
        icon: "SprayCan",
      },
      {
        title: "Rinse & Even Finish",
        description:
          "Once the solution has worked, we rinse everything down for an even, streak-free result across the whole exterior.",
        icon: "Droplets",
      },
      {
        title: "Final Walkthrough",
        description:
          "We walk the property with you so you can see the difference and flag anything you'd like a second look at.",
        icon: "CheckCircle2",
      },
    ],
    faqs: [
      {
        question: "Will soft washing damage my siding or paint?",
        answer:
          "No — soft washing is specifically designed to be gentle on siding and paint. We use lower water pressure paired with an appropriate cleaning solution instead of blasting the surface with high pressure, which is what can force water behind siding or damage paint and caulking.",
      },
      {
        question: "How often should I have my house washed?",
        answer:
          "It depends on your siding material, local climate, and how much shade or moisture your property gets — many homeowners schedule a wash once or twice a year. We're happy to recommend a schedule once we see your property.",
      },
      {
        question: "Will you protect my plants, furniture, and outdoor fixtures?",
        answer:
          "Yes — before we start, we walk the property and take care to protect anything nearby that needs it, including plants, outdoor furniture, and light fixtures.",
      },
      {
        question: "What's the difference between house washing and pressure washing?",
        answer:
          "House washing uses a soft-wash technique — lower pressure with a cleaning solution — suited to delicate surfaces like siding. Pressure washing uses higher water pressure alone and is better suited to tougher surfaces like concrete and driveways.",
      },
      {
        question: "Do you offer a free quote before starting work?",
        answer:
          "Yes — contact us through our quote form or by phone, and we'll go over your property and provide a free, no-obligation quote before any work begins.",
      },
    ],
  },

  "driveway-cleaning": {
    benefits: [
      "Lifts oil stains, tire marks, and years of buildup",
      "Even, streak-free results with a surface cleaner",
      "Pressure and technique matched to your driveway's material",
      "Extra attention given to stubborn, heavily stained spots",
    ],
    processSteps: [
      {
        title: "Assess The Surface",
        description:
          "We look at your driveway's material and condition to choose the right pressure level and technique for the job.",
        icon: "ClipboardList",
      },
      {
        title: "Surface Cleaner Pass",
        description:
          "We work section by section with a surface cleaner for even coverage, avoiding the blotchy patches an uneven manual pass can leave behind.",
        icon: "Gauge",
      },
      {
        title: "Targeted Stain Treatment",
        description:
          "Oil stains and tire marks get extra, focused attention before a final rinse.",
        icon: "SprayCan",
      },
      {
        title: "Final Rinse & Review",
        description: "We rinse the full surface clean and check the results with you before we go.",
        icon: "CheckCircle2",
      },
    ],
    faqs: [
      {
        question: "Can pressure washing remove oil stains from my driveway?",
        answer:
          "Pressure washing can significantly lift and lighten oil stains, though very old or deeply set stains may not come out completely. We give stained areas extra, targeted attention to get the best possible result.",
      },
      {
        question: "Will pressure washing damage my concrete or asphalt?",
        answer:
          "We choose a pressure level and technique appropriate to your driveway's specific material and condition, so it's cleaned effectively without unnecessary wear.",
      },
      {
        question: "How long does a driveway cleaning take?",
        answer:
          "It depends on the size and condition of your driveway. We're happy to give you a time estimate when we provide your free quote.",
      },
      {
        question: "Why does my driveway look striped or blotchy after I tried cleaning it myself?",
        answer:
          "That's usually the result of an uneven manual pass. We use a surface cleaner that moves in even, consistent passes across the whole area, avoiding that streaked look.",
      },
      {
        question: "Do you provide a quote before starting work?",
        answer:
          "Yes — contact us through our quote form or by phone, and we'll walk through your driveway and provide a free, no-obligation quote before any work begins.",
      },
    ],
  },

  "window-cleaning": {
    benefits: [
      "Streak-free finish on glass, frames, and sills",
      "Technique matched to your specific window type",
      "Careful protection of surrounding landscaping",
      "One of the fastest, most noticeable curb-appeal upgrades",
    ],
    processSteps: [
      {
        title: "Quick Walk-Around",
        description: "We take a look at your windows and property layout to plan the cleaning.",
        icon: "ClipboardList",
      },
      {
        title: "Protect The Surroundings",
        description: "Anything nearby that needs protecting is covered before we start cleaning.",
        icon: "ShieldCheck",
      },
      {
        title: "Clean Glass, Frames & Sills",
        description:
          "We clean each window methodically — glass, frames, and sills — using tools suited to your window type.",
        icon: "Droplets",
      },
      {
        title: "Final Check",
        description: "We do a final pass to make sure every window is streak-free and nothing was missed.",
        icon: "CheckCircle2",
      },
    ],
    faqs: [
      {
        question: "Do you clean window frames and sills, or just the glass?",
        answer:
          "Both — we clean the glass, frames, and sills on the outside of your windows for a complete, finished result rather than just the panes.",
      },
      {
        question: "How do you avoid streaks on the glass?",
        answer:
          "We use tools and techniques suited to your specific window type, and finish with a final check of each window before moving on to make sure nothing was missed.",
      },
      {
        question: "Can you clean hard-to-reach or upper-story windows?",
        answer:
          "Reach out and describe your property's windows — we're happy to discuss what's possible before your appointment.",
      },
      {
        question: "How often should exterior windows be cleaned?",
        answer:
          "It depends on your property and local conditions, but many customers schedule exterior window cleaning once or twice a year, often alongside a house wash.",
      },
      {
        question: "Do you provide a quote before starting work?",
        answer:
          "Yes — contact us through our quote form or by phone, and we'll provide a free, no-obligation quote before any work begins.",
      },
    ],
  },

  "roof-cleaning": {
    benefits: [
      "Low-pressure, roof-safe washing method",
      "Targets algae, moss, and organic staining at the source",
      "Helps protect roofing material and shingle lifespan",
      "Careful rinse that avoids forcing water under shingles",
    ],
    processSteps: [
      {
        title: "Check Roof Type & Condition",
        description:
          "We check your roofing material and condition first, since the right approach depends on what we're working with.",
        icon: "ClipboardList",
      },
      {
        title: "Apply Cleaning Solution",
        description:
          "We apply a roof-safe cleaning solution and let it break down algae, moss, and staining rather than relying on pressure.",
        icon: "SprayCan",
      },
      {
        title: "Careful Low-Pressure Rinse",
        description:
          "We rinse carefully at low pressure — high pressure can lift or damage shingles, so we avoid it entirely on your roof.",
        icon: "Droplets",
      },
      {
        title: "Results Review",
        description: "We check the finished roof with you so you can see the difference in staining and streaking.",
        icon: "CheckCircle2",
      },
    ],
    faqs: [
      {
        question: "Is it safe to pressure wash a roof?",
        answer:
          "High pressure isn't safe for most roofing materials — it can lift or damage shingles. That's why we use a low-pressure, roof-safe washing method paired with an appropriate cleaning solution instead.",
      },
      {
        question: "What causes those dark streaks on my roof?",
        answer:
          "Dark streaks and staining are usually algae, moss, or organic buildup rather than plain dirt, and they tend to get worse over time if left untreated.",
      },
      {
        question: "Will roof cleaning shorten my roof's lifespan?",
        answer:
          "Our low-pressure approach is chosen specifically to avoid the shingle damage that high-pressure washing can cause. Removing algae and moss buildup can actually help protect the roofing material.",
      },
      {
        question: "How often should a roof be cleaned?",
        answer:
          "It depends on your roof type, surrounding tree cover, and local climate. We're happy to recommend a schedule once we've seen your property.",
      },
      {
        question: "Do you provide a quote before starting work?",
        answer:
          "Yes — contact us through our quote form or by phone, and we'll provide a free, no-obligation quote before any work begins.",
      },
    ],
  },

  "exterior-surface-cleaning": {
    benefits: [
      "Flexible cleaning for surfaces that don't fit a single category",
      "Method and pressure matched to each surface's material",
      "Covers siding, fencing, furniture, and more",
      "We're happy to advise on the right approach if you're unsure",
    ],
    processSteps: [
      {
        title: "Describe The Surface",
        description:
          "Tell us what needs cleaning — siding, fencing, outdoor furniture, or another exterior surface — so we can plan the right approach.",
        icon: "ClipboardList",
      },
      {
        title: "Assess Material & Condition",
        description:
          "We assess the specific material and condition so delicate surfaces aren't over-pressured and tougher ones get the attention they need.",
        icon: "ShieldCheck",
      },
      {
        title: "Clean & Rinse",
        description: "We clean and rinse the surface using the method chosen for its material.",
        icon: "SprayCan",
      },
      {
        title: "Final Review",
        description: "We check the results with you before wrapping up.",
        icon: "CheckCircle2",
      },
    ],
    faqs: [
      {
        question: "What surfaces does exterior surface cleaning cover?",
        answer:
          "This service is a flexible option for surfaces around your property — siding, fencing, outdoor furniture, dumpster pads, and similar areas — that don't fall neatly under one of our other named services.",
      },
      {
        question: "I'm not sure which service fits what I need cleaned — what should I do?",
        answer:
          "Contact us and describe the surface you'd like cleaned. We're happy to advise on the right service and approach for your specific situation.",
      },
      {
        question: "How do you decide what pressure level to use?",
        answer:
          "We assess the specific material and condition of each surface first, so delicate materials aren't over-pressured and tougher materials get the cleaning they actually need.",
      },
      {
        question: "Can this service be combined with other services, like house washing?",
        answer:
          "Yes — many customers combine exterior surface cleaning with other services in a single visit. Let us know what you'd like covered when you request your quote.",
      },
      {
        question: "Do you provide a quote before starting work?",
        answer:
          "Yes — contact us through our quote form or by phone, and we'll provide a free, no-obligation quote before any work begins.",
      },
    ],
  },

  "concrete-cleaning": {
    benefits: [
      "Lifts buildup that regular rinsing can't reach",
      "Even, streak-free coverage with a surface cleaner",
      "Restores a uniform look across patios and sidewalks",
      "Cleaner concrete stays easier to keep that way",
    ],
    processSteps: [
      {
        title: "Inspect The Surface",
        description: "We check the concrete's condition and note any heavily stained or soiled spots.",
        icon: "ClipboardList",
      },
      {
        title: "Surface Cleaner Pass",
        description:
          "We clean methodically with a surface cleaner for even coverage, avoiding the striped look an uneven manual pass leaves behind.",
        icon: "Gauge",
      },
      {
        title: "Targeted Stain Treatment",
        description: "Stained or heavily soiled spots get extra attention before the final rinse.",
        icon: "SprayCan",
      },
      {
        title: "Final Rinse & Review",
        description: "We rinse the full surface and review the finished result with you.",
        icon: "CheckCircle2",
      },
    ],
    faqs: [
      {
        question: "Why does concrete get so dirty compared to other surfaces?",
        answer:
          "Concrete is porous, so dirt, mold, algae, and stains work their way into the surface over time rather than sitting on top of it — which is why plain rinsing doesn't remove it.",
      },
      {
        question: "What concrete surfaces can you clean?",
        answer:
          "Sidewalks, patios, and other concrete areas around your property. If you have a specific surface in mind, let us know when you request your quote.",
      },
      {
        question: "Will pressure washing damage my concrete?",
        answer:
          "We use professional-grade equipment and choose a pressure level suited to your concrete's condition, so it's cleaned effectively without unnecessary wear.",
      },
      {
        question: "How do you avoid a blotchy or uneven look?",
        answer:
          "We clean with a surface cleaner that moves in even, consistent passes, which avoids the striped or blotchy result an uneven manual pass can leave.",
      },
      {
        question: "Do you provide a quote before starting work?",
        answer:
          "Yes — contact us through our quote form or by phone, and we'll provide a free, no-obligation quote before any work begins.",
      },
    ],
  },

  "patio-walkway-cleaning": {
    benefits: [
      "Method matched to your paving material — concrete, pavers, brick, or stone",
      "Extra attention to joints and edges where moss collects",
      "Reduces the slip hazard that algae buildup can create",
      "Makes outdoor living spaces more inviting year-round",
    ],
    processSteps: [
      {
        title: "Identify The Material",
        description:
          "We check whether your patio or walkway is concrete, pavers, brick, or stone, since each calls for a slightly different approach.",
        icon: "ClipboardList",
      },
      {
        title: "Clean The Full Surface",
        description: "We clean the open surface area thoroughly with the right pressure for the material.",
        icon: "SprayCan",
      },
      {
        title: "Detail Joints & Edges",
        description:
          "We pay extra attention to the joints and edges where dirt and moss tend to collect, not just the open area.",
        icon: "Fence",
      },
      {
        title: "Final Rinse & Review",
        description: "We rinse everything down and review the finished result with you.",
        icon: "CheckCircle2",
      },
    ],
    faqs: [
      {
        question: "Do you clean pavers, brick, and stone, or just concrete?",
        answer:
          "All of them — we match our pressure and method to your specific paving material, whether that's concrete, pavers, brick, or stone.",
      },
      {
        question: "Why is buildup in the joints a problem?",
        answer:
          "Dirt and moss that collect in the joints and edges aren't just a cosmetic issue — that buildup can create a slip hazard over time, so we give those areas extra attention rather than just the open surface.",
      },
      {
        question: "How often should patios and walkways be cleaned?",
        answer:
          "These areas see constant foot traffic and weather exposure, so buildup tends to return faster than on less-used surfaces. We're happy to recommend a schedule for your property.",
      },
      {
        question: "Can this help with a slippery patio or walkway?",
        answer:
          "Yes — removing algae and moss buildup, especially in joints and edges, helps reduce the slip hazard that buildup can create.",
      },
      {
        question: "Do you provide a quote before starting work?",
        answer:
          "Yes — contact us through our quote form or by phone, and we'll provide a free, no-obligation quote before any work begins.",
      },
    ],
  },

  "interior-window-cleaning": {
    benefits: [
      "Matching, streak-free finish on the inside of your glass",
      "Careful protection of furniture, floors, and window treatments",
      "Pairs naturally with our exterior window cleaning",
      "Brings in more natural light throughout your home",
    ],
    processSteps: [
      {
        title: "Protect Interior Surfaces",
        description: "We take care to protect furniture, floors, and window treatments before we start.",
        icon: "ShieldCheck",
      },
      {
        title: "Clean Glass, Frames & Sills",
        description: "We clean the glass, frames, and sills throughout your home's interior methodically.",
        icon: "Droplets",
      },
      {
        title: "Final Check",
        description: "We check each window before moving on, so nothing gets missed.",
        icon: "CheckCircle2",
      },
    ],
    faqs: [
      {
        question: "Do you clean the inside of windows, or only the outside?",
        answer:
          "Interior window cleaning covers the inside — glass, frames, and sills — so you get a matching, streak-free finish on both sides once paired with exterior cleaning.",
      },
      {
        question: "Will you protect my furniture and floors while working?",
        answer:
          "Yes — we take care to protect furniture, floors, and window treatments while we work.",
      },
      {
        question: "Should I book this with exterior window cleaning too?",
        answer:
          "Many customers do, since pairing interior and exterior cleaning gives you the clearest possible view and the most natural light. It's entirely up to you.",
      },
      {
        question: "How long does interior window cleaning take?",
        answer:
          "It depends on how many windows your home has. We can give you a time estimate along with your free quote.",
      },
      {
        question: "Do you provide a quote before starting work?",
        answer:
          "Yes — contact us through our quote form or by phone, and we'll provide a free, no-obligation quote before any work begins.",
      },
    ],
  },

  "screen-cleaning": {
    benefits: [
      "Removes dust, pollen, and grime standard cleaning misses",
      "Screens are removed, cleaned, and carefully reinstalled",
      "Handled to avoid stretching or tearing the mesh",
      "Lets more light and air through your windows",
    ],
    processSteps: [
      {
        title: "Inspect Each Screen",
        description: "We inspect screens before cleaning and note any existing damage.",
        icon: "ClipboardList",
      },
      {
        title: "Remove & Clean",
        description: "Each screen is removed and cleaned thoroughly, handled carefully to avoid stretching or tearing the mesh.",
        icon: "Droplets",
      },
      {
        title: "Reinstall & Final Check",
        description: "We reinstall each screen and do a final check once it's back in place.",
        icon: "CheckCircle2",
      },
    ],
    faqs: [
      {
        question: "Why do my screens look dull even though my windows are clean?",
        answer:
          "Window screens collect dust, pollen, and grime that regular window cleaning doesn't reach, so that buildup can dull the view even when the glass itself is spotless.",
      },
      {
        question: "Will cleaning damage or stretch the screen mesh?",
        answer:
          "We handle each screen carefully during removal and cleaning specifically to avoid stretching or tearing the mesh.",
      },
      {
        question: "Do you check screens for existing damage?",
        answer:
          "Yes — we inspect each screen before cleaning and note any damage that's already there.",
      },
      {
        question: "Should I book screen cleaning with window cleaning?",
        answer:
          "Many customers do, since clean screens go a long way toward making freshly washed windows look their best. It's up to you which combination works for your property.",
      },
      {
        question: "Do you provide a quote before starting work?",
        answer:
          "Yes — contact us through our quote form or by phone, and we'll provide a free, no-obligation quote before any work begins.",
      },
    ],
  },

  "christmas-light-installation": {
    benefits: [
      "No ladder work or climbing around your own roofline",
      "Lighting secured to hold up through winter weather",
      "Full takedown and storage after the season",
      "We talk through your plan before installing anything",
    ],
    processSteps: [
      {
        title: "Discuss Your Plan",
        description: "We talk through what you have in mind for your property and lighting layout.",
        icon: "ClipboardList",
      },
      {
        title: "Secure Installation",
        description:
          "We install the lighting securely to your roofline, gutters, or trees so it holds up through winter weather.",
        icon: "PartyPopper",
      },
      {
        title: "Season Takedown",
        description: "After the season, we return to take everything down and put it away.",
        icon: "CheckCircle2",
      },
    ],
    faqs: [
      {
        question: "Do I need to provide my own lights?",
        answer:
          "Contact us to discuss your property and lighting plan — we'll go over what's needed and what you'd like installed when we talk through the details.",
      },
      {
        question: "Will you take the lights down after the holidays?",
        answer:
          "Yes — we handle the full installation and takedown, so you can enjoy the season without climbing around your own roofline at either end of it.",
      },
      {
        question: "Can the lighting handle winter weather?",
        answer:
          "We install the lighting securely to your roofline, gutters, or trees so it holds up through winter weather for the season.",
      },
      {
        question: "How far in advance should I book holiday lighting?",
        answer:
          "The earlier the better, since holiday scheduling fills up quickly. Reach out as soon as you're ready to plan your installation.",
      },
      {
        question: "Do you provide a quote before starting work?",
        answer:
          "Yes — contact us and describe your property and lighting plan, and we'll provide a free, no-obligation quote before any work begins.",
      },
    ],
  },

  "pressure-washing": {
    benefits: [
      "Covers pool decks, fences, pavers, and other hardscapes",
      "Pressure and equipment matched to each material",
      "Extra attention to stained or heavily soiled areas",
      "A flexible option for surfaces that don't fit elsewhere",
    ],
    processSteps: [
      {
        title: "Assess The Surface",
        description:
          "We assess the surface first, since different materials call for different pressure levels — using too much can damage softer materials like wood fencing or aging pavers.",
        icon: "ClipboardList",
      },
      {
        title: "Methodical Cleaning Pass",
        description: "We clean methodically for even, thorough coverage across the full surface.",
        icon: "Gauge",
      },
      {
        title: "Final Rinse & Review",
        description: "Stained or heavily soiled areas get extra attention, then we review the results with you.",
        icon: "CheckCircle2",
      },
    ],
    faqs: [
      {
        question: "What surfaces does general pressure washing cover?",
        answer:
          "Pool decks, retaining walls, fences, brick and stone surfaces, curbs, and paver patios — the broader hardscape and surface cleaning needs beyond driveways, siding, and roofs.",
      },
      {
        question: "Can pressure washing damage wood fencing or pavers?",
        answer:
          "Using the wrong amount of pressure can damage softer materials like wood fencing or aging pavers, which is why we assess the surface first and match our pressure and technique to it.",
      },
      {
        question: "My surface doesn't fit any of your other named services — can you still help?",
        answer:
          "Yes — get in touch and describe what needs cleaning. Pressure washing is a flexible option for exactly that kind of job.",
      },
      {
        question: "How do you handle heavily stained areas?",
        answer:
          "We clean methodically for even coverage and give stained or heavily soiled spots extra, targeted attention.",
      },
      {
        question: "Do you provide a quote before starting work?",
        answer:
          "Yes — contact us through our quote form or by phone, and we'll provide a free, no-obligation quote before any work begins.",
      },
    ],
  },
};
