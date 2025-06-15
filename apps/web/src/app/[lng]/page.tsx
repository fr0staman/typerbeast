import type { Metadata } from "next";
import { getT } from "../../i18n/server";
import { languages } from "@/app/i18n/settings";
import { getServerUser } from "@/app/hooks/getServerUser";
import { SessionProvider } from "@/app/providers/session";
import { redirect } from "next/navigation";
import { RoomsScreen } from "@/app/features/RoomsScreen";

type Props = {
  params: Promise<{
    lng: string;
  }>;
};

export async function generateStaticParams() {
  return languages.map(lng => ({ lng }));
}

export async function generateMetadata({}: Props): Promise<Metadata> {
  const { t } = await getT("seo");

  return {
    title: t("home.title"),
    description: t("home.description"),
    icons: "/favicon.ico",
  };
}

export default async function Home() {
  const data = await getServerUser();

  if (!data) {
    redirect("/login");
  }

  return (
    <SessionProvider>
      <RoomsScreen />
    </SessionProvider>
  );
}
