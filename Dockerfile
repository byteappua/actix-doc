# Multi-stage build for Actix+Next.js application

# Stage 1: Build frontend
FROM node:20-slim AS frontend-builder

WORKDIR /app/front

# Copy frontend package files
COPY front/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY front/ ./

# Build frontend
RUN npm run build

# Stage 2: Build backend
FROM rust:1.75-slim-bookworm AS backend-builder

WORKDIR /app

# Install build dependencies
RUN apt-update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy Cargo files
COPY Cargo.toml Cargo.lock ./

# Create dummy src to cache dependencies
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src

# Copy actual source code
COPY src ./src
COPY migrations ./migrations

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/front/out ./static

# Build the application
RUN cargo build --release

# Stage 3: Runtime
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Copy binary from builder
COPY --from=backend-builder /app/target/release/actix-doc /app/actix-doc

# Copy migrations
COPY --from=backend-builder /app/migrations /app/migrations

# Copy static files
COPY --from=backend-builder /app/static /app/static

# Create data directory for SQLite
RUN mkdir -p /app/data

# Set environment
ENV DATABASE_URL=sqlite:/app/data/data.db
ENV RUST_LOG=info

# Expose port
EXPOSE 8080

# Run the application
CMD ["/app/actix-doc"]
