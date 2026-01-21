"use client";

import { useEffect, useState } from "react";
import {
  Document,
  fetchTrash,
  restoreDoc,
  permanentDeleteDoc,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Loader2, RefreshCw, Trash2, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TrashPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadTrash = async () => {
    try {
      setIsLoading(true);
      const data = await fetchTrash();
      setDocs(data);
    } catch (error) {
      console.error("Failed to load trash:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const handleRestore = async (id: string) => {
    try {
      setActionLoading(id);
      await restoreDoc(id);
      setDocs((prev) => prev.filter((d) => d.id !== id));
      router.refresh(); // Refresh server components if any, or trigger sidebar reload
      // Ideally we should signal sidebar to update. Reloading page is crude but works for now.
      window.location.reload();
    } catch (error) {
      console.error("Failed to restore:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePermanent = async (id: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    try {
      setActionLoading(id);
      await permanentDeleteDoc(id);
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Failed to delete permanently:", error);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trash Bin</h1>
          <p className="text-muted-foreground">Manage deleted documents.</p>
        </div>
        <Button variant="outline" onClick={loadTrash}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Deleted At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Trash is empty.
                </TableCell>
              </TableRow>
            ) : (
              docs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    {doc.is_folder ? (
                      <Badge variant="outline">Folder</Badge>
                    ) : (
                      <Badge variant="secondary">Page</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{doc.title}</TableCell>
                  <TableCell>
                    {doc.deleted_at
                      ? formatDistanceToNow(new Date(doc.deleted_at), {
                          addSuffix: true,
                        })
                      : "Unknown"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(doc.id)}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Undo2 className="h-4 w-4 text-blue-500" />
                        )}
                        <span className="sr-only">Restore</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePermanent(doc.id)}
                        disabled={!!actionLoading}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Delete Forever</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
