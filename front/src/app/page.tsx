"use client";

import { Button } from "@/components/ui/button";
import { createDoc } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import dynamic from "next/dynamic";

const DocumentEditor = dynamic(
  () => import("@/components/editor/DocumentEditor").then(mod => ({ default: mod.DocumentEditor })),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full">Loading editor...</div>
  }
);

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const doc = await createDoc("Untitled");
      router.push(`/?id=${doc.id}`);
    } catch (error) {
      console.error("Failed to create document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (docId) {
    return <DocumentEditor documentId={docId} />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to Actix Doc
        </h1>
        <p className="text-muted-foreground">
          Select a document from the sidebar or create a new one.
        </p>
      </div>
      <Button onClick={handleCreate} disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Document"}
      </Button>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
