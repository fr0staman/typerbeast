import { languages } from "@/app/i18n/settings";
import { useEffect } from "react";
import { findBestLanguageTag } from "react-native-localize";

// i18n from useAppTranslation on change causes re-rendering
// But, I just check if startup user language matches the "preconfigured"
// So, just import system i18n with full understanding of the nuances.
import i18n from "@/app/i18n/i18next";
import { fallbackLng } from "@/app/i18n/settings";

export const usePreferredLanguage = () => {
  const lang = i18n.language;
  useEffect(() => {
    let langToChange = lang;
    const systemMatchedLanguage =
      findBestLanguageTag(languages)?.languageTag || fallbackLng;

    if (lang !== systemMatchedLanguage) {
      langToChange = systemMatchedLanguage;
    }

    // From preconfigured to user language
    if (i18n.language !== langToChange) {
      i18n.changeLanguage(langToChange);
    }

    // EXPLAIN: I need to listen lang only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
