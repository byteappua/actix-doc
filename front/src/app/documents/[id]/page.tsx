"use client";

import { Editor } from "@/components/editor/Editor";
import { useAuth } from "@/lib/auth";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Document, getDoc, updateDoc } from "@/lib/api";

export default function DocumentPage() {
  const params = useParams();
  const { user } = useAuth();
  const [doc, setDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadDoc(params.id as string);
    }
  }, [params.id]);

  const loadDoc = async (id: string) => {
    try {
      const data = await getDoc(id);
      setDoc(data);
    } catch (error) {
      console.error("Failed to load document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = async (content: string) => {
    if (!doc) return;
    try {
      await updateDoc(doc.id, { content });
    } catch (error) {
      console.error("Failed to save document:", error);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!doc) {
    return <div className="p-8">Document not found</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">{doc.title}</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          initialContent={doc.content}
          onChange={handleChange}
          editable={true}
        />
      </div>
    </div>
  );
}
