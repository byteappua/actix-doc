"use client";

import { useEffect, useState } from "react";
import { Editor } from "./Editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDoc, updateDoc } from "@/lib/api";
import { Save, Loader2 } from "lucide-react";

interface DocumentEditorProps {
  documentId: string;
}

export function DocumentEditor({ documentId }: DocumentEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    try {
      setIsLoading(true);
      const doc = await getDoc(documentId);
      setTitle(doc.title);
      setContent(doc.content || "");
    } catch (error) {
      console.error("Failed to load document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateDoc(documentId, { title, content });
      setLastSaved(new Date());
    } catch (error) {
      console.error("Failed to save document:", error);
      alert("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex items-center gap-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-2"
          placeholder="Untitled"
        />
        <div className="flex items-center gap-2 ml-auto">
          {lastSaved && (
            <span className="text-sm text-muted-foreground">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <Editor content={content} onChange={setContent} />
      </div>
    </div>
  );
}
