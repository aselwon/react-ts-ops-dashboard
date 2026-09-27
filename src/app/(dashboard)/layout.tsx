import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Shell } from "@/components/shell";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");
  return <Shell user={user}>{children}</Shell>;
}
