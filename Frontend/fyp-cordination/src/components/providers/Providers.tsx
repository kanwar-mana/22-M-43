"use client";

import { ReactNode, useEffect } from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { store } from "@/store";
import AutoLogout from "@/components/app/AutoLogout";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Provider store={store}>
        <AutoLogout />
        {children}
      </Provider>
    </ThemeProvider>
  );
}
