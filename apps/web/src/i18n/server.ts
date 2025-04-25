import type { UseTranslationOptions } from "react-i18next";
import i18next from "@/app/i18n/i18next";
import { fallbackLng, headerName } from "@/app/i18n/settings";
import { headers } from "next/headers";

export async function getT(
  ns?: string[] | string,
  options?: UseTranslationOptions<undefined>,
) {
  const headerList = await headers();
  const lng = headerList.get(headerName);

  if (lng && i18next.resolvedLanguage !== lng) {
    await i18next.changeLanguage(lng);
  }
  if (ns && !i18next.hasLoadedNamespace(ns)) {
    await i18next.loadNamespaces(ns);
  }

  return {
    t: i18next.getFixedT(
      lng ?? (i18next.resolvedLanguage || fallbackLng),
      Array.isArray(ns) ? ns[0] : ns,
      options?.keyPrefix,
    ),
    i18n: i18next,
  };
}
