"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronRight,
  FileText,
  Folder,
  Plus,
  Settings,
  Users,
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppSidebar({ className }: SidebarProps) {
  return (
    <div className={cn("pb-12 h-screen border-r bg-background", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            My Workspace
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              New Page
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            Documents
          </h2>
          <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1 p-2">
              {/* Mock Items */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start font-normal"
              >
                <Folder className="mr-2 h-4 w-4" />
                Projects
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start font-normal pl-6"
              >
                <FileText className="mr-2 h-4 w-4" />
                Q1 Planning
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start font-normal"
              >
                <FileText className="mr-2 h-4 w-4" />
                Personal Notes
              </Button>
            </div>
          </ScrollArea>
        </div>
        <div className="mt-auto p-4">
          <Button variant="outline" className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
