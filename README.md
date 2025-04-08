# Auth-Biometric
Develop a RESTful API service using NestJS with TypeScript that supports user authentication (standard and biometric), registration, and utilizes Prisma as the ORM. The API should be exposed through GraphQL.

**Prerequisites**
Before you begin, make sure you have the following installed:
Node.js (v18+)
npm (comes with Node.js)
PostgreSQL 

**Environment Setup**
1. **Clone the repository**
git clone https://github.com/fabian894/Auth-Biometric.git
2. **Install dependencies**
npm install
3. **Install and initialize Prisma**
npm install -g prisma
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
4. **Setup your .env file**
Create a .env file in the root directory and add your database URL:
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/db_name"
JWT_SECRET=your_super_secret_key
note: please ignore if the .env created initially is cloned along with the project but make sure the database exist on your postgreSQL and change the "db_name" to the database name created on your db
5. **Push the schema to the database**
npx prisma db push
6. **Install authentication packages**
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install --save-dev @types/passport-jwt
7. **Run the development server**
npm run start:dev
8. **Access the GraphQL Playground**
Open your browser and go to: http://localhost:3000/graphql
note: ensure you have docker installed on your local
9. **Unit Testing**
npm run test user
