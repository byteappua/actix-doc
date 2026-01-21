"use client";

import { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createTag, fetchTags, Tag } from "@/lib/api";
import { cn } from "@/lib/utils";

interface TagInputProps {
  selectedTags: string[]; // List of tag IDs
  onChange: (tags: string[]) => void;
}

export function TagInput({ selectedTags, onChange }: TagInputProps) {
  const [open, setOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const tags = await fetchTags();
      setAvailableTags(tags);
    } catch (e) {
      console.error("Failed to load tags", e);
    }
  };

  const handleSelect = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
  };

  const handleCreateTag = async () => {
    if (!search) return;
    try {
      const newTag = await createTag(search);
      setAvailableTags([...availableTags, newTag]);
      handleSelect(newTag.id);
      setSearch("");
      setOpen(false);
    } catch (e) {
      console.error("Failed to create tag", e);
    }
  };

  const selectedTagObjects = availableTags.filter((tag) =>
    selectedTags.includes(tag.id),
  );

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {selectedTagObjects.map((tag) => (
        <Badge key={tag.id} variant="secondary" className="gap-1">
          {tag.name}
          <X
            className="h-3 w-3 cursor-pointer hover:text-destructive"
            onClick={() => handleSelect(tag.id)}
          />
        </Badge>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 gap-1">
            <Plus className="h-3 w-3" />
            Add Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[200px]" align="start">
          <Command>
            <CommandInput
              placeholder="Search or create tag..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                <div className="p-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    No tag found.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-7 text-xs"
                    onClick={handleCreateTag}
                  >
                    Create "{search}"
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup heading="Tags">
                {availableTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => handleSelect(tag.id)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        selectedTags.includes(tag.id)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <Plus
                        className={cn(
                          "h-4 w-4",
                          selectedTags.includes(tag.id) ? "hidden" : "",
                        )}
                      />
                    </div>
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
