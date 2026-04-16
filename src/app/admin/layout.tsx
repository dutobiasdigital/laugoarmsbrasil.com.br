import AdminShell from "./_components/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
