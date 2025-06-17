import { UserChange } from "@/app/features/UserChange";
import { getServerUser } from "@/app/hooks/getServerUser";
import { SessionProvider } from "@/app/providers/session";
import { getT } from "@/apps/web/src/i18n/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    lng: string;
    username: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const { t } = await getT("seo");

  return {
    title: t("user.title", { id: username }),
    description: t("user.description"),
    icons: "/favicon.ico",
  };
}

export default async function UserChangeRoute() {
  const data = await getServerUser();

  if (!data || data.role !== "creator") {
    redirect("/");
  }

  return (
    <SessionProvider>
      <UserChange />
    </SessionProvider>
  );
}
