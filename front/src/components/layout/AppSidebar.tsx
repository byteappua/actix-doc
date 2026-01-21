"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  Plus,
  Settings,
  Trash2,
  FolderPlus,
} from "lucide-react";
import { createDoc, fetchDocs, deleteDoc, Document } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

interface TreeDocument extends Document {
  children: TreeDocument[];
}

function buildTree(docs: Document[]): TreeDocument[] {
  const map: { [key: string]: TreeDocument } = {};
  const roots: TreeDocument[] = [];

  // Initialize map
  docs.forEach((doc) => {
    map[doc.id] = { ...doc, children: [] };
  });

  // Build tree
  docs.forEach((doc) => {
    if (doc.parent_id && map[doc.parent_id]) {
      map[doc.parent_id].children.push(map[doc.id]);
    } else {
      roots.push(map[doc.id]);
    }
  });

  return roots;
}

interface TreeItemProps {
  item: TreeDocument;
  level: number;
  onDelete: (id: string) => void;
  router: any;
}

function TreeItem({ item, level, onDelete, router }: TreeItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateChild = async (
    e: React.MouseEvent,
    type: "file" | "folder",
  ) => {
    e.stopPropagation();
    try {
      const newDoc = await createDoc(
        type === "folder" ? "New Folder" : "Untitled",
        type === "folder",
        item.id,
      );
      if (type === "file") {
        router.push(`/documents?id=${newDoc.id}`);
      }
      // We need to trigger a refresh logic here, but for now strict UI update is hard without context.
      // A full app refactor to use a Context for documents would be better.
      // For now, we rely on the parent causing a re-render or manual reload.
      // To fix this simply: We might just accept that we need to reload the page or trigger a callback prop.
      window.location.reload(); // Quick fix for immediate feedback until context is added
    } catch (err) {
      console.error(err);
    }
  };

  const RowContent = (
    <div
      className={cn(
        "group flex items-center justify-between w-full hover:bg-accent hover:text-accent-foreground rounded-md py-1 pr-2",
        "cursor-pointer",
      )}
      style={{ paddingLeft: `${level * 12 + 8}px` }}
      onClick={() => {
        if (item.is_folder) {
          setIsOpen(!isOpen);
        } else {
          router.push(`/documents?id=${item.id}`);
        }
      }}
    >
      <div className="flex items-center flex-1 overflow-hidden">
        {item.is_folder ? (
          isOpen ? (
            <ChevronDown className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
          )
        ) : (
          <FileText className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
        )}
        {item.is_folder ? (
          <Folder className="h-4 w-4 mr-2 shrink-0 text-blue-500 fill-blue-500/20" />
        ) : null}
        <span className="truncate text-sm">{item.title}</span>
      </div>

      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        {item.is_folder && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => handleCreateChild(e, "file")}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={async (e) => {
            e.stopPropagation();
            if (
              !confirm(
                `Are you sure you want to delete this ${item.is_folder ? "folder" : "document"}?`,
              )
            )
              return;
            onDelete(item.id);
          }}
        >
          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
    </div>
  );

  if (!item.is_folder) {
    return RowContent;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>{RowContent}</CollapsibleTrigger>
      <CollapsibleContent>
        {item.children.map((child) => (
          <TreeItem
            key={child.id}
            item={child}
            level={level + 1}
            onDelete={onDelete}
            router={router}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

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

  const handleCreate = async (isFolder: boolean) => {
    setIsLoading(true);
    try {
      const doc = await createDoc(
        isFolder ? "New Folder" : "Untitled",
        isFolder,
      );
      if (!isFolder) {
        router.push(`/documents?id=${doc.id}`);
      }
      loadDocs();
    } catch (error) {
      console.error("Failed to create:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(id);
      loadDocs();
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  const tree = buildTree(documents);

  return (
    <div className={cn("pb-12 h-screen border-r bg-background", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            My Workspace
          </h2>
          <div className="flex space-x-2 px-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 justify-start"
              onClick={() => handleCreate(false)}
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Page
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 justify-start"
              onClick={() => handleCreate(true)}
              disabled={isLoading}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              Folder
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            Documents
          </h2>
          <ScrollArea className="h-[calc(100vh-200px)] px-1">
            <div className="space-y-1 p-2">
              {documents.length === 0 && (
                <p className="text-sm text-muted-foreground px-4">
                  No documents yet.
                </p>
              )}
              {tree.map((item) => (
                <TreeItem
                  key={item.id}
                  item={item}
                  level={0}
                  onDelete={handleDelete}
                  router={router}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
        <div className="mt-auto p-4 absolute bottom-0 w-full bg-background border-t">
          <Button variant="outline" className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
