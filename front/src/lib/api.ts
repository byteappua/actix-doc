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
): Promise<Document> {
  const res = await fetch(`${API_URL}/documents`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      title,
      is_folder,
      parent_id,
      // owner_id is handled by backend from token claims
      content: "",
    }),
  });
  if (!res.ok) throw new Error("Failed to create doc");
  return res.json();
}
