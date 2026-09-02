import {
  ShieldCheck,
  Clock,
  Tag,
  Sparkles,
  Home,
  Car,
  AppWindow,
  Droplets,
  Layers,
  Fence,
  ClipboardList,
  CalendarCheck,
  SprayCan,
  PartyPopper,
  CheckCircle2,
  Star,
  Phone,
  Mail,
  MapPin,
  Award,
  ThumbsUp,
  Wrench,
  Building2,
  Waves,
  Leaf,
  Sun,
  Gauge,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  Clock,
  Tag,
  Sparkles,
  Home,
  Car,
  AppWindow,
  Droplets,
  Layers,
  Fence,
  ClipboardList,
  CalendarCheck,
  SprayCan,
  PartyPopper,
  CheckCircle2,
  Star,
  Phone,
  Mail,
  MapPin,
  Award,
  ThumbsUp,
  Wrench,
  Building2,
  Waves,
  Leaf,
  Sun,
  Gauge,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Cmp = ICON_MAP[name] || Sparkles;
  return <Cmp className={className} aria-hidden="true" />;
}
