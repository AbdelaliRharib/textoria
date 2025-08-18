# 🚀 Configuration Rapide TEXTORIA

## ⚡ Setup Express (5 minutes)

### 1. Configuration Base de Données
```bash
# Option A: SQLite (Recommandé pour test rapide)
# Modifier server/.env
DATABASE_URL="file:./dev.db"

# Option B: PostgreSQL (Production)
# Installer PostgreSQL et créer une base de données
DATABASE_URL="postgresql://username:password@localhost:5432/textoria"
```

### 2. Configuration OpenAI
```bash
# Le fichier .env contient déjà votre clé OpenAI
OPENAI_API_KEY="your-openai-api-key-here"
```

### 3. Initialiser la Base de Données
```bash
cd server
npx prisma generate
npx prisma db push
node create-admin.js
```

### 4. Démarrer TEXTORIA
```bash
# Dans le dossier racine
npm run dev
```

## 🎯 Accès Rapide

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Admin**: admin@textoria.com / admin123

## 🧪 Test Immédiat

1. **Connexion Admin**
   - Email: admin@textoria.com
   - Mot de passe: admin123

2. **Test LinkedIn Post**
   - Catégorie: "LinkedIn Posts"
   - Prompt: "L'IA révolutionne le marketing digital en 2024"

3. **Test Image Marketing**
   - Type: IMAGE
   - Prompt: "Logo moderne pour agence marketing digital"

## ✅ TEXTORIA est Prêt !

Votre plateforme de génération de contenu marketing est maintenant opérationnelle avec :
- ✅ GPT-4 pour le texte
- ✅ DALL-E 3 pour les images
- ✅ Spécialisation marketing digital
- ✅ Interface professionnelle
