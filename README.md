# RevoBank API (NestJS + Prisma + PostgreSQL)

A small banking-style API for learning purposes:
- **Auth** (JWT)
- **Accounts** (CRUD + strict ownership)
- **Transactions** (deposit, withdraw, transfer)
- **Auto API docs** via Swagger at `/docs`
- **Basic tests** with Jest

---

## Table of Contents
1. [Architecture (Quick)](#architecture-quick)
2. [Tech Stack & Versions](#tech-stack--versions)
3. [Project Structure](#project-structure)
4. [Requirements](#requirements)
5. [Environment Variables](#environment-variables)
6. [Local Database Setup](#local-database-setup)
7. [Run (Dev/Prod Local)](#run-devprod-local)
8. [API Documentation (Swagger)](#api-documentation-swagger)
9. [Auth Flow (Quick)](#auth-flow-quick)
10. [Endpoints & Sample Payloads](#endpoints--sample-payloads)
11. [Testing (Jest)](#testing-jest)
12. [Deploy to Railway](#deploy-to-railway)
13. [Connect with DBeaver](#connect-with-dbeaver)
14. [Security & Good Practices](#security--good-practices)
15. [Prisma 7 Note](#prisma-7-note)
16. [License](#license)

---

## Architecture (Quick)

- **NestJS** (modules, DI) for controllers/services.
- **Prisma** ORM for PostgreSQL access.
- **JWT** for authentication.
- **class-validator** for input validation.
- **Swagger** for auto docs.
- **Jest** for unit tests.

**ERD (simplified)**

User (1) ───< Account (M)

Account (1) ───< Transaction (M) >─── (1) Account
^ performedById -> User


Key columns:
- `User`: `id`, `email` (UNIQUE), `name`, `password(bcrypt)`, `createdAt`, `updatedAt`
- `Account`: `id`, `accountNumber` (UNIQUE), `balance` (DECIMAL(14,2)), `userId`
- `Transaction`: `id`, `type` ('DEPOSIT' | 'WITHDRAW' | 'TRANSFER'), `amount`, `fromAccountId?`, `toAccountId?`, `performedById`, `createdAt`

---

## Tech Stack & Versions
- Node.js **≥ 18.18**
- NestJS 11
- Prisma 6
- PostgreSQL (local or managed / Railway)
- Jest 29

---

## Project Structure

src/
auth/
auth.controller.ts
auth.service.ts
jwt.strategy.ts
jwt-auth.guard.ts
common/
decorators/current-user.decorator.ts
accounts/
accounts.controller.ts
accounts.service.ts
dto/
create-account.dto.ts
update-account.dto.ts
transactions/
transactions.controller.ts
transactions.service.ts
dto/
deposit-withdraw.dto.ts
transfer.dto.ts
prisma/
prisma.service.ts
app.module.ts
main.ts
prisma/
schema.prisma
seed.ts
migrations/
test/
auth.service.spec.ts
transactions.service.spec.ts

---

## Requirements
- Node.js **≥ 18.18**
- PostgreSQL (local Docker or any instance; Railway recommended for quick deploy)

---

## Environment Variables

Create a `.env` file (for **local**):

```env
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:ezPymchCBGDLVMiJiomJusgUChsrzqHm@yamabiko.proxy.rlwy.net:28348/railway"

# JWT
JWT_SECRET="fbfd73c97a9dc7a42ab03ce7aa3a8a79"
JWT_EXPIRES_IN="1d"

## Local Database Setup

npm install
npx prisma generate
npx prisma migrate dev -n "init"   # creates & applies migrations to your local DB
npm run seed 

## Run (Dev/Prod Local)

- Development
npm run start:dev
# https://milestone-4-fikrifirdauscn-production.up.railway.app/

- Production (local)
npm run build
npm run start:prod

- Useful scripts
npm run migrate:dev        # create & apply dev migrations
npm run migrate:deploy     # apply migrations to prod/remote DB (e.g., Railway)
npm run db:push            # dev-only: push schema quickly (no migration files)
npm run seed               # prisma db seed
npm test                   # run tests

## API Documentation (Swagger)

Once the app is running:
Open: /docs (e.g., https://milestone-4-fikrifirdauscn-production.up.railway.app/docs)
Click Authorize → paste Bearer <access_token>
Try endpoints: Auth, Accounts, Transactions

## Auth Flow (Quick)

1. POST /auth/register → create user
2. POST /auth/login → get access_token
3. Use token in Swagger Authorize or set Authorization: Bearer <token>
4. Access protected endpoints (accounts/transactions)

## Endpoints & Sample Payloads

A. Auth
  - POST /auth/register
  { "name": "John Doe", "email": "john@example.com", "password": "password123" }
  - POST /auth/login
  { "email": "john@example.com", "password": "password123" }
  Response
  { "access_token": "..." }
  - GET /auth/me (JWT)
B. Accounts (JWT; only your own resources)
  - POST /accounts
  { "accountNumber": "9000000010", "balance": 0 }
  - GET /accounts – list my accounts
  - GET /accounts/:id – get one of my accounts
  - PATCH /accounts/:id
  { "accountNumber": "9000000099" }
  - DELETE /accounts/:id
C. Transactions (JWT)
  - POST /transactions/deposit
  { "accountId": 1, "amount": 1000 }
  - POST /transactions/withdraw
  { "accountId": 1, "amount": 500 }
  - If insufficient funds → 400 Bad Request
  { "message": "Insufficient balance" }
  - POST /transactions/transfer
  { "fromAccountId": 1, "toAccountId": 2, "amount": 250 }
  - GET /transactions/me – list transactions involving my accounts

## Testing (Jest)

npm test

Included tests:
Auth: hashes password on register; login fails for wrong password.
Transactions: deposit increases balance; withdraw throws if insufficient balance.
Tests use simple mocks for PrismaService/JwtService.

## Deploy to Railway

1) Create project
Add PostgreSQL plugin in Railway.
Add Backend Service (connect your GitHub repo).

2) Variables (Backend Service)
DATABASE_URL → from Railway PostgreSQL → append ?sslmode=require

postgresql://USER:PASSWORD@HOST.railway.app:PORT/railway?sslmode=require

JWT_SECRET → strong value
JWT_EXPIRES_IN → e.g., 1d

3) Build & Start
Build Command: npm run build
Start Command: npm run start:migrate
This runs prisma migrate deploy before starting NestJS.

4) First-time migrations & seed

npx prisma migrate deploy
npx prisma db seed

5) Verify
Open your Railway URL → /docs
Register → Login → Authorize → try a few endpoints

## Connect with DBeaver

New Connection → PostgreSQL
Host: HOST.railway.app
Port: <PORT from Railway>
Database: railway
User / Password: from Railway
SSL: enable Use SSL → set SSL mode: require
Test connection → Finish
Expand Schemas → public → see User / Account / Transaction tables

## Security & Good Practices
- Ownership checks on all private resources.
- Hash passwords with bcrypt.
- JWT with strong JWT_SECRET; rotate if needed.
- Validate input using class-validator DTOs.
- Consistent HTTP codes: 400/401/403/404 for invalid/unauthorized cases.
- Production: use migrate deploy (avoid db push in prod).
- Consider rate limiting (@nestjs/throttler) & pagination for list endpoints.

## License
> Built by **fikrifirdauscn**


