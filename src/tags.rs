use crate::models::tag::{CreateTagRequest, Tag};
use actix_web::{get, post, web, HttpResponse, Responder};
use sqlx::SqlitePool;
use uuid::Uuid;

#[get("/tags")]
pub async fn list_tags(pool: web::Data<SqlitePool>) -> impl Responder {
    let tags = sqlx::query_as!(
        Tag,
        "SELECT id, name, created_at FROM tags ORDER BY name ASC"
    )
    .fetch_all(pool.get_ref())
    .await;

    match tags {
        Ok(tags) => HttpResponse::Ok().json(tags),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

#[post("/tags")]
pub async fn create_tag(
    pool: web::Data<SqlitePool>,
    req: web::Json<CreateTagRequest>,
) -> impl Responder {
    let id = Uuid::new_v4().to_string();

    let result = sqlx::query!("INSERT INTO tags (id, name) VALUES (?, ?)", id, req.name)
        .execute(pool.get_ref())
        .await;

    match result {
        Ok(_) => {
            let tag = sqlx::query_as!(
                Tag,
                "SELECT id, name, created_at FROM tags WHERE id = ?",
                id
            )
            .fetch_one(pool.get_ref())
            .await;

            match tag {
                Ok(tag) => HttpResponse::Ok().json(tag),
                Err(_) => HttpResponse::InternalServerError().finish(),
            }
        }
        Err(e) => {
            // Check for unique constraint violation
            if e.to_string().contains("UNIQUE constraint failed") {
                HttpResponse::BadRequest().body("Tag already exists")
            } else {
                HttpResponse::InternalServerError().finish()
            }
        }
    }
}
