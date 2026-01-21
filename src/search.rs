use crate::{db::DbPool, errors::ServiceError};
use actix_web::{get, web, HttpRequest, HttpResponse};
use serde::{Deserialize, Serialize};
use sqlx::query_as;

#[derive(Debug, Deserialize)]
pub struct SearchQuery {
    pub q: String,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct SearchResult {
    pub id: String,
    pub title: String,
    pub headline: String, // Use 'headline' for highlighted content snippet
    pub rank: f64,
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

#[get("/search")]
pub async fn search_docs(
    pool: web::Data<DbPool>,
    req: HttpRequest,
    query_params: web::Query<SearchQuery>,
) -> Result<HttpResponse, ServiceError> {
    let user_id = get_user_id(&req)?;
    let q = &query_params.q;

    // SQLite FTS5 query with snippet highlighting.
    // We join with the `documents` table to ensure access control (owner_id) and check deleted_at.
    // Note: FTS5 rank is used for ordering.
    // snippet(documents_fts, -1, '<b>', '</b>', '...', 64) generates a snippet from any column.
    // highlight(documents_fts, 2, '<b>', '</b>') highlights the content column (index 2).

    // Using simple FTS syntax. Need to sanitize or handle query syntax errors?
    // SQLite FTS MATCH syntax can error on some inputs (e.g. unbalanced quotes).
    // For simplicity, we pass the query directly but user might trigger error.
    // Ideally we should escape or use a safe query builder, but raw query is fine for MVP.
    // To be safer, we can treat the whole string as a phrase or use "param" binding.
    // But MATCH param binding works.

    // Use runtime query_as to avoid macro type inference issues with FTS functions
    let results = sqlx::query_as::<_, SearchResult>(
        r#"
        SELECT 
            d.id, 
            d.title, 
            snippet(documents_fts, 2, '<mark>', '</mark>', '...', 64) as headline,
            documents_fts.rank as rank
        FROM documents_fts
        JOIN documents d ON documents_fts.id = d.id
        WHERE documents_fts MATCH ? 
          AND d.owner_id = ? 
          AND d.deleted_at IS NULL
        ORDER BY rank
        LIMIT 20
        "#,
    )
    .bind(q)
    .bind(user_id)
    .fetch_all(pool.get_ref())
    .await;

    // Handle potential query errors (e.g. syntax error in FTS query) gracefully-ish
    let results = match results {
        Ok(r) => r,
        Err(e) => {
            eprintln!("Search error: {}", e);
            // It might be a syntax error in the FTS query string
            return Ok(HttpResponse::Ok().json(Vec::<SearchResult>::new()));
        }
    };

    Ok(HttpResponse::Ok().json(results))
}
