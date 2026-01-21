use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpServer};
use dotenv::dotenv;
use env_logger::Env;

mod auth;
mod db;
mod docs;
mod errors;
mod models;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(Env::default().default_filter_or("info"));

    let pool = db::init_pool().await;

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
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
