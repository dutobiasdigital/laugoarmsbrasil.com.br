import { redirect } from "next/navigation";

export default function DesignSystemPage() {
  redirect("/admin/configuracoes?aba=empresa");
}
