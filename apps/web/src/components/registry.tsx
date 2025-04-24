"use client";

import React, { useRef, useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { StyleRegistry, createStyleRegistry } from "styled-jsx";
import { StyleSheet } from "react-native";
import { flush } from "@gluestack-ui/nativewind-utils/flush";

export default function StyledJsxRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only create stylesheet once with lazy initial state
  // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [jsxStyleRegistry] = useState(() => createStyleRegistry());
  const isServerInserted = useRef(false);

  useServerInsertedHTML(() => {
    // @ts-expect-error Not typed in RN. But in reality this function exist.
    const rnwStyle = StyleSheet.getSheet();
    if (!isServerInserted.current) {
      isServerInserted.current = true;
      const styles = [jsxStyleRegistry.styles(), flush()];
      jsxStyleRegistry.flush();
      return (
        <>
          {styles}
          <style id={rnwStyle.id}>{rnwStyle.textContent}</style>
        </>
      );
    }
  });

  return <StyleRegistry registry={jsxStyleRegistry}>{children}</StyleRegistry>;
}
