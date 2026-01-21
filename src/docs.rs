use actix_web::{delete, get, post, put, web, HttpRequest, HttpResponse};
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
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateDocRequest {
    pub title: Option<String>,
    pub content: Option<String>,
    pub parent_id: Option<String>,
}

fn get_user_id(req: &HttpRequest) -> Result<String, ServiceError> {
    let auth_header = req
        .headers()
        .get("Authorization")
        .ok_or(ServiceError::Unauthorized("No token provided".into()))?
        .to_str()
        .map_err(|_| ServiceError::Unauthorized("Invalid token format".into()))?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or(ServiceError::Unauthorized("Invalid token format".into()))?;

    crate::auth::validate_token(token)
}

#[get("/documents")]
pub async fn list_docs(
    pool: web::Data<DbPool>,
    req: HttpRequest,
) -> Result<HttpResponse, ServiceError> {
    let user_id = get_user_id(&req)?;

    let docs = query_as!(
        Document,
        "SELECT * FROM documents WHERE owner_id = ? ORDER BY is_folder DESC, title ASC",
        user_id
    )
    .fetch_all(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(docs))
}

#[get("/documents/{id}")]
pub async fn get_doc(
    pool: web::Data<DbPool>,
    id: web::Path<String>,
    req: HttpRequest,
) -> Result<HttpResponse, ServiceError> {
    let user_id = get_user_id(&req)?;
    let doc_id = id.into_inner();

    let doc = query_as!(Document, "SELECT * FROM documents WHERE id = ?", doc_id)
        .fetch_optional(pool.get_ref())
        .await?
        .ok_or(ServiceError::BadRequest("Document not found".into()))?;

    if doc.owner_id != user_id {
        return Err(ServiceError::Forbidden("Permission denied".into()));
    }

    Ok(HttpResponse::Ok().json(doc))
}

#[post("/documents")]
pub async fn create_doc(
    pool: web::Data<DbPool>,
    req: web::Json<CreateDocRequest>,
    http_req: HttpRequest,
) -> Result<HttpResponse, ServiceError> {
    let user_id = get_user_id(&http_req)?;
    let id = Uuid::new_v4().to_string();

    let _ = query!(
        "INSERT INTO documents (id, title, content, parent_id, owner_id, is_folder) VALUES (?, ?, ?, ?, ?, ?)",
        id,
        req.title,
        req.content,
        req.parent_id,
        user_id,
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
    http_req: HttpRequest,
) -> Result<HttpResponse, ServiceError> {
    let user_id = get_user_id(&http_req)?;
    let doc_id = id.into_inner();
    let now = Utc::now().naive_utc();

    let mut doc = query_as!(Document, "SELECT * FROM documents WHERE id = ?", doc_id)
        .fetch_optional(pool.get_ref())
        .await?
        .ok_or(ServiceError::BadRequest("Document not found".into()))?;

    if doc.owner_id != user_id {
        return Err(ServiceError::Forbidden("Permission denied".into()));
    }

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
    req: HttpRequest,
) -> Result<HttpResponse, ServiceError> {
    let user_id = get_user_id(&req)?;
    let doc_id = id.into_inner();

    let doc = query_as!(Document, "SELECT * FROM documents WHERE id = ?", doc_id)
        .fetch_optional(pool.get_ref())
        .await?
        .ok_or(ServiceError::BadRequest("Document not found".into()))?;

    if doc.owner_id != user_id {
        return Err(ServiceError::Forbidden("Permission denied".into()));
    }

    let result = query!("DELETE FROM documents WHERE id = ?", doc_id)
        .execute(pool.get_ref())
        .await?;

    if result.rows_affected() == 0 {
        return Err(ServiceError::BadRequest("Document not found".into()));
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({"message": "Document deleted"})))
}
