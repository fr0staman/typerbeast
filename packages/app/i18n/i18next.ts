import { Language } from "app/i18n/settings";
import i18n, { TFunction } from "i18next";
import { initReactI18next } from "react-i18next";

import { resources } from "./resources";
import { defaultNS } from "@/app/i18n/settings";

export type AppTFunction = TFunction<"translation">;

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v4",
    defaultNS,
    resources,
    lng: Language.English,
    fallbackLng: Language.English,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })
  .catch(() => undefined);

export default i18n;
