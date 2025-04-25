import { HomeScreen } from "@/app/features/Home";
import type { Metadata } from "next";
import { getT } from "../../i18n/server";
import { languages } from "../../../../../packages/app/i18n/settings";

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

export default function Home() {
  return <HomeScreen />;
}
