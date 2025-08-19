# TEXTORIA - AI Content Generation Platform

<!-- Trigger Netlify rebuild -->

## Quick Start

### **Prerequisites**
- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key (for AI generation)

### **1. Clone and Install**
```bash
git clone https://github.com/AbdelaliRharib/textoria.git
cd textoria
npm run install-all
```

### **2. Database Setup**
```bash
# Install PostgreSQL (if not already installed)
# Windows: Download from postgresql.org
# macOS: brew install postgresql && brew services start postgresql
# Linux: sudo apt install postgresql postgresql-contrib

# Create database
psql -U postgres
CREATE DATABASE textoria;
\q
```

### **3. Environment Configuration**
```bash
# Backend setup
cd server
npm run setup
# This will create .env file with your OpenAI API key

# Frontend setup
cd ../client
# Create .env.local if needed
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

### **4. Database Migration**
```bash
cd server
npm run db:setup
npm run db:seed
npm run create-admin
```

### **5. Start Development Servers**
```bash
# From project root
npm run dev
```

### **6. Access Applications**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Dashboard**: http://localhost:3000/admin
- **Health Check**: http://localhost:5000/health

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
│   ├── app/         # App Router pages
│   ├── contexts/    # React contexts
│   └── config/      # API configuration
├── server/          # Express Backend
│   ├── routes/      # API endpoints
│   ├── middleware/  # Auth & validation
│   ├── prisma/      # Database schema
│   └── config/      # Passport config
└── docs/           # Documentation
```

## 🚀 Deployment

### **Frontend (Vercel)**
```bash
# Deploy to Vercel
vercel --prod
```

### **Backend (Railway/Render)**
```bash
# Railway deployment
railway up

# Render deployment
# Use render.yaml configuration
```

### **Environment Variables for Production**
- `DATABASE_URL`: Production PostgreSQL URL
- `JWT_SECRET`: Secure JWT secret
- `OPENAI_API_KEY`: OpenAI API key
- `CORS_ORIGIN`: Frontend URL
- `NODE_ENV`: production

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

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT and DALL-E APIs
- Next.js team for the amazing framework
- Prisma for the excellent ORM
- All contributors and users

---

**Built with ❤️ for content creators worldwide**
