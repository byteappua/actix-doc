use actix_web::{HttpResponse, ResponseError};
use derive_more::Display;
use serde::Serialize;

#[derive(Debug, Display)]
pub enum ServiceError {
    #[display("Internal Server Error")]
    InternalServerError,
    #[display("BadRequest: {}", _0)]
    BadRequest(String),
    #[allow(dead_code)]
    #[display("Unauthorized: {}", _0)]
    Unauthorized(String),
}

#[derive(Debug, Serialize)]
struct ErrorResponse {
    error: String,
}

impl ResponseError for ServiceError {
    fn error_response(&self) -> HttpResponse {
        match self {
            ServiceError::InternalServerError => {
                HttpResponse::InternalServerError().json(ErrorResponse {
                    error: "Internal Server Error".into(),
                })
            }
            ServiceError::BadRequest(ref message) => {
                HttpResponse::BadRequest().json(ErrorResponse {
                    error: message.into(),
                })
            }
            ServiceError::Unauthorized(ref message) => HttpResponse::Unauthorized().json(ErrorResponse {
                error: message.into(),
            }),
        }
    }
}

impl From<sqlx::Error> for ServiceError {
    fn from(error: sqlx::Error) -> ServiceError {
        // Log the error
        eprintln!("Database error: {:?}", error);
        ServiceError::InternalServerError
    }
}
