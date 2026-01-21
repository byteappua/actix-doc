use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpServer};
use dotenv::dotenv;
use env_logger::Env;

mod auth;
mod db;
mod docs;
mod errors;
mod models;

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};
use sqlx::query;

async fn create_default_user(pool: &db::DbPool) -> Result<(), Box<dyn std::error::Error>> {
    // Check if admin user exists
    let existing = query!("SELECT id FROM users WHERE username = ?", "admin")
        .fetch_optional(pool)
        .await?;

    if existing.is_some() {
        println!("Default admin user already exists");
        return Ok(());
    }

    // Create admin user with password "admin"
    let password = "admin";
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| format!("Password hashing failed: {}", e))?
        .to_string();

    let user_id = uuid::Uuid::new_v4().to_string();

    query!(
        "INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)",
        user_id,
        "admin",
        password_hash
    )
    .execute(pool)
    .await?;

    println!("✅ Default admin user created (username: admin, password: admin)");
    println!("⚠️  Please change the default password in production!");

    Ok(())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(Env::default().default_filter_or("info"));

    let pool = db::init_pool().await;

    // Create default user if not exists
    if let Err(e) = create_default_user(&pool).await {
        eprintln!("Warning: Failed to create default user: {}", e);
    }

    HttpServer::new(move || {
        let cors = Cors::permissive(); // For dev

        App::new()
            .wrap(Logger::default())
            .wrap(cors)
            .app_data(web::Data::new(pool.clone()))
            .service(auth::register)
            .service(auth::login)
            .service(docs::list_docs)
            .service(docs::get_doc)
            .service(docs::create_doc)
            .service(docs::update_doc)
            .service(docs::delete_doc)
            .service(actix_files::Files::new("/", "./static").index_file("index.html"))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
