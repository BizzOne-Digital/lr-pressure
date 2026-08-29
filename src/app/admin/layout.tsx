import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | LR Pressure Washing",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-brand-gray-50">{children}</div>;
}
