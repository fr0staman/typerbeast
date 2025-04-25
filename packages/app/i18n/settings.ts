export enum Language {
  English = "en",
  Ukrainian = "uk",
}

export const fallbackLng = Language.English;
export const languages = [fallbackLng, Language.Ukrainian] as const;
export const defaultNS = "common";
export const cookieName = "i18next";
export const headerName = "x-i18next-current-language";

export const languageInfos = {
  [Language.English]: { name: "English", flag: "🇺🇸" },
  [Language.Ukrainian]: { name: "Українська", flag: "🇺🇦" },
};
