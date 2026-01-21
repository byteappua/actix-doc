"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

const themes = [
  {
    name: "zinc",
    label: "Zinc",
    activeColor: "bg-zinc-900",
  },
  {
    name: "red",
    label: "Red",
    activeColor: "bg-red-500",
  },
  {
    name: "orange",
    label: "Orange",
    activeColor: "bg-orange-500",
  },
  {
    name: "green",
    label: "Green",
    activeColor: "bg-green-500",
  },
  {
    name: "blue",
    label: "Blue",
    activeColor: "bg-blue-500",
  },
  {
    name: "violet",
    label: "Violet",
    activeColor: "bg-violet-500",
  },
];

export function ThemeCustomizer() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  // Effectively we might need to store the "color" theme separately from "mode" (light/dark)
  // or use data-attributes. But next-themes handles class/data-attribute switching.
  // A common pattern is:
  // Light/Dark is handled by "theme" (class="dark" or light).
  // Color is handled by another class on the body, e.g. "theme-blue".
  // We can use a separate state for this.

  const [color, setColor] = React.useState("zinc");

  React.useEffect(() => {
    setMounted(true);
    // Load saved color from localstorage
    const savedColor = localStorage.getItem("theme-color") || "zinc";
    setColor(savedColor);
    document.body.classList.add(`theme-${savedColor}`);
  }, []);

  const handleColorChange = (newColor: string) => {
    // Remove old color class
    document.body.classList.remove(`theme-${color}`);
    // Add new color class
    document.body.classList.add(`theme-${newColor}`);
    setColor(newColor);
    localStorage.setItem("theme-color", newColor);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {themes.map((theme) => (
        <Button
          key={theme.name}
          variant={"outline"}
          className={cn(
            "justify-start",
            color === theme.name && "border-2 border-primary",
          )}
          onClick={() => handleColorChange(theme.name)}
        >
          <span
            className={cn(
              "mr-2 flex h-5 w-5 shrink-0 -translate-x-1 items-center justify-center rounded-full",
              theme.activeColor,
            )}
          >
            {color === theme.name && <Check className="h-4 w-4 text-white" />}
          </span>
          {theme.label}
        </Button>
      ))}
    </div>
  );
}
