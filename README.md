# Asset Guard

Asset Guard is a robust asset management system built with [NestJS](https://github.com/nestjs/nest). It features strict type safety, role-based access control (RBAC), and automated quality checks. I built this project as part of learning backend development with Nest

## 🚀 Features

- **Asset Management**: Full CRUD operations for assets.
- **Asset Assignment**: Link assets to users with history tracking.
- **File Uploads**: Secure profile image upload using Supabase Storage.
- **Authentication**: JWT-based auth with separate access and refresh tokens.
- **Secure Auth Errors**: Login returns a generic `Invalid credentials` message for both unknown email and wrong password.
- **Smart Rate Limiting**: Global throttling with token-aware tracking and stricter limits for auth endpoints.
- **Role-Based Access Control**: Secure endpoints with `@Admin` and `@Staff` decorators.
- **Asset Types Management**: Dynamic management of asset categories (Admin only).
- **User Management**: Registration, paginated user lists, and validated search for administrators.
- **API Documentation**: Interactive Swagger UI available at `/docs`.
- **Quality Control**: Strict ESLint configuration with automated unused-import removal.
- **Automated Testing**: 47 unit tests covering core services, guards, and shared infrastructure.
- **CI/CD**: GitHub Actions to run linting and unit tests on every pull request.

## 🛠️ Prerequisites

- **Node.js**: Version 20 or higher.
- **Database**: Supabase PostgreSQL URL (required).
- **Storage**: Supabase Storage (S3-compatible bucket).
- **Package Manager**: npm.

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd asset-guard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add the following variables:
```env
SUPABASE_DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000

# Supabase Storage Configuration
SUPABASE_STORAGE_ENDPOINT=https://your-project-ref.storage.supabase.co/storage/v1/s3
SUPABASE_STORAGE_REGION=your-region
SUPABASE_STORAGE_BUCKET=your-bucket-name
SUPABASE_STORAGE_ACCESS_KEY_ID=your-access-key
SUPABASE_STORAGE_SECRET_ACCESS_KEY=your-secret-key

# Throttling Configuration
THROTTLE_TTL_MS=60000
THROTTLE_LIMIT=60
THROTTLE_AUTH_LOGIN_TTL_MS=60000
THROTTLE_AUTH_LOGIN_LIMIT=5
THROTTLE_AUTH_REFRESH_TTL_MS=60000
THROTTLE_AUTH_REFRESH_LIMIT=20
THROTTLE_AUTH_REGISTER_TTL_MS=60000
THROTTLE_AUTH_REGISTER_LIMIT=3
```

This project does not run a local Postgres service in Docker. Both development and production use `SUPABASE_DATABASE_URL`.

### Minimum Required Environment Variables

- `PORT`
- `SUPABASE_DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `SUPABASE_STORAGE_ENDPOINT`
- `SUPABASE_STORAGE_REGION`
- `SUPABASE_STORAGE_BUCKET`
- `SUPABASE_STORAGE_ACCESS_KEY_ID`
- `SUPABASE_STORAGE_SECRET_ACCESS_KEY`

### 4. Configure Supabase Storage
1. Create a new bucket named `asset-guard` (or update `SUPABASE_STORAGE_BUCKET` in `.env`).
2. **Important**: Set the bucket to **Public** to allow profile image access.

### 5. Database Migrations
Ensure your database is accessible. The application uses TypeORM with:
- `synchronize: false`
- `migrationsRun: true`

This means schema changes are applied through migrations on startup.

## 🏃 Running the Application

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## 🚦 Rate Limiting

The API uses `@nestjs/throttler` with a global guard (`SmartThrottlerGuard`) and endpoint-specific limits for auth flows. Limits are configurable via environment variables.

- **Global limit**: `THROTTLE_LIMIT / THROTTLE_TTL_MS` (default `60 requests / 60 seconds`)
- **Tracking strategy**: uses `token:<hash>` when a valid `Bearer` token is present.
- **Tracking fallback**: uses `ip:<address>` when no valid bearer token is provided.
- **Auth endpoint limits**:
- `POST /auth/login`: `THROTTLE_AUTH_LOGIN_LIMIT / THROTTLE_AUTH_LOGIN_TTL_MS` (default `5 / 60s`)
- `POST /auth/refresh`: `THROTTLE_AUTH_REFRESH_LIMIT / THROTTLE_AUTH_REFRESH_TTL_MS` (default `20 / 60s`)
- `POST /auth/register`: `THROTTLE_AUTH_REGISTER_LIMIT / THROTTLE_AUTH_REGISTER_TTL_MS` (default `3 / 60s`)

This setup ensures throttling applies before role checks and protects login/registration flows with tighter limits.

## 🐳 Docker Compose

```bash
# Development (hot reload, API only)
cp .env.example .env
docker compose up --build

# Production-like stack (API only)
cp .env.example .env
docker compose -f docker-compose.prod.yml up --build -d
```

## 🧪 Documentation & Linting

### Swagger API Docs
Start the application and navigate to:
`http://localhost:3000/docs`

### Linting & Formatting
```bash
# Run linter and fix issues
$ npm run lint
```

### Unit Testing
```bash
# Run all unit tests
$ npm run test

# Run tests with coverage report
$ npm run test:cov
```

## 🛡️ License

Asset Guard is [MIT licensed](LICENSE).
