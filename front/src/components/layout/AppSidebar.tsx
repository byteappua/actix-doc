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
import { createDoc, fetchDocs, Document } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppSidebar({ className }: SidebarProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const docs = await fetchDocs();
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to load docs:", error);
    }
  };

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const doc = await createDoc("Untitled");
      router.push(`/documents/${doc.id}`);
      loadDocs(); // Refresh list
    } catch (error) {
      console.error("Failed to create document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("pb-12 h-screen border-r bg-background", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            My Workspace
          </h2>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleCreate}
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              {isLoading ? "Creating..." : "New Page"}
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            Documents
          </h2>
          <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1 p-2">
              {documents.length === 0 && (
                <p className="text-sm text-muted-foreground px-4">
                  No documents yet.
                </p>
              )}
              {documents.map((doc) => (
                <Button
                  key={doc.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start font-normal"
                  onClick={() => router.push(`/documents/${doc.id}`)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {doc.title}
                </Button>
              ))}
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
