use crate::{
    db::DbPool,
    errors::ServiceError,
    models::{tag::Tag, Document, DocumentWithTags},
};
use actix_web::{delete, get, post, web, HttpRequest, HttpResponse};
use sqlx::query;
use sqlx::query_as;

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

#[get("/trash")]
pub async fn get_trash(
    pool: web::Data<DbPool>,
    req: HttpRequest,
) -> Result<HttpResponse, ServiceError> {
    let user_id = get_user_id(&req)?;

    let docs = query_as!(
        Document,
        "SELECT * FROM documents WHERE owner_id = ? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC",
        user_id
    )
    .fetch_all(pool.get_ref())
    .await?;

    let mut docs_with_tags = Vec::new();
    for doc in docs {
        let tags = query_as!(
            Tag,
            r#"
            SELECT t.id, t.name, t.created_at
            FROM tags t
            JOIN document_tags dt ON t.id = dt.tag_id
            WHERE dt.document_id = ?
            ORDER BY t.name ASC
            "#,
            doc.id
        )
        .fetch_all(pool.get_ref())
        .await?;

        docs_with_tags.push(DocumentWithTags {
            document: doc,
            tags,
        });
    }

    Ok(HttpResponse::Ok().json(docs_with_tags))
}

#[post("/documents/{id}/restore")]
pub async fn restore_doc(
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

    let _ = query!(
        "UPDATE documents SET deleted_at = NULL WHERE id = ?",
        doc_id
    )
    .execute(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(serde_json::json!({"message": "Document restored"})))
}

#[delete("/documents/{id}/permanent")]
pub async fn delete_doc_permanent(
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

    let _ = query!("DELETE FROM documents WHERE id = ?", doc_id)
        .execute(pool.get_ref())
        .await?;

    Ok(HttpResponse::Ok().json(serde_json::json!({"message": "Document permanently deleted"})))
}
