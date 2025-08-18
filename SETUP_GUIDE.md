# TEXTORIA Setup Guide

## Prerequisites
- Node.js v18+
- PostgreSQL v14+
- Git

## Database Setup
1. Install PostgreSQL
2. Create database: `CREATE DATABASE textoria;`
3. Import dump: `psql -U postgres -d textoria -f database_dump.sql`

## Backend Setup
```bash
cd server
npm install
copy .env.example .env
# Edit .env with your database URL
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm start
```

## Frontend Setup
```bash
cd client
npm install
copy .env.example .env.local
# Edit .env.local with API URL
npm run dev
```

## Default Admin
- Email: admin@textoria.com
- Password: admin123

## URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Admin: http://localhost:3000/admin
