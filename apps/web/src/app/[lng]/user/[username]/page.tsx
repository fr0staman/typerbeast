import { UserScreen } from "@/app/features/User";
import { SessionProvider } from "@/app/providers/session";
import { getT } from "@/apps/web/src/i18n/server";
import { Metadata } from "next";

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

export default function User() {
  return (
    <SessionProvider>
      <UserScreen />
    </SessionProvider>
  );
}
