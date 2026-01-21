use actix_web::{post, web, HttpResponse};
use argon2::{
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

use uuid::Uuid;

use crate::{
    db::DbPool,
    errors::ServiceError,
    models::{CreateUserRequest, LoginRequest, User},
};

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenClaims {
    pub sub: String,
    pub exp: usize,
    pub iat: usize,
}

#[derive(Serialize)]
struct AuthResponse {
    token: String,
    username: String,
}

pub fn validate_token(token: &str) -> Result<String, ServiceError> {
    let jwt_secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "dev_fallback_secret_key_change_me".to_string());

    let key = DecodingKey::from_secret(jwt_secret.as_ref());
    let validation = Validation::default();

    let token_data = decode::<TokenClaims>(token, &key, &validation)
        .map_err(|_| ServiceError::Unauthorized("Invalid token".into()))?;

    Ok(token_data.claims.sub)
}

#[post("/auth/register")]
pub async fn register(
    pool: web::Data<DbPool>,
    req: web::Json<CreateUserRequest>,
) -> Result<HttpResponse, ServiceError> {
    let exists = sqlx::query!("SELECT id FROM users WHERE username = ?", req.username)
        .fetch_optional(pool.get_ref())
        .await?;

    if exists.is_some() {
        return Err(ServiceError::BadRequest("Username already exists".into()));
    }

    let salt = SaltString::generate(&mut rand::thread_rng());
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(req.password.as_bytes(), &salt)
        .map_err(|_| ServiceError::InternalServerError)?
        .to_string();

    let user_id = Uuid::new_v4().to_string();

    sqlx::query!(
        "INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)",
        user_id,
        req.username,
        password_hash
    )
    .execute(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(serde_json::json!({"message": "User created successfully"})))
}

#[post("/auth/login")]
pub async fn login(
    pool: web::Data<DbPool>,
    req: web::Json<LoginRequest>,
) -> Result<HttpResponse, ServiceError> {
    let user = sqlx::query_as!(
        User,
        "SELECT id, username, password_hash, created_at FROM users WHERE username = ?",
        req.username
    )
    .fetch_optional(pool.get_ref())
    .await?
    .ok_or(ServiceError::BadRequest("Invalid credentials".into()))?;

    let parsed_hash =
        PasswordHash::new(&user.password_hash).map_err(|_| ServiceError::InternalServerError)?;

    Argon2::default()
        .verify_password(req.password.as_bytes(), &parsed_hash)
        .map_err(|_| ServiceError::BadRequest("Invalid credentials".into()))?;

    let expiration = Utc::now()
        .checked_add_signed(Duration::hours(24))
        .expect("valid timestamp")
        .timestamp();

    let claims = TokenClaims {
        sub: user.id.clone(),
        exp: expiration as usize,
        iat: Utc::now().timestamp() as usize,
    };

    let jwt_secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "dev_fallback_secret_key_change_me".to_string());

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(jwt_secret.as_ref()),
    )
    .map_err(|_| ServiceError::InternalServerError)?;

    Ok(HttpResponse::Ok().json(AuthResponse {
        token,
        username: user.username,
    }))
}
