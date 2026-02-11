# Asset Guard

Asset Guard is a robust asset management system built with [NestJS](https://github.com/nestjs/nest). It features strict type safety, role-based access control (RBAC), and automated quality checks.

## 🚀 Features

- **Asset Management**: Full CRUD operations for assets.
- **Asset Assignment**: Link assets to users with history tracking.
- **Role-Based Access Control**: Secure endpoints with `@Admin` and `@Staff` decorators.
- **User Management**: Registration and paginated user lists for administrators.
- **API Documentation**: Interactive Swagger UI available at `/docs`.
- **Quality Control**: Strict ESLint configuration with automated unused-import removal.
- **CI/CD**: GitHub Action to run linting on every pull request.

## 🛠️ Prerequisites

- **Node.js**: Version 20 or higher.
- **Database**: PostgreSQL (Supabase recommended).
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
```

### 4. Database Migrations
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

## 🛡️ License

Asset Guard is [MIT licensed](LICENSE).
