import { LoginScreen } from "@/app/features/LoginScreen";
import { getT } from "../../../i18n/server";
import { Metadata } from "next";
import { getServerUser } from "@/app/hooks/getServerUser";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    lng: string;
  }>;
};

export async function generateMetadata({}: Props): Promise<Metadata> {
  const { t } = await getT("seo");

  return {
    title: t("login.title"),
    description: t("login.description"),
    icons: "/favicon.ico",
  };
}

export default async function Login() {
  const data = await getServerUser();

  if (data) {
    redirect("/");
  }

  return <LoginScreen />;
}
