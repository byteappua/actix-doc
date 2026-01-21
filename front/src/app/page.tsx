"use client";

import { Button } from "@/components/ui/button";
import { createDoc } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const doc = await createDoc("Untitled");
      router.push(`/documents/${doc.id}`);
    } catch (error) {
      console.error("Failed to create document:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
