/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import i18next from "./i18next";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation, UseTranslationOptions } from "react-i18next";

const runsOnServerSide = typeof window === "undefined";

export function useAppTranslation(
  ns?: string | string[],
  options?: UseTranslationOptions<undefined>,
) {
  const lng = useParams()?.lng;

  if (typeof lng !== "string")
    throw new Error("useT is only available inside /app/[lng]");
  if (runsOnServerSide && i18next.resolvedLanguage !== lng) {
    i18next.changeLanguage(lng);
  } else {
    const [activeLng, setActiveLng] = useState(i18next.resolvedLanguage);
    useEffect(() => {
      if (activeLng === i18next.resolvedLanguage) return;
      setActiveLng(i18next.resolvedLanguage);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeLng, i18next.resolvedLanguage]);
    useEffect(() => {
      if (!lng || i18next.resolvedLanguage === lng) return;
      i18next.changeLanguage(lng);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lng, i18next]);
  }
  return useTranslation(ns, options);
}
