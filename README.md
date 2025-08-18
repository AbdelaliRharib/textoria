# 🚀 TEXTORIA - AI Marketing Content Generation Platform

TEXTORIA is an AI-powered platform specialized in generating professional content for LinkedIn, marketing agencies, communication companies, and digital marketing professionals. It creates high-quality text and visual content using advanced AI models like GPT-4 and DALL-E 3.

## 🎯 Features

### Text Generation
- LinkedIn Posts & Professional Content
- Email Marketing Campaigns
- Brand Slogans & Messaging
- Marketing Copy & Call-to-Actions
- Business Communication Materials

### Image Generation
- Brand Logos & Visual Identity
- Marketing Posters & Campaign Visuals
- Social Media Graphics
- Business Presentations
- Digital Marketing Assets

### Admin Dashboard
- User Management, Analytics, Content Moderation
- Subscription Management, System Monitoring

## 🏗️ Architecture

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL
- **AI**: OpenAI GPT & DALL-E Integration
- **Authentication**: JWT + OAuth

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm run install-all
   ```

2. **Setup Database**
   - Install PostgreSQL
   - Create database: `textoria`
   - Update `.env` with database credentials

3. **Environment Variables**
   ```bash
   # Backend (.env in server folder)
   DATABASE_URL=postgresql://username:password@localhost:5432/textoria
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_key
   PORT=5000

   # Frontend (.env.local in client folder)
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Run Development Servers**
   ```bash
   npm run dev
   ```

5. **Access Applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Dashboard: http://localhost:3000/admin

## 📊 Subscription Plans

- **Free**: 100 generations/month
- **Premium**: 1,000 generations/month
- **Enterprise**: 10,000+ generations/month

## 🔧 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL, Prisma
- **AI**: OpenAI API (GPT-4, DALL-E 3)
- **Auth**: JWT, bcrypt, OAuth
- **Specialization**: Digital Marketing, LinkedIn, Business Communication
- **Deployment**: Docker ready

## 📁 Project Structure

```
textoria/
├── client/          # Next.js Frontend
├── server/          # Express Backend
├── database/        # Database migrations & seeds
└── docs/           # Documentation
```

## 🛡️ Security Features

- JWT Authentication
- Password Hashing (bcrypt)
- Rate Limiting
- CORS Protection
- Input Validation

## 📈 Analytics & Monitoring

- User Usage Tracking
- Generation Analytics
- Performance Monitoring
- Admin Dashboard

---

**Built with ❤️ for content creators worldwide**
