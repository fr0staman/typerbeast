import { usePreferredLanguage } from "./i18n/hooks";

export const Bootstrap = ({ children }: { children: React.ReactNode }) => {
  usePreferredLanguage();

  return <>{children}</>;
};
