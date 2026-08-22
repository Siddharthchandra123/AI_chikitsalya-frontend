"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "@/lib/language-context";
import { ThemeProvider } from "@/lib/theme-context";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        {children}
        <Toaster position="top-right" closeButton richColors />
      </LanguageProvider>
    </ThemeProvider>
  );
}

