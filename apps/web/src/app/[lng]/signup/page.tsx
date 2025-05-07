import { SignupScreen } from "@/app/features/SignupScreen";
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
    title: t("signup.title"),
    description: t("signup.description"),
    icons: "/favicon.ico",
  };
}

export default async function Signup() {
  const data = await getServerUser();

  if (data) {
    redirect("/");
  }

  return <SignupScreen />;
}
