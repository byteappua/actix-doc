use actix_web::{delete, get, post, put, web, HttpResponse};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::{query, query_as};
use uuid::Uuid;

use crate::{db::DbPool, errors::ServiceError, models::Document};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateDocRequest {
    pub title: String,
    pub content: Option<String>,
    pub parent_id: Option<String>,
    pub is_folder: bool,
    pub owner_id: String, // TODO: Get from JWT
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateDocRequest {
    pub title: Option<String>,
    pub content: Option<String>,
    pub parent_id: Option<String>,
}

#[get("/documents")]
pub async fn list_docs(pool: web::Data<DbPool>) -> Result<HttpResponse, ServiceError> {
    // TODO: Filter by user_id from JWT
    let docs = query_as!(
        Document,
        "SELECT * FROM documents ORDER BY is_folder DESC, title ASC"
    )
    .fetch_all(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(docs))
}

#[get("/documents/{id}")]
pub async fn get_doc(
    pool: web::Data<DbPool>,
    id: web::Path<String>,
) -> Result<HttpResponse, ServiceError> {
    let doc_id = id.into_inner();
    let doc = query_as!(Document, "SELECT * FROM documents WHERE id = ?", doc_id)
        .fetch_optional(pool.get_ref())
        .await?
        .ok_or(ServiceError::BadRequest("Document not found".into()))?;

    Ok(HttpResponse::Ok().json(doc))
}

#[post("/documents")]
pub async fn create_doc(
    pool: web::Data<DbPool>,
    req: web::Json<CreateDocRequest>,
) -> Result<HttpResponse, ServiceError> {
    let id = Uuid::new_v4().to_string();

    let _ = query!(
        "INSERT INTO documents (id, title, content, parent_id, owner_id, is_folder) VALUES (?, ?, ?, ?, ?, ?)",
        id,
        req.title,
        req.content,
        req.parent_id,
        req.owner_id,
        req.is_folder
    )
    .execute(pool.get_ref())
    .await?;

    let doc = query_as!(Document, "SELECT * FROM documents WHERE id = ?", id)
        .fetch_one(pool.get_ref())
        .await?;

    Ok(HttpResponse::Ok().json(doc))
}

#[put("/documents/{id}")]
pub async fn update_doc(
    pool: web::Data<DbPool>,
    id: web::Path<String>,
    req: web::Json<UpdateDocRequest>,
) -> Result<HttpResponse, ServiceError> {
    let doc_id = id.into_inner();
    let now = Utc::now().naive_utc();

    // Determine what to update. This is a bit manual dynamically with macros,
    // so for now we'll do a simple coalesced update or separate updates.
    // Simplifying: Always update all provided fields or keep existing.
    // Better strategy for sqlx macro: Fetch, update struct, save back.

    let mut doc = query_as!(Document, "SELECT * FROM documents WHERE id = ?", doc_id)
        .fetch_optional(pool.get_ref())
        .await?
        .ok_or(ServiceError::BadRequest("Document not found".into()))?;

    if let Some(title) = &req.title {
        doc.title = title.clone();
    }
    if let Some(content) = &req.content {
        doc.content = Some(content.clone());
    }
    if let Some(parent_id) = &req.parent_id {
        doc.parent_id = Some(parent_id.clone());
    }
    doc.updated_at = now;

    let _ = query!(
        "UPDATE documents SET title = ?, content = ?, parent_id = ?, updated_at = ? WHERE id = ?",
        doc.title,
        doc.content,
        doc.parent_id,
        doc.updated_at,
        doc_id
    )
    .execute(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(doc))
}

#[delete("/documents/{id}")]
pub async fn delete_doc(
    pool: web::Data<DbPool>,
    id: web::Path<String>,
) -> Result<HttpResponse, ServiceError> {
    let doc_id = id.into_inner();
    let result = query!("DELETE FROM documents WHERE id = ?", doc_id)
        .execute(pool.get_ref())
        .await?;

    if result.rows_affected() == 0 {
        return Err(ServiceError::BadRequest("Document not found".into()));
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({"message": "Document deleted"})))
}
