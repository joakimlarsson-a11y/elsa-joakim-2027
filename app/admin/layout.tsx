import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Elsa & Joakim",
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen bg-[#fbfaff]">{children}</div>;
}
