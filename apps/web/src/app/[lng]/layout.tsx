/* eslint-disable react-native/no-inline-styles */
import "@/ui/css/globals.css";

import { notFound } from "next/navigation";

import StyledJsxRegistry from "../../components/registry";
import { GluestackUIProvider } from "@/ui/providers/gluestack";
import { getT } from "../../i18n/server";
import { Language, languages } from "@/app/i18n/settings";
import { QueryProvider } from "@/app/providers/query";
import { Header } from "@/app/features/Header";
import { Box } from "@/ui/components";

export function generateStaticParams() {
  return languages.map(lng => ({ lng }));
}

export async function generateMetadata() {
  const { t } = await getT("seo");

  return {
    title: t("home.title"),
    description: t("home.description"),
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}>) {
  const { lng } = await params;
  if (!languages.includes(lng as Language)) {
    notFound();
  }

  return (
    <html lang={lng} className="dark" style={{ colorScheme: "dark" }}>
      <body className={"antialiased dark:bg-black"}>
        <StyledJsxRegistry>
          <GluestackUIProvider mode="system">
            <QueryProvider>
              <Box className="flex max-w-full min-h-screen dark:bg-black">
                <Header />
                {children}
              </Box>
            </QueryProvider>
          </GluestackUIProvider>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
