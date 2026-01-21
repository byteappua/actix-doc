const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface Document {
  id: string;
  title: string;
  content?: string;
  parent_id?: string;
  is_folder: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export async function fetchDocs(): Promise<Document[]> {
  const res = await fetch(`${API_URL}/documents`);
  if (!res.ok) throw new Error("Failed to fetch docs");
  return res.json();
}

export async function createDoc(
  title: string,
  is_folder: boolean = false,
  parent_id?: string,
): Promise<Document> {
  const res = await fetch(`${API_URL}/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      is_folder,
      parent_id,
      owner_id: "demo-user", // Temporary
      content: "",
    }),
  });
  if (!res.ok) throw new Error("Failed to create doc");
  return res.json();
}
