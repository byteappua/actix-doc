use sqlx::sqlite::SqlitePool;
use std::env;

pub type DbPool = SqlitePool;

pub async fn init_pool() -> DbPool {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    SqlitePool::connect(&database_url)
        .await
        .expect("Failed to create pool")
}
