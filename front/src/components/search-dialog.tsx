"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";
import { Search } from "lucide-react";
import { searchDocs, SearchResult } from "@/lib/api";
import { DialogTitle } from "@radix-ui/react-dialog";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange, open]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const data = await searchDocs(query);
        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (id: string) => {
    onOpenChange(false);
    router.push(`/documents/${id}/edit`);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Search Documents</DialogTitle>
      <div className="flex items-center border-b px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandInput
          placeholder="Search documents..."
          value={query}
          onValueChange={setQuery}
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden">
        <CommandEmpty className="py-6 text-center text-sm">
          No results found.
        </CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Documents">
            {results.map((doc) => (
              <CommandItem
                key={doc.id}
                value={`${doc.title} ${doc.id}`} // Hack to ensure uniqueness/searchability if cmdk filters client side too
                onSelect={() => handleSelect(doc.id)}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{doc.title}</span>
                  <span
                    className="text-xs text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: doc.headline }}
                  />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
