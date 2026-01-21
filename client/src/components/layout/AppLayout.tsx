"use client";

import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="min-h-screen w-full rounded-lg border"
    >
      <ResizablePanel
        defaultSize={20}
        minSize={15}
        maxSize={30}
        className="hidden md:block"
      >
        <AppSidebar />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={80}>
        <div className="h-full p-6">{children}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
