# Asset Guard

Asset Guard is a robust asset management system built with [NestJS](https://github.com/nestjs/nest). It features strict type safety, role-based access control (RBAC), and automated quality checks.

## 🚀 Features

- **Asset Management**: Full CRUD operations for assets.
- **Asset Assignment**: Link assets to users with history tracking.
- **File Uploads**: Secure profile image upload using Supabase Storage.
- **Role-Based Access Control**: Secure endpoints with `@Admin` and `@Staff` decorators.
- **User Management**: Registration and paginated user lists for administrators.
- **API Documentation**: Interactive Swagger UI available at `/docs`.
- **Quality Control**: Strict ESLint configuration with automated unused-import removal.
- **Automated Testing**: 35 unit tests covering core services, guards, and shared infrastructure.
- **CI/CD**: GitHub Actions to run linting and unit tests on every pull request.

## 🛠️ Prerequisites

- **Node.js**: Version 20 or higher.
- **Database**: PostgreSQL (Supabase recommended).
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
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=3600
PORT=3000

# Supabase Storage Configuration
SUPABASE_STORAGE_ENDPOINT=https://your-project-ref.storage.supabase.co/storage/v1/s3
SUPABASE_STORAGE_REGION=your-region
SUPABASE_STORAGE_BUCKET=your-bucket-name
SUPABASE_STORAGE_ACCESS_KEY_ID=your-access-key
SUPABASE_STORAGE_SECRET_ACCESS_KEY=your-secret-key
```

### 4. Configure Supabase Storage
1. Create a new bucket named `asset-guard` (or update `SUPABASE_STORAGE_BUCKET` in `.env`).
2. **Important**: Set the bucket to **Public** to allow profile image access.

### 5. Database Migrations
Ensure your database is accessible. The application uses TypeORM with `synchronize: true` for development (defined in `AppModule`).

## 🏃 Running the Application

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
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
