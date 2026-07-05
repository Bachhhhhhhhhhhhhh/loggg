"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { CommandPalette } from "./CommandPalette";

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <CommandPaletteContext.Provider
      value={{
        open,
        setOpen,
        toggle: () => setOpen((o) => !o),
      }}
    >
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPaletteContext() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) throw new Error("useCommandPaletteContext must be used within CommandPaletteProvider");
  return ctx;
}