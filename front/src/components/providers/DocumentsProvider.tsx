"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { fetchDocs, createDoc, deleteDoc, Document } from "@/lib/api";
import { useRouter } from "next/navigation";

interface DocumentsContextType {
  documents: Document[];
  isLoading: boolean;
  refreshDocs: () => Promise<void>;
  createNewDoc: (isFolder: boolean, parentId?: string) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(
  undefined,
);

export function DocumentsProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshDocs = useCallback(async () => {
    try {
      // Avoid flickering loading state on refresh if we already have docs
      // but maybe show a small indicator? For now, we just fetch.
      const docs = await fetchDocs();
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to load docs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    refreshDocs();
  }, [refreshDocs]);

  const createNewDoc = async (isFolder: boolean, parentId?: string) => {
    try {
      const doc = await createDoc(
        isFolder ? "New Folder" : "Untitled",
        isFolder,
        parentId,
      );
      await refreshDocs();
      return doc;
    } catch (error) {
      console.error("Failed to create document:", error);
      throw error;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await deleteDoc(id);
      await refreshDocs();
    } catch (error) {
      console.error("Failed to delete document:", error);
      throw error;
    }
  };

  return (
    <DocumentsContext.Provider
      value={{
        documents,
        isLoading,
        refreshDocs,
        createNewDoc,
        deleteDocument,
      }}
    >
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentsProvider");
  }
  return context;
}
