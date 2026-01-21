"use client";

import { Editor } from "@/components/editor/Editor";

export default function DocumentPage({ params }: { params: { id: string } }) {
  return (
    <div className="h-full">
      <Editor />
    </div>
  );
}
