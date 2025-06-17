import { ModerationPanel } from "@/app/features/ModerationPanel";
import { getServerUser } from "@/app/hooks/getServerUser";
import { SessionProvider } from "@/app/providers/session";
import { getT } from "@/apps/web/src/i18n/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    lng: string;
  }>;
};

export async function generateMetadata({}: Props): Promise<Metadata> {
  const { t } = await getT("seo");

  return {
    title: t("user.title"),
    description: t("user.description"),
    icons: "/favicon.ico",
  };
}

export default async function Moderation() {
  const data = await getServerUser();

  if (!data || (data.role !== "moderator" && data.role !== "creator")) {
    redirect("/");
  }

  return (
    <SessionProvider>
      <ModerationPanel />
    </SessionProvider>
  );
}
