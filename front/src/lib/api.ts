const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  content?: string;
  parent_id?: string;
  is_folder: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
  deleted_at?: string | null;
}

function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function login(data: any) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function register(data: any) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

export async function fetchDocs(): Promise<Document[]> {
  const res = await fetch(`${API_URL}/documents`, {
    headers: getHeaders(),
  });
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error("Failed to fetch docs");
  return res.json();
}

export async function createDoc(
  title: string,
  is_folder: boolean = false,
  parent_id?: string,
  tags?: string[],
): Promise<Document> {
  const res = await fetch(`${API_URL}/documents`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      title,
      is_folder,
      parent_id,
      tags,
      // owner_id is handled by backend from token claims
      content: "",
    }),
  });
  if (!res.ok) throw new Error("Failed to create doc");
  return res.json();
}

export async function getDoc(id: string): Promise<Document> {
  const res = await fetch(`${API_URL}/documents/${id}`, {
    headers: getHeaders(),
  });
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error("Failed to fetch document");
  return res.json();
}

export async function updateDoc(
  id: string,
  data: {
    title?: string;
    content?: string;
    parent_id?: string;
    tags?: string[];
  },
): Promise<Document> {
  const res = await fetch(`${API_URL}/documents/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error("Failed to update document");
  return res.json();
}

export async function deleteDoc(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/documents/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error("Failed to delete document");
}

export async function fetchTags(): Promise<Tag[]> {
  const res = await fetch(`${API_URL}/tags`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json();
}

export async function createTag(name: string): Promise<Tag> {
  const res = await fetch(`${API_URL}/tags`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to create tag");
  return res.json();
}

export async function fetchTrash(): Promise<Document[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/trash`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch trash");
  return res.json();
}

export async function restoreDoc(id: string): Promise<void> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/documents/${id}/restore`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to restore document");
}

export async function permanentDeleteDoc(id: string): Promise<void> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/documents/${id}/permanent`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete document permanently");
}

export interface SearchResult {
  id: string;
  title: string;
  headline: string;
  rank: number;
}

export async function searchDocs(query: string): Promise<SearchResult[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to search docs");
  return res.json();
}
